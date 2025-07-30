#!/usr/bin/env node

/**
 * Script: update-genai-models.js
 * Purpose: Fetch available Gemini models from the Vertex AI API or Gemini API and update the 'google-genai' models list in lib/ai-providers.ts
 * Usage: node scripts/update-genai-models.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { GoogleGenAI } = require('@google/genai');

const PROVIDERS_PATH = path.join(__dirname, '../lib/ai-providers.ts');
const PROVIDER_ID = 'google-genai';

async function getConfig() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise((resolve) => rl.question(q, (a) => resolve(a.trim())));
  const mode = (await ask('Which API do you want to use? (1) Gemini API (API key, for Google AI Studio) or (2) Vertex AI (ADC/gcloud, for Google Cloud)? Enter 1 or 2: ')).trim();
  if (mode === '2') {
    const project = process.env.GOOGLE_CLOUD_PROJECT_ID || await ask('Enter your Google Cloud Project ID: ');
    const location = process.env.GOOGLE_CLOUD_REGION || await ask('Enter your Vertex AI region (e.g., us-central1): ');
    rl.close();
    return { mode: 'vertex', project, location };
  } else {
    const apiKey = process.env.GENAI_API_KEY || await ask('Enter your Gemini API key: ');
    rl.close();
    return { mode: 'gemini', apiKey };
  }
}

async function fetchGenaiModels(config) {
  let ai;
  if (config.mode === 'vertex') {
    // Vertex AI: Use ADC (gcloud auth application-default login)
    ai = new GoogleGenAI({
      vertexai: true,
      project: config.project,
      location: config.location,
      apiVersion: 'v1',
    });
  } else {
    // Gemini API: Use API key
    ai = new GoogleGenAI({
      apiKey: config.apiKey,
    });
  }
  const result = await ai.models.list();
  const models = result.models || [];
  // Filter for Gemini models only
  return models.filter(m => m.name.includes('gemini'));
}

function updateProviderModelsFile(models) {
  const file = fs.readFileSync(PROVIDERS_PATH, 'utf8');
  const providerRegex = new RegExp(`(id: ['"]${PROVIDER_ID}['"].*?models: \[)([\s\S]*?)(\],)`, 'm');
  const modelEntries = models.map(m => `    {
      id: '${m.name.split('/').pop()}',
      name: '${m.displayName || m.name.split('/').pop()}',
      provider: '${PROVIDER_ID}',
      description: '${(m.description || '').replace(/'/g, "\'")}',
      available: true,
      tier: 'paid',
      contextWindow: ${m.inputTokenLimit || 1048576},
    }`).join(',\n');
  const newModelsBlock = `\n${modelEntries}\n  `;
  const newFile = file.replace(providerRegex, `$1${newModelsBlock}$3`);
  fs.writeFileSync(PROVIDERS_PATH, newFile, 'utf8');
  console.log('Updated google-genai models in ai-providers.ts!');
}

async function main() {
  try {
    const config = await getConfig();
    if (config.mode === 'vertex') {
      console.log('\nMake sure you have run: gcloud auth application-default login');
      console.log('and enabled Vertex AI and Generative Language APIs for your project.');
    }
    const models = await fetchGenaiModels(config);
    if (!models.length) {
      console.error('No Gemini models found from the API.');
      process.exit(1);
    }
    updateProviderModelsFile(models);
  } catch (err) {
    console.error('Error updating GenAI models:', err);
    console.log('\nManual update instructions:');
    console.log('1. For Gemini API: Get your API key from https://makersuite.google.com/app/apikey');
    console.log('2. For Vertex AI: Run gcloud auth application-default login and set project/region.');
    console.log('3. Use the @google/genai SDK to list models.');
    console.log('4. Update the google-genai models array in lib/ai-providers.ts accordingly.');
  }
}

main(); 