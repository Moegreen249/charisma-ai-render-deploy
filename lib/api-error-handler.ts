import { NextResponse, NextRequest } from "next/server";
import { reportAPIError } from "@/lib/error-management";
import { createSecurityHeaders } from "@/lib/security";
import { apiLogger, RequestTimer } from "@/lib/api-logger";

// Standardized API error codes
export enum ApiErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  
  // Resource errors
  NOT_FOUND = "NOT_FOUND",
  RESOURCE_EXISTS = "RESOURCE_EXISTS",
  
  // Validation errors
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",
  
  // Business logic errors
  STORY_NOT_COMPLETED = "STORY_NOT_COMPLETED",
  STORY_GENERATION_FAILED = "STORY_GENERATION_FAILED",
  OPERATION_NOT_ALLOWED = "OPERATION_NOT_ALLOWED",
  
  // System errors
  DATABASE_ERROR = "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  
  // Network errors
  TIMEOUT = "TIMEOUT",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
}

// Standardized error response interface
export interface ApiErrorResponse {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
    details?: any;
    timestamp: string;
    requestId?: string;
    retryable: boolean;
    retryAfter?: number; // seconds
  };
}

// Success response interface
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  timestamp: string;
  requestId?: string;
}

// Error mapping for HTTP status codes
const ERROR_STATUS_MAP: Record<ApiErrorCode, number> = {
  [ApiErrorCode.UNAUTHORIZED]: 401,
  [ApiErrorCode.FORBIDDEN]: 403,
  [ApiErrorCode.TOKEN_EXPIRED]: 401,
  [ApiErrorCode.NOT_FOUND]: 404,
  [ApiErrorCode.RESOURCE_EXISTS]: 409,
  [ApiErrorCode.VALIDATION_ERROR]: 400,
  [ApiErrorCode.INVALID_INPUT]: 400,
  [ApiErrorCode.MISSING_REQUIRED_FIELD]: 400,
  [ApiErrorCode.STORY_NOT_COMPLETED]: 400,
  [ApiErrorCode.STORY_GENERATION_FAILED]: 422,
  [ApiErrorCode.OPERATION_NOT_ALLOWED]: 403,
  [ApiErrorCode.DATABASE_ERROR]: 500,
  [ApiErrorCode.EXTERNAL_SERVICE_ERROR]: 502,
  [ApiErrorCode.INTERNAL_SERVER_ERROR]: 500,
  [ApiErrorCode.RATE_LIMIT_EXCEEDED]: 429,
  [ApiErrorCode.TIMEOUT]: 408,
  [ApiErrorCode.SERVICE_UNAVAILABLE]: 503,
};

// Retryable error codes
const RETRYABLE_ERRORS = new Set([
  ApiErrorCode.DATABASE_ERROR,
  ApiErrorCode.EXTERNAL_SERVICE_ERROR,
  ApiErrorCode.INTERNAL_SERVER_ERROR,
  ApiErrorCode.TIMEOUT,
  ApiErrorCode.SERVICE_UNAVAILABLE,
]);

// User-friendly error messages
const ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  [ApiErrorCode.UNAUTHORIZED]: "Authentication required. Please log in to continue.",
  [ApiErrorCode.FORBIDDEN]: "You don't have permission to perform this action.",
  [ApiErrorCode.TOKEN_EXPIRED]: "Your session has expired. Please log in again.",
  [ApiErrorCode.NOT_FOUND]: "The requested resource was not found.",
  [ApiErrorCode.RESOURCE_EXISTS]: "A resource with this identifier already exists.",
  [ApiErrorCode.VALIDATION_ERROR]: "The provided data is invalid.",
  [ApiErrorCode.INVALID_INPUT]: "Invalid input provided. Please check your data and try again.",
  [ApiErrorCode.MISSING_REQUIRED_FIELD]: "Required fields are missing from your request.",
  [ApiErrorCode.STORY_NOT_COMPLETED]: "This story is not yet completed and cannot be processed.",
  [ApiErrorCode.STORY_GENERATION_FAILED]: "Story generation failed. Please try again.",
  [ApiErrorCode.OPERATION_NOT_ALLOWED]: "This operation is not allowed for the current resource state.",
  [ApiErrorCode.DATABASE_ERROR]: "A database error occurred. Please try again later.",
  [ApiErrorCode.EXTERNAL_SERVICE_ERROR]: "An external service is temporarily unavailable.",
  [ApiErrorCode.INTERNAL_SERVER_ERROR]: "An internal server error occurred. Please try again later.",
  [ApiErrorCode.RATE_LIMIT_EXCEEDED]: "Too many requests. Please wait before trying again.",
  [ApiErrorCode.TIMEOUT]: "The request timed out. Please try again.",
  [ApiErrorCode.SERVICE_UNAVAILABLE]: "The service is temporarily unavailable. Please try again later.",
};

// Generate unique request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Create standardized error response
export function createApiErrorResponse(
  code: ApiErrorCode,
  customMessage?: string,
  details?: any,
  requestId?: string
): NextResponse<ApiErrorResponse> {
  const message = customMessage || ERROR_MESSAGES[code];
  const status = ERROR_STATUS_MAP[code];
  const retryable = RETRYABLE_ERRORS.has(code);
  const timestamp = new Date().toISOString();
  const finalRequestId = requestId || generateRequestId();

  // Report error for monitoring
  reportAPIError(
    message,
    status,
    undefined, // endpoint will be filled by the caller
    status >= 500 ? 'HIGH' : status >= 400 ? 'MEDIUM' : 'LOW'
  );

  const errorResponse: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      details: process.env.NODE_ENV === 'development' ? details : undefined,
      timestamp,
      requestId: finalRequestId,
      retryable,
      ...(code === ApiErrorCode.RATE_LIMIT_EXCEEDED && { retryAfter: 60 }),
    },
  };

  const response = NextResponse.json(errorResponse, { status });

  // Add security headers
  const headers = createSecurityHeaders();
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add request ID header
  response.headers.set('X-Request-ID', finalRequestId);

  return response;
}

// Create standardized success response
export function createApiSuccessResponse<T>(
  data: T,
  status: number = 200,
  requestId?: string
): NextResponse<ApiSuccessResponse<T>> {
  const timestamp = new Date().toISOString();
  const finalRequestId = requestId || generateRequestId();

  const successResponse: ApiSuccessResponse<T> = {
    success: true,
    data,
    timestamp,
    requestId: finalRequestId,
  };

  const response = NextResponse.json(successResponse, { status });

  // Add security headers
  const headers = createSecurityHeaders();
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add request ID header
  response.headers.set('X-Request-ID', finalRequestId);

  return response;
}

// Enhanced error handler wrapper for API routes
export function withApiErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>,
  endpoint?: string
) {
  return async (...args: T): Promise<NextResponse> => {
    const request = args[0] as NextRequest;
    const requestId = generateRequestId();
    const timer = new RequestTimer(requestId);
    
    // Log request start
    await apiLogger.logRequestStart(request, requestId);
    
    try {
      const result = await handler(...args);
      
      // Extract status code from response
      let statusCode = 200;
      if (result && typeof result === 'object' && 'status' in result) {
        statusCode = (result as any).status || 200;
      }
      
      // Log successful request completion
      await apiLogger.logRequestEnd(
        request,
        requestId,
        statusCode,
        timer.getDuration(),
        undefined, // userId would need to be extracted from session
        { endpoint }
      );
      
      return result;
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error));
      
      // Log the error with detailed information
      await apiLogger.logApiError(
        errorInstance,
        request,
        requestId,
        undefined, // userId would need to be extracted from session
        500
      );

      // Determine error type and create appropriate response
      let errorCode = ApiErrorCode.INTERNAL_SERVER_ERROR;
      let customMessage: string | undefined;
      let details: any;

      if (errorInstance.message.includes('Prisma') || errorInstance.message.includes('database')) {
        errorCode = ApiErrorCode.DATABASE_ERROR;
        details = { 
          originalError: errorInstance.message,
          endpoint,
          duration: timer.getDuration()
        };
        
        // Log database operation failure
        await apiLogger.logDatabaseOperation(
          'unknown',
          'unknown',
          requestId,
          timer.getDuration(),
          { error: errorInstance.message, failed: true }
        );
      } else if (errorInstance.message.includes('validation') || errorInstance.message.includes('invalid')) {
        errorCode = ApiErrorCode.VALIDATION_ERROR;
        customMessage = errorInstance.message;
      } else if (errorInstance.message.includes('timeout') || errorInstance.message.includes('ETIMEDOUT')) {
        errorCode = ApiErrorCode.TIMEOUT;
        details = { 
          duration: timer.getDuration(),
          endpoint 
        };
      } else if (errorInstance.message.includes('unauthorized') || errorInstance.message.includes('Unauthorized')) {
        errorCode = ApiErrorCode.UNAUTHORIZED;
      } else if (errorInstance.message.includes('not found') || errorInstance.message.includes('Not found')) {
        errorCode = ApiErrorCode.NOT_FOUND;
      } else {
        // Default internal server error
        details = { 
          originalError: errorInstance.message,
          endpoint,
          duration: timer.getDuration(),
          stack: process.env.NODE_ENV === 'development' ? errorInstance.stack : undefined
        };
      }

      return createApiErrorResponse(
        errorCode,
        customMessage,
        details,
        requestId
      );
    }
  };
}

// Utility function to validate required fields
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields = requiredFields.filter(field => 
    data[field] === undefined || data[field] === null || data[field] === ''
  );
  
  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

// Utility function to handle pagination validation
export function validatePaginationParams(
  page?: string | null,
  limit?: string | null
): { page: number; limit: number; offset: number } {
  const parsedPage = Math.max(1, parseInt(page || '1'));
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit || '10')));
  const offset = (parsedPage - 1) * parsedLimit;

  return { page: parsedPage, limit: parsedLimit, offset };
}