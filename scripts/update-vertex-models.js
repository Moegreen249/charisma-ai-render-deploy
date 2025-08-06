#!/usr/bin/env node

/**
 * Script: update-vertex-models.js
 * Purpose: Help update the static Vertex AI publisher model list in app/actions/vertexModels.ts
 * Usage: node scripts/update-vertex-models.js
 */

const fs = require('fs');
const path = require('path');
let fetch;
let nodeFetchPromise;
try {
  fetch = global.fetch || require('node-fetch');
} catch {
  fetch = async (...args) => {
    if (!nodeFetchPromise) {
      nodeFetchPromise = import('node-fetch').then(({default: fetch}) => fetch);
    }
    const cachedFetch = await nodeFetchPromise;
    return cachedFetch(...args);
  };
}

// Path to the static model list in your codebase
const VERTEX_MODELS_PATH = path.join(__dirname, '../app/actions/vertexModels.ts');

// Official Vertex AI Model Reference (HTML, not API)
const MODEL_DOCS_URL = 'https://cloud.google.com/vertex-ai/docs/generative-ai/learn/models';

async function fetchModelDocs() {
  console.log('Fetching Vertex AI model documentation...');
  const res = await fetch(MODEL_DOCS_URL);
  if (!res.ok) throw new Error('Failed to fetch model docs');
  const html = await res.text();
  return html;
}

function parseModelsFromDocs(html) {
  // This is a simple regex-based parser for the docs page. You may want to improve it for robustness.
  const modelRegex = /<tr>\s*<td><code>([\w\-.]+)<\/code><\/td>\s*<td>([^<]+)<\/td>\s*<td>([^<]+)<\/td>/g;
  const models = [];
  let match;
  while ((match = modelRegex.exec(html)) !== null) {
    models.push({
      id: match[1],
      name: match[2],
      description: match[3],
      provider: 'google-vertex-ai',
      contextWindow: 8192, // Default, update as needed
      available: true,
      tier: 'paid',
    });
  }
  return models;
}

function updateVertexModelsFile(models) {
  const file = fs.readFileSync(VERTEX_MODELS_PATH, 'utf8');
  const start = file.indexOf('const predefinedModels: AIModel[] = [');
  if (start === -1) throw new Error('Could not find predefinedModels array');
  const before = file.slice(0, start);
  const after = file.slice(file.indexOf('];', start) + 2);
  const modelEntries = models.map(m => `  {
    id: '${m.id}',
    name: '${m.name.replace(/'/g, "\'")}',
    provider: '${m.provider}',
    description: '${m.description.replace(/'/g, "\'")}',
    contextWindow: ${m.contextWindow},
    available: true,
    tier: 'paid',
  }`).join(',\n');
  const newContent = `${before}const predefinedModels: AIModel[] = [\n${modelEntries}\n];${after}`;
  fs.writeFileSync(VERTEX_MODELS_PATH, newContent, 'utf8');
  console.log('Updated predefinedModels in vertexModels.ts!');
}

async function main() {
  try {
    const html = await fetchModelDocs();
    const models = parseModelsFromDocs(html);
    if (models.length === 0) {
      console.error('No models found. The documentation format may have changed.');
      process.exit(1);
    }
    updateVertexModelsFile(models);
  } catch (err) {
    console.error('Error updating Vertex AI models:', err);
    console.log('\nManual update instructions:');
    console.log(`1. Visit ${MODEL_DOCS_URL}`);
    console.log('2. Copy the model IDs, names, and descriptions.');
    console.log('3. Update the predefinedModels array in app/actions/vertexModels.ts accordingly.');
  }
}

main();