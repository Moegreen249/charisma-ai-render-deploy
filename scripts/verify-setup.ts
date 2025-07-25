#!/usr/bin/env tsx

/**
 * 🔍 CharismaAI Setup Verification Script
 * 
 * This script verifies that the setup completed successfully
 * and all components are working correctly.
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m',
};

const log = (message: string, color: keyof typeof colors = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logSuccess = (message: string) => log(`✅ ${message}`, 'green');
const logError = (message: string) => log(`❌ ${message}`, 'red');
const logWarning = (message: string) => log(`⚠️  ${message}`, 'yellow');
const logInfo = (message: string) => log(`ℹ️  ${message}`, 'cyan');

async function verifyEnvironmentFile() {
  log('\n🔧 Verifying Environment Configuration...', 'cyan');
  
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    logError('.env file not found');
    return false;
  }
  
  logSuccess('.env file exists');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
  
  for (const variable of requiredVars) {
    if (envContent.includes(`${variable}=`)) {
      logSuccess(`${variable} is configured`);
    } else {
      logError(`${variable} is missing`);
      return false;
    }
  }
  
  return true;
}

async function verifyDatabase() {
  log('\n🗄️  Verifying Database Connection...', 'cyan');
  
  try {
    await prisma.$connect();
    logSuccess('Database connection successful');
    
    // Check if user table exists and has data
    const userCount = await prisma.user.count();
    logSuccess(`Database schema is set up (${userCount} users found)`);
    
    // Check if admin exists
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (adminUser) {
      logSuccess(`Admin user found: ${adminUser.email}`);
    } else {
      logWarning('No admin user found - you may need to create one');
    }
    
    // Check analysis modules
    const moduleCount = await prisma.analysisModule.count();
    if (moduleCount > 0) {
      logSuccess(`Analysis modules seeded (${moduleCount} modules)`);
    } else {
      logWarning('No analysis modules found - seed data may be missing');
    }
    
    return true;
  } catch (error) {
    logError(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

async function verifyDependencies() {
  log('\n📦 Verifying Dependencies...', 'cyan');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    logError('package.json not found');
    return false;
  }
  
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    logError('node_modules directory not found - run npm install');
    return false;
  }
  
  logSuccess('Dependencies are installed');
  
  // Check critical dependencies
  const criticalDeps = [
    'next',
    'react',
    'prisma',
    '@prisma/client',
    'next-auth',
    'zod'
  ];
  
  for (const dep of criticalDeps) {
    const depPath = path.join(nodeModulesPath, dep);
    if (fs.existsSync(depPath)) {
      logSuccess(`${dep} is installed`);
    } else {
      logError(`${dep} is missing`);
      return false;
    }
  }
  
  return true;
}

async function verifyPrismaClient() {
  log('\n🔧 Verifying Prisma Client...', 'cyan');
  
  const prismaClientPath = path.join(process.cwd(), 'src', 'generated', 'prisma');
  if (!fs.existsSync(prismaClientPath)) {
    logError('Prisma client not generated - run npx prisma generate');
    return false;
  }
  
  logSuccess('Prisma client is generated');
  return true;
}

async function verifyAPIKeys() {
  log('\n🔑 Verifying AI Provider Configuration...', 'cyan');
  
  const apiKeys = [
    { name: 'Google AI', env: 'GOOGLE_API_KEY' },
    { name: 'OpenAI', env: 'OPENAI_API_KEY' },
    { name: 'Anthropic', env: 'ANTHROPIC_API_KEY' },
  ];
  
  let hasAnyKey = false;
  
  for (const { name, env } of apiKeys) {
    if (process.env[env]) {
      logSuccess(`${name} API key is configured`);
      hasAnyKey = true;
    } else {
      logWarning(`${name} API key is not configured (optional)`);
    }
  }
  
  if (!hasAnyKey) {
    logWarning('No AI provider API keys found - add at least one to .env file');
  } else {
    logSuccess('At least one AI provider is configured');
  }
  
  return true;
}

async function runVerification() {
  try {
    log('🔍 CharismaAI Setup Verification', 'bright');
    log('Checking if your setup is complete and ready to use...\n', 'cyan');
    
    const results = await Promise.all([
      verifyEnvironmentFile(),
      verifyDependencies(),
      verifyPrismaClient(),
      verifyDatabase(),
      verifyAPIKeys(),
    ]);
    
    const allPassed = results.every(result => result);
    
    log('\n📊 Verification Summary:', 'bright');
    
    if (allPassed) {
      log('\n🎉 Setup Verification Complete!', 'green');
      logSuccess('Your CharismaAI platform is ready to use');
      logInfo('Start the development server with: npm run dev');
      logInfo('Then open http://localhost:3000 in your browser');
    } else {
      log('\n⚠️  Setup Issues Found', 'yellow');
      logWarning('Some components need attention before the platform is ready');
      logInfo('Review the errors above and fix any issues');
      logInfo('You can re-run this verification with: npx tsx scripts/verify-setup.ts');
    }
    
  } catch (error) {
    logError(`Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
runVerification().catch(console.error); 