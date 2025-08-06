/**
 * Security utilities for input validation, sanitization, and rate limiting
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from './logger';

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiting configuration
 */
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  identifier?: (req: NextRequest) => string; // Custom identifier function
}

/**
 * Default rate limit configurations
 */
export const RATE_LIMITS = {
  AUTH: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 requests per 15 minutes
  API: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 requests per minute
  ANALYSIS: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 analyses per minute
  UPLOAD: { windowMs: 60 * 1000, maxRequests: 20 }, // 20 uploads per minute
};

/**
 * Apply rate limiting to a request
 */
export function applyRateLimit(
  req: NextRequest,
  config: RateLimitConfig
): { success: boolean; remaining?: number; resetTime?: number } {
  const identifier = config.identifier 
    ? config.identifier(req)
    : getClientIdentifier(req);

  const now = Date.now();
  const key = `${identifier}:${req.nextUrl.pathname}`;
  
  // Clean up expired entries
  const existing = rateLimitStore.get(key);
  if (existing && now > existing.resetTime) {
    rateLimitStore.delete(key);
  }

  // Get or create rate limit entry
  const entry = rateLimitStore.get(key) || {
    count: 0,
    resetTime: now + config.windowMs
  };

  entry.count++;
  rateLimitStore.set(key, entry);

  const remaining = Math.max(0, config.maxRequests - entry.count);
  const success = entry.count <= config.maxRequests;

  if (!success) {
    logger.warn('Rate limit exceeded', {
      identifier,
      path: req.nextUrl.pathname,
      count: entry.count,
      maxRequests: config.maxRequests
    });
  }

  return {
    success,
    remaining,
    resetTime: entry.resetTime
  };
}

/**
 * Get client identifier for rate limiting
 */
function getClientIdentifier(req: NextRequest): string {
  // Try to get IP from various headers
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const remoteAddr = req.headers.get('remote-addr');
  
  const ip = forwarded?.split(',')[0] || realIp || remoteAddr || 'unknown';
  return ip.trim();
}

/**
 * Validate request body against schema
 */
export async function validateRequestBody<T>(
  req: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);
    
    if (!result.success) {
      const errorMessage = result.error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      
      logger.warn('Request validation failed', {
        path: req.nextUrl.pathname,
        errors: result.error.errors
      });
      
      return {
        success: false,
        error: `Validation failed: ${errorMessage}`
      };
    }
    
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    logger.error('Failed to parse request body', error);
    return {
      success: false,
      error: 'Invalid JSON in request body'
    };
  }
}

/**
 * Sanitize user input to prevent XSS and injection attacks
 */
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/data:text\/html/gi, '')
      .trim();
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (input && typeof input === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}

/**
 * Validate file upload
 */
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  // Check file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'File size exceeds 10MB limit' };
  }
  
  // Check file type
  const allowedTypes = [
    'text/plain',
    'application/json',
    'text/csv',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not supported' };
  }
  
  // Check file name
  const sanitizedName = file.name
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
    .replace(/^\.+/, '')
    .substring(0, 255)
    .trim();
    
  if (sanitizedName !== file.name) {
    return { valid: false, error: 'Invalid characters in filename' };
  }
  
  return { valid: true };
}

/**
 * Create security headers for responses
 */
export function createSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.openai.com https://api.anthropic.com https://*.googleapis.com",
      "frame-ancestors 'none'",
    ].join('; '),
  };
}

/**
 * Create error response with security headers
 */
export function createErrorResponse(
  error: string,
  status: number = 400,
  details?: any
): NextResponse {
  const response = NextResponse.json(
    {
      error,
      ...(process.env.NODE_ENV === 'development' && details ? { details } : {})
    },
    { status }
  );
  
  // Add security headers
  const headers = createSecurityHeaders();
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

/**
 * Create success response with security headers
 */
export function createSuccessResponse(
  data: any,
  status: number = 200
): NextResponse {
  const response = NextResponse.json(data, { status });
  
  // Add security headers
  const headers = createSecurityHeaders();
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}