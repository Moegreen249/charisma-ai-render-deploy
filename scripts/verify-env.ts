#!/usr/bin/env tsx

// Script to verify required environment variables

// Load environment variables like Next.js does
const { loadEnvConfig } = require('@next/env');
const projectDir = process.cwd();
loadEnvConfig(projectDir);

/**
 * List of required environment variables.
 * You can override this list by providing a comma-separated list via the REQUIRED_ENV_VARS environment variable,
 * or by passing --vars=VAR1,VAR2,VAR3 as a command-line argument.
 */
let requiredVars: string[] = [
  'GOOGLE_APPLICATION_CREDENTIALS',
  'GOOGLE_CLOUD_PROJECT_ID',
  'GOOGLE_CLOUD_REGION'
];

// Allow override via environment variable
if (process.env.REQUIRED_ENV_VARS) {
  requiredVars = process.env.REQUIRED_ENV_VARS.split(',').map(v => v.trim());
}

// Allow override via command-line argument
const varsArg = process.argv.find(arg => arg.startsWith('--vars='));
if (varsArg) {
  requiredVars = varsArg.replace('--vars=', '').split(',').map(v => v.trim());
}

let allPresent = true;

requiredVars.forEach((varName) => {
  const value = process.env[varName];
  if (!value) {
    console.error(`❌ Environment variable ${varName} is missing.`);
    allPresent = false;
  }
});

if (!allPresent) {
  console.error('❌ Some required environment variables are missing. Please set them in your .env.local file.');
  process.exit(1);
}

console.log('✅ All required environment variables are present.');
