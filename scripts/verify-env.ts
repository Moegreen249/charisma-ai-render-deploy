#!/usr/bin/env tsx

// Script to verify required environment variables

// Load environment variables like Next.js does
const { loadEnvConfig } = require('@next/env');
const projectDir = process.cwd();
loadEnvConfig(projectDir);

const requiredVars = [
  'GOOGLE_APPLICATION_CREDENTIALS',
  'GOOGLE_CLOUD_PROJECT_ID', 
  'GOOGLE_CLOUD_REGION'
];

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
