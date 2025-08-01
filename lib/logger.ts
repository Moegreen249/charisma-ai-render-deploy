/**
 * Production-safe logging utility
 * Only logs in development environment to prevent information disclosure
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  requestId?: string;
  action?: string;
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.info(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorInfo = error instanceof Error ? { 
      message: error.message, 
      stack: this.isDevelopment ? error.stack : undefined 
    } : error;
    
    const fullContext = { ...context, error: errorInfo };
    console.error(this.formatMessage('error', message, fullContext));
  }

  // For tracking user actions and system events
  audit(action: string, context: LogContext): void {
    // Always log audit events (they don't contain sensitive info)
    console.info(this.formatMessage('info', `AUDIT: ${action}`, context));
  }
}

export const logger = new Logger();