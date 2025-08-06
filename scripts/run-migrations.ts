#!/usr/bin/env tsx

/**
 * Production migration runner
 * This script runs database migrations on startup for production deployments
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runMigrations() {
  console.log('🔄 Checking database migrations...');
  
  try {
    // Check if we're in production
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️  Not in production mode, skipping migrations');
      return;
    }

    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.log('⚠️  No DATABASE_URL found, skipping migrations');
      return;
    }

    console.log('📋 Running Prisma migrations...');
    
    // Run migrations
    const { stdout, stderr } = await execAsync('npx prisma migrate deploy');
    
    console.log('✅ Migrations completed successfully');
    if (stdout) console.log(stdout);
    if (stderr) console.warn(stderr);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    // Don't exit the process - let the application start even if migrations fail
    // This prevents the entire deployment from failing due to migration issues
    console.warn('⚠️  Application will continue to start despite migration failure');
  }
}

// Run migrations if this script is executed directly
if (require.main === module) {
  runMigrations();
}

export default runMigrations;