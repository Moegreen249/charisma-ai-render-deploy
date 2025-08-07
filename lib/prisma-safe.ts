/**
 * Safe Prisma client wrapper that handles database connection failures gracefully
 * This is especially important during build time when the database might not be available
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from './logger';

// Global flag to track database availability
let isDatabaseAvailable = true;
let lastConnectionCheck = 0;
const CONNECTION_CHECK_INTERVAL = 30000; // 30 seconds

// Create a safe Prisma client that handles connection errors
class SafePrismaClient extends PrismaClient {
  private isConnected = false;
  private connectionPromise: Promise<boolean> | null = null;

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      errorFormat: 'minimal',
    });
  }

  async checkConnection(): Promise<boolean> {
    const now = Date.now();
    
    // Use cached result if recent
    if (now - lastConnectionCheck < CONNECTION_CHECK_INTERVAL) {
      return isDatabaseAvailable;
    }

    // Prevent multiple simultaneous connection checks
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this.performConnectionCheck();
    const result = await this.connectionPromise;
    this.connectionPromise = null;
    
    lastConnectionCheck = now;
    isDatabaseAvailable = result;
    
    return result;
  }

  private async performConnectionCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      this.isConnected = true;
      return true;
    } catch (error) {
      this.isConnected = false;
      
      // Only log in development or if it's a new error
      if (process.env.NODE_ENV === 'development' || isDatabaseAvailable) {
        logger.warn('Database connection failed:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
      
      return false;
    }
  }

  // Override query methods to check connection first
  $queryRaw<T = unknown>(...args: Parameters<PrismaClient['$queryRaw']>): Prisma.PrismaPromise<T> {
    const checkAndExecute = async (): Promise<T> => {
      if (!(await this.checkConnection())) {
        throw new Error('Database not available');
      }
      return super.$queryRaw<T>(...args);
    };
    
    return checkAndExecute() as Prisma.PrismaPromise<T>;
  }

  $executeRaw(...args: Parameters<PrismaClient['$executeRaw']>): Prisma.PrismaPromise<number> {
    const checkAndExecute = async (): Promise<number> => {
      if (!(await this.checkConnection())) {
        throw new Error('Database not available');
      }
      return super.$executeRaw(...args);
    };
    
    return checkAndExecute() as Prisma.PrismaPromise<number>;
  }
}

// Create singleton instance
const globalForPrisma = globalThis as unknown as {
  prisma: SafePrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new SafePrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Safe database operation wrapper
export async function withDatabaseFallback<T>(
  operation: () => Promise<T>,
  fallback: T,
  operationName?: string
): Promise<T> {
  try {
    const isAvailable = await prisma.checkConnection();
    if (!isAvailable) {
      if (operationName && process.env.NODE_ENV === 'development') {
        logger.warn(`Database unavailable for ${operationName}, using fallback`);
      }
      return fallback;
    }
    
    return await operation();
  } catch (error) {
    if (operationName && process.env.NODE_ENV === 'development') {
      logger.warn(`Database operation failed for ${operationName}:`, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    return fallback;
  }
}

// Retry wrapper for critical operations
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
}

export default prisma;