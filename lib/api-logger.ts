import { NextRequest } from "next/server";

// Log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

// Log entry interface
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string;
  userId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  userAgent?: string;
  ip?: string;
  metadata?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

// Logger class for API operations
class ApiLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  // Extract request metadata
  private extractRequestMetadata(request: NextRequest): {
    method: string;
    endpoint: string;
    userAgent?: string;
    ip?: string;
  } {
    const url = new URL(request.url);
    return {
      method: request.method,
      endpoint: url.pathname,
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 
          'unknown'
    };
  }

  // Format log entry for console output
  private formatConsoleLog(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const level = entry.level.padEnd(8);
    const requestInfo = entry.requestId ? `[${entry.requestId}]` : '';
    const endpointInfo = entry.endpoint ? `${entry.method} ${entry.endpoint}` : '';
    const statusInfo = entry.statusCode ? `(${entry.statusCode})` : '';
    const durationInfo = entry.duration ? `${entry.duration}ms` : '';
    
    let logLine = `${timestamp} ${level} ${requestInfo} ${endpointInfo} ${statusInfo} ${durationInfo} - ${entry.message}`;
    
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      logLine += `\n  Metadata: ${JSON.stringify(entry.metadata, null, 2)}`;
    }
    
    if (entry.error) {
      logLine += `\n  Error: ${entry.error.name}: ${entry.error.message}`;
      if (this.isDevelopment && entry.error.stack) {
        logLine += `\n  Stack: ${entry.error.stack}`;
      }
    }
    
    return logLine;
  }

  // Send logs to external service in production
  private async sendToExternalService(entry: LogEntry): Promise<void> {
    if (!this.isProduction) return;
    
    try {
      // In a real implementation, you would send to services like:
      // - DataDog, New Relic, Sentry, CloudWatch, etc.
      // For now, we'll just store in a hypothetical logging endpoint
      await fetch('/api/internal/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      // Fallback to console if external service fails
      console.error('Failed to send log to external service:', error);
    }
  }

  // Core logging method
  private async log(
    level: LogLevel,
    message: string,
    options: {
      requestId?: string;
      userId?: string;
      request?: NextRequest;
      statusCode?: number;
      duration?: number;
      metadata?: Record<string, any>;
      error?: Error;
    } = {}
  ): Promise<void> {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      requestId: options.requestId,
      userId: options.userId,
      statusCode: options.statusCode,
      duration: options.duration,
      metadata: options.metadata,
      ...(options.request && this.extractRequestMetadata(options.request)),
      ...(options.error && {
        error: {
          name: options.error.name,
          message: options.error.message,
          stack: options.error.stack
        }
      })
    };

    // Always log to console
    const formattedLog = this.formatConsoleLog(entry);
    
    switch (level) {
      case LogLevel.DEBUG:
        if (this.isDevelopment) console.debug(formattedLog);
        break;
      case LogLevel.INFO:
        console.info(formattedLog);
        break;
      case LogLevel.WARN:
        console.warn(formattedLog);
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(formattedLog);
        break;
    }

    // Send to external service in production
    if (level === LogLevel.ERROR || level === LogLevel.CRITICAL) {
      await this.sendToExternalService(entry);
    }
  }

  // Public logging methods
  async debug(message: string, options?: Parameters<typeof this.log>[2]): Promise<void> {
    await this.log(LogLevel.DEBUG, message, options);
  }

  async info(message: string, options?: Parameters<typeof this.log>[2]): Promise<void> {
    await this.log(LogLevel.INFO, message, options);
  }

  async warn(message: string, options?: Parameters<typeof this.log>[2]): Promise<void> {
    await this.log(LogLevel.WARN, message, options);
  }

  async error(message: string, options?: Parameters<typeof this.log>[2]): Promise<void> {
    await this.log(LogLevel.ERROR, message, options);
  }

  async critical(message: string, options?: Parameters<typeof this.log>[2]): Promise<void> {
    await this.log(LogLevel.CRITICAL, message, options);
  }

  // Request lifecycle logging
  async logRequestStart(
    request: NextRequest,
    requestId: string,
    userId?: string
  ): Promise<void> {
    await this.info('Request started', {
      requestId,
      userId,
      request,
      metadata: {
        headers: Object.fromEntries(request.headers.entries()),
        searchParams: Object.fromEntries(new URL(request.url).searchParams.entries())
      }
    });
  }

  async logRequestEnd(
    request: NextRequest,
    requestId: string,
    statusCode: number,
    duration: number,
    userId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const level = statusCode >= 500 ? LogLevel.ERROR : 
                  statusCode >= 400 ? LogLevel.WARN : 
                  LogLevel.INFO;
    
    await this.log(level, 'Request completed', {
      requestId,
      userId,
      request,
      statusCode,
      duration,
      metadata
    });
  }

  async logDatabaseOperation(
    operation: string,
    table: string,
    requestId?: string,
    duration?: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.debug(`Database ${operation} on ${table}`, {
      requestId,
      duration,
      metadata: {
        operation,
        table,
        ...metadata
      }
    });
  }

  async logApiError(
    error: Error,
    request: NextRequest,
    requestId: string,
    userId?: string,
    statusCode?: number
  ): Promise<void> {
    await this.error('API error occurred', {
      requestId,
      userId,
      request,
      statusCode,
      error,
      metadata: {
        errorType: error.constructor.name,
        isPrismaError: error.message.includes('Prisma'),
        isValidationError: error.message.includes('validation')
      }
    });
  }
}

// Export singleton instance
export const apiLogger = new ApiLogger();

// Request timing utility
export class RequestTimer {
  private startTime: number;
  private requestId: string;

  constructor(requestId: string) {
    this.startTime = Date.now();
    this.requestId = requestId;
  }

  getDuration(): number {
    return Date.now() - this.startTime;
  }

  async logDuration(operation: string, metadata?: Record<string, any>): Promise<void> {
    const duration = this.getDuration();
    await apiLogger.debug(`${operation} completed`, {
      requestId: this.requestId,
      duration,
      metadata
    });
  }
}

// Middleware-style logger for API routes
export function withRequestLogging<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  endpoint: string
) {
  return async (...args: T): Promise<R> => {
    const request = args[0] as NextRequest;
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timer = new RequestTimer(requestId);
    
    // Extract user ID if available (this would need to be adapted based on your auth setup)
    let userId: string | undefined;
    try {
      // This is a simplified example - you'd need to extract this properly
      const authHeader = request.headers.get('authorization');
      if (authHeader) {
        // Extract user ID from token or session
        // userId = extractUserIdFromAuth(authHeader);
      }
    } catch (error) {
      // Ignore auth extraction errors for logging
    }

    await apiLogger.logRequestStart(request, requestId, userId);

    try {
      const result = await handler(...args);
      
      // Extract status code from NextResponse if possible
      let statusCode = 200;
      if (result && typeof result === 'object' && 'status' in result) {
        statusCode = (result as any).status || 200;
      }
      
      await apiLogger.logRequestEnd(
        request,
        requestId,
        statusCode,
        timer.getDuration(),
        userId
      );
      
      return result;
    } catch (error) {
      await apiLogger.logApiError(
        error as Error,
        request,
        requestId,
        userId,
        500
      );
      throw error;
    }
  };
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  getMetricStats(name: string): {
    count: number;
    avg: number;
    min: number;
    max: number;
    p95: number;
  } | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const count = sorted.length;
    const sum = sorted.reduce((a, b) => a + b, 0);
    const avg = sum / count;
    const min = sorted[0];
    const max = sorted[count - 1];
    const p95Index = Math.floor(count * 0.95);
    const p95 = sorted[p95Index];

    return { count, avg, min, max, p95 };
  }

  async logMetrics(): Promise<void> {
    for (const [name, values] of this.metrics.entries()) {
      const stats = this.getMetricStats(name);
      if (stats) {
        await apiLogger.info(`Performance metric: ${name}`, {
          metadata: stats
        });
      }
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();