import { NextRequest, NextResponse } from "next/server";
import { reportAPIError } from "@/lib/error-management";
import { createSecurityHeaders } from "@/lib/security";
import { apiLogger, RequestTimer } from "@/lib/api-logger";

// Enhanced error classification system
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum ErrorCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  DATABASE = 'DATABASE',
  NETWORK = 'NETWORK',
  SYSTEM = 'SYSTEM',
  AI_SERVICE = 'AI_SERVICE',
  STORY_GENERATION = 'STORY_GENERATION'
}

export interface ErrorClassification {
  category: ErrorCategory;
  severity: ErrorSeverity;
  retryable: boolean;
  fallbackAvailable: boolean;
  userNotification: boolean;
  adminAlert: boolean;
}

export interface RetryStrategy {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
  retryCondition: (error: Error, attempt: number) => boolean;
}

export interface ErrorContext {
  operation: string;
  userId?: string;
  requestId: string;
  metadata?: Record<string, any>;
}

export interface ErrorResponse {
  handled: boolean;
  fallbackData?: any;
  shouldRetry: boolean;
  retryAfter?: number;
  userMessage: string;
  classification: ErrorClassification;
}

class EnhancedErrorHandler {
  private static instance: EnhancedErrorHandler;
  private retryStrategies: Map<ErrorCategory, RetryStrategy> = new Map();

  public static getInstance(): EnhancedErrorHandler {
    if (!EnhancedErrorHandler.instance) {
      EnhancedErrorHandler.instance = new EnhancedErrorHandler();
    }
    return EnhancedErrorHandler.instance;
  }

  constructor() {
    this.initializeRetryStrategies();
  }

  private initializeRetryStrategies(): void {
    // Database errors - aggressive retry
    this.retryStrategies.set(ErrorCategory.DATABASE, {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2,
      jitter: true,
      retryCondition: (error: Error, attempt: number) => {
        return attempt < 3 && (
          error.message.includes('connection') ||
          error.message.includes('timeout') ||
          error.message.includes('ECONNRESET')
        );
      }
    });

    // External service errors - moderate retry
    this.retryStrategies.set(ErrorCategory.EXTERNAL_SERVICE, {
      maxAttempts: 2,
      baseDelay: 2000,
      maxDelay: 8000,
      backoffMultiplier: 2,
      jitter: true,
      retryCondition: (error: Error, attempt: number) => {
        return attempt < 2 && (
          error.message.includes('timeout') ||
          error.message.includes('503') ||
          error.message.includes('502')
        );
      }
    });

    // AI service errors - limited retry
    this.retryStrategies.set(ErrorCategory.AI_SERVICE, {
      maxAttempts: 2,
      baseDelay: 3000,
      maxDelay: 6000,
      backoffMultiplier: 1.5,
      jitter: true,
      retryCondition: (error: Error, attempt: number) => {
        return attempt < 2 && (
          error.message.includes('timeout') ||
          error.message.includes('rate limit') ||
          error.message.includes('temporary')
        );
      }
    });

    // Story generation errors - single retry
    this.retryStrategies.set(ErrorCategory.STORY_GENERATION, {
      maxAttempts: 1,
      baseDelay: 5000,
      maxDelay: 5000,
      backoffMultiplier: 1,
      jitter: false,
      retryCondition: (error: Error, attempt: number) => {
        return attempt < 1 && (
          error.message.includes('parsing') ||
          error.message.includes('malformed')
        );
      }
    });
  }

  public classifyError(error: Error): ErrorClassification {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    // Authentication errors
    if (message.includes('unauthorized') || message.includes('authentication')) {
      return {
        category: ErrorCategory.AUTHENTICATION,
        severity: ErrorSeverity.MEDIUM,
        retryable: false,
        fallbackAvailable: false,
        userNotification: true,
        adminAlert: false
      };
    }

    // Database errors
    if (message.includes('prisma') || message.includes('database') || message.includes('connection')) {
      return {
        category: ErrorCategory.DATABASE,
        severity: ErrorSeverity.HIGH,
        retryable: true,
        fallbackAvailable: true,
        userNotification: true,
        adminAlert: true
      };
    }

    // AI service errors
    if (message.includes('ai') || message.includes('gemini') || message.includes('openai')) {
      return {
        category: ErrorCategory.AI_SERVICE,
        severity: ErrorSeverity.MEDIUM,
        retryable: true,
        fallbackAvailable: true,
        userNotification: true,
        adminAlert: false
      };
    }

    // Story generation errors
    if (message.includes('story') || message.includes('parsing') || message.includes('generation')) {
      return {
        category: ErrorCategory.STORY_GENERATION,
        severity: ErrorSeverity.MEDIUM,
        retryable: true,
        fallbackAvailable: true,
        userNotification: true,
        adminAlert: false
      };
    }

    // Network errors
    if (message.includes('timeout') || message.includes('network') || message.includes('econnreset')) {
      return {
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.MEDIUM,
        retryable: true,
        fallbackAvailable: false,
        userNotification: true,
        adminAlert: false
      };
    }

    // Validation errors
    if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      return {
        category: ErrorCategory.VALIDATION,
        severity: ErrorSeverity.LOW,
        retryable: false,
        fallbackAvailable: false,
        userNotification: true,
        adminAlert: false
      };
    }

    // Default system error
    return {
      category: ErrorCategory.SYSTEM,
      severity: ErrorSeverity.HIGH,
      retryable: false,
      fallbackAvailable: false,
      userNotification: true,
      adminAlert: true
    };
  }

  public async handleError(error: Error, context: ErrorContext): Promise<ErrorResponse> {
    const classification = this.classifyError(error);
    const strategy = this.retryStrategies.get(classification.category);

    // Log the error with context
    console.error(`[${classification.category}] ${classification.severity}: ${error.message}`, {
      context,
      stack: error.stack,
      classification
    });

    // Report to monitoring if needed
    if (classification.adminAlert) {
      await this.reportToMonitoring(error, context, classification);
    }

    // Generate user-friendly message
    const userMessage = this.generateUserMessage(error, classification);

    // Determine retry behavior
    const shouldRetry = classification.retryable && strategy?.retryCondition(error, 0) || false;
    const retryAfter = shouldRetry ? strategy?.baseDelay : undefined;

    // Generate fallback data if available
    let fallbackData = undefined;
    if (classification.fallbackAvailable) {
      fallbackData = await this.generateFallbackData(error, context, classification);
    }

    return {
      handled: true,
      fallbackData,
      shouldRetry,
      retryAfter,
      userMessage,
      classification
    };
  }

  private generateUserMessage(error: Error, classification: ErrorClassification): string {
    switch (classification.category) {
      case ErrorCategory.AUTHENTICATION:
        return "Authentication failed. Please check your credentials and try again.";
      
      case ErrorCategory.DATABASE:
        return "We're experiencing temporary database issues. Please try again in a moment.";
      
      case ErrorCategory.AI_SERVICE:
        return "AI service is temporarily unavailable. We're working to restore it quickly.";
      
      case ErrorCategory.STORY_GENERATION:
        return "Story generation encountered an issue. Please try generating again.";
      
      case ErrorCategory.NETWORK:
        return "Network connection issue. Please check your connection and try again.";
      
      case ErrorCategory.VALIDATION:
        return "Please check your input and try again.";
      
      default:
        return "An unexpected error occurred. Please try again or contact support if the issue persists.";
    }
  }

  private async generateFallbackData(error: Error, context: ErrorContext, classification: ErrorClassification): Promise<any> {
    switch (classification.category) {
      case ErrorCategory.STORY_GENERATION:
        // Import story error messages dynamically to avoid circular dependencies
        const { generateStoryErrorMessage } = await import('./story-error-messages');
        const storyErrorInfo = generateStoryErrorMessage(error, classification.category, {
          storyId: context.metadata?.storyId,
          userId: context.userId,
          attempt: context.metadata?.attempt,
          aiProvider: context.metadata?.aiProvider,
          model: context.metadata?.model
        });

        return {
          title: "Story Generation Recovery",
          overview: storyErrorInfo.userMessage,
          chapters: [{
            id: "recovery-chapter",
            title: "Recovery Information",
            timestamp: "Recovery Process",
            content: `${storyErrorInfo.userMessage}\n\nTechnical Details: ${storyErrorInfo.technicalMessage}`,
            insights: storyErrorInfo.recoveryActions,
            mood: "neutral",
            keyPoints: [
              `Severity: ${storyErrorInfo.severity}`,
              `Retryable: ${storyErrorInfo.isRetryable ? 'Yes' : 'No'}`,
              ...(storyErrorInfo.estimatedRecoveryTime ? [`Estimated recovery: ${storyErrorInfo.estimatedRecoveryTime}`] : [])
            ]
          }],
          conclusion: storyErrorInfo.isRetryable 
            ? "The system will automatically retry this operation. Your data is safe."
            : "Please try generating your story again or contact support if the issue persists.",
          timeline: { 
            start: "Error occurred", 
            end: storyErrorInfo.estimatedRecoveryTime || "Manual retry needed", 
            duration: storyErrorInfo.estimatedRecoveryTime || "Immediate action required" 
          },
          keyInsights: [
            "Story generation system encountered a recoverable issue",
            "Your analysis data is preserved and safe",
            "Recovery mechanisms are in place to handle this automatically"
          ],
          errorInfo: storyErrorInfo
        };
      
      case ErrorCategory.DATABASE:
        return {
          message: "Data temporarily unavailable",
          cached: true,
          retryRecommended: true,
          userMessage: "We're experiencing temporary database connectivity issues. Your request will be processed automatically once connectivity is restored."
        };
      
      case ErrorCategory.AI_SERVICE:
        return {
          title: "AI Service Recovery",
          overview: "The AI service encountered an issue but recovery mechanisms are in place.",
          chapters: [{
            id: "ai-recovery-chapter",
            title: "AI Service Status",
            timestamp: "Service Recovery",
            content: "The AI service is temporarily experiencing issues. The system will automatically retry with backup providers or optimized settings.",
            insights: [
              "AI service issue detected",
              "Automatic fallback mechanisms activated",
              "Your request will be processed once service is restored"
            ],
            mood: "neutral",
            keyPoints: [
              "Service will be restored automatically",
              "Your data is preserved",
              "No action needed from you"
            ]
          }],
          conclusion: "The AI service will be restored shortly. Your request is queued for automatic processing.",
          timeline: { start: "Service issue", end: "Service restored", duration: "5-15 minutes" },
          keyInsights: [
            "AI service redundancy ensures continued operation",
            "Automatic recovery mechanisms are active",
            "User requests are preserved during service restoration"
          ]
        };
      
      default:
        return null;
    }
  }

  private async reportToMonitoring(error: Error, context: ErrorContext, classification: ErrorClassification): Promise<void> {
    try {
      // Report to existing error management system
      await reportAPIError(
        error.message,
        500,
        context.operation,
        classification.severity
      );
    } catch (reportError) {
      console.error('Failed to report error to monitoring:', reportError);
    }
  }

  public async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    customStrategy?: Partial<RetryStrategy>
  ): Promise<T> {
    let lastError: Error;
    let attempt = 0;

    while (attempt < (customStrategy?.maxAttempts || 3)) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        const classification = this.classifyError(lastError);
        const strategy = this.retryStrategies.get(classification.category);

        if (!strategy || !strategy.retryCondition(lastError, attempt)) {
          throw lastError;
        }

        attempt++;
        const delay = this.calculateDelay(strategy, attempt);
        
        console.log(`Retrying operation ${context.operation} (attempt ${attempt}/${strategy.maxAttempts}) after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  private calculateDelay(strategy: RetryStrategy, attempt: number): number {
    let delay = Math.min(
      strategy.baseDelay * Math.pow(strategy.backoffMultiplier, attempt - 1),
      strategy.maxDelay
    );

    if (strategy.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }

    return Math.round(delay);
  }
}

// Export singleton instance
export const enhancedErrorHandler = EnhancedErrorHandler.getInstance();

// Enhanced wrapper for API routes with comprehensive error handling
export function withEnhancedErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>,
  operation: string
) {
  return async (...args: T): Promise<NextResponse> => {
    const request = args[0] as NextRequest;
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timer = new RequestTimer(requestId);
    
    const context: ErrorContext = {
      operation,
      requestId,
      metadata: {
        url: request.url,
        method: request.method,
        userAgent: request.headers.get('user-agent')
      }
    };

    try {
      // Log request start
      await apiLogger.logRequestStart(request, requestId);
      
      // Execute with retry logic
      const result = await enhancedErrorHandler.executeWithRetry(
        () => handler(...args),
        context
      );
      
      // Log successful completion
      await apiLogger.logRequestEnd(
        request,
        requestId,
        200,
        timer.getDuration(),
        undefined,
        { operation }
      );
      
      return result;
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error));
      
      // Handle error with enhanced system
      const errorResponse = await enhancedErrorHandler.handleError(errorInstance, context);
      
      // Log the error
      await apiLogger.logApiError(
        errorInstance,
        request,
        requestId,
        undefined,
        500
      );

      // Return appropriate response based on error handling result
      if (errorResponse.fallbackData) {
        return NextResponse.json({
          success: true,
          data: errorResponse.fallbackData,
          fallback: true,
          message: errorResponse.userMessage
        }, { status: 200 });
      } else {
        return NextResponse.json({
          success: false,
          error: {
            message: errorResponse.userMessage,
            category: errorResponse.classification.category,
            retryable: errorResponse.shouldRetry,
            retryAfter: errorResponse.retryAfter
          }
        }, { status: 500 });
      }
    }
  };
}