import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Enhanced Prisma configuration with connection pooling and timeouts
const createPrismaClient = () => {
  return new PrismaClient({
    // Reduce logging overhead - only log slow queries in development
    log: process.env.NODE_ENV === 'development' 
      ? [
          { level: 'query', emit: 'event' },
          { level: 'error', emit: 'stdout' },
          { level: 'warn', emit: 'stdout' }
        ] 
      : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Optimize transaction settings
    transactionOptions: {
      timeout: 5000, // Reduced from 10 seconds
      maxWait: 2000, // Reduced from 5 seconds  
      isolationLevel: 'ReadCommitted',
    },
  })
}

// Add query performance monitoring in development
if (process.env.NODE_ENV === 'development') {
  const prismaClient = createPrismaClient() as any;
  prismaClient.$on('query', (e: any) => {
    if (e.duration > 100) { // Log slow queries over 100ms
      console.warn(`Slow query (${e.duration}ms):`, e.query);
    }
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Database health check function
export async function checkDatabaseHealth(): Promise<{ 
  isHealthy: boolean; 
  responseTime: number; 
  error?: string 
}> {
  const startTime = Date.now()
  
  try {
    await prisma.$queryRaw`SELECT 1`
    const responseTime = Date.now() - startTime
    
    return {
      isHealthy: true,
      responseTime,
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    return {
      isHealthy: false,
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown database error',
    }
  }
}

// Safe database operation wrapper with fallback
export async function withDatabaseFallback<T>(
  operation: () => Promise<T>,
  fallback: T,
  operationName?: string
): Promise<T> {
  try {
    // Quick health check first
    const health = await checkDatabaseHealth();
    if (!health.isHealthy) {
      if (operationName && process.env.NODE_ENV === 'development') {
        console.warn(`Database unavailable for ${operationName}, using fallback:`, health.error);
      }
      return fallback;
    }
    
    return await operation();
  } catch (error) {
    if (operationName && process.env.NODE_ENV === 'development') {
      console.warn(`Database operation failed for ${operationName}:`, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    return fallback;
  }
}

// Enhanced database operation with retry logic
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')
      
      // Don't retry on certain errors (like validation errors)
      if (
        lastError.message.includes('unique constraint') ||
        lastError.message.includes('foreign key constraint') ||
        lastError.message.includes('check constraint')
      ) {
        throw lastError
      }
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw lastError
      }
      
      // Wait before retrying with exponential backoff
      const delay = delayMs * Math.pow(2, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, delay))
      
      console.warn(`Database operation failed (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms...`, {
        error: lastError.message,
        attempt,
      })
    }
  }
  
  throw lastError
}

// Prisma operation wrapper with automatic retry
export const db = {
  // User operations
  user: {
    ...prisma.user,
    findMany: (args?: any) => withRetry(() => prisma.user.findMany(args)),
    findUnique: (args: any) => withRetry(() => prisma.user.findUnique(args)),
    findFirst: (args?: any) => withRetry(() => prisma.user.findFirst(args)),
    create: (args: any) => withRetry(() => prisma.user.create(args)),
    update: (args: any) => withRetry(() => prisma.user.update(args)),
    delete: (args: any) => withRetry(() => prisma.user.delete(args)),
    upsert: (args: any) => withRetry(() => prisma.user.upsert(args)),
    count: (args?: any) => withRetry(() => prisma.user.count(args)),
  },
  
  // Analysis operations
  analysis: {
    ...prisma.analysis,
    findMany: (args?: any) => withRetry(() => prisma.analysis.findMany(args)),
    findUnique: (args: any) => withRetry(() => prisma.analysis.findUnique(args)),
    findFirst: (args?: any) => withRetry(() => prisma.analysis.findFirst(args)),
    create: (args: any) => withRetry(() => prisma.analysis.create(args)),
    update: (args: any) => withRetry(() => prisma.analysis.update(args)),
    delete: (args: any) => withRetry(() => prisma.analysis.delete(args)),
    count: (args?: any) => withRetry(() => prisma.analysis.count(args)),
  },
  
  // Error operations
  platformError: {
    ...prisma.platformError,
    findMany: (args?: any) => withRetry(() => prisma.platformError.findMany(args)),
    findUnique: (args: any) => withRetry(() => prisma.platformError.findUnique(args)),
    create: (args: any) => withRetry(() => prisma.platformError.create(args)),
    update: (args: any) => withRetry(() => prisma.platformError.update(args)),
    delete: (args: any) => withRetry(() => prisma.platformError.delete(args)),
    count: (args?: any) => withRetry(() => prisma.platformError.count(args)),
    updateMany: (args: any) => withRetry(() => prisma.platformError.updateMany(args)),
  },
  
  // Generic operations (for models not explicitly wrapped)
  $transaction: (args: any, options?: any) => withRetry(() => prisma.$transaction(args, options)),
  $queryRaw: (query: any, ...values: any[]) => withRetry(() => prisma.$queryRaw(query, ...values)),
  $executeRaw: (query: any, ...values: any[]) => withRetry(() => prisma.$executeRaw(query, ...values)),
  
  // Expose the original prisma client for other operations
  _prisma: prisma,
}

// Connection monitoring and graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
}) 