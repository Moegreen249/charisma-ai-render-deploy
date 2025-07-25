#!/usr/bin/env tsx

import { createAdminUser } from "../lib/admin-setup";

// Load environment variables manually
import { readFileSync } from "fs";
import { resolve } from "path";

// Simple env file loader
function loadEnvFile(path: string) {
  try {
    const content = readFileSync(path, "utf8");
    content.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key && valueParts.length > 0) {
          const value = valueParts.join("=").replace(/^["']|["']$/g, "");
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    });
  } catch (error) {
    // File doesn't exist, ignore
  }
}

// Load .env files in order of precedence
loadEnvFile(resolve(process.cwd(), ".env"));
loadEnvFile(resolve(process.cwd(), ".env.local"));

// Check required environment variables
const requiredVars = [
  "GOOGLE_APPLICATION_CREDENTIALS",
  "GOOGLE_CLOUD_PROJECT_ID",
  "GOOGLE_CLOUD_REGION",
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
  console.error(
    "❌ Some required environment variables are missing. Please set them in your .env.local file.",
  );
  process.exit(1);
}

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] || "Admin User";

  if (!email || !password) {
    console.error("Usage: npm run setup-admin <email> <password> [name]");
    console.error(
      'Example: npm run setup-admin admin@charisma-ai.com admin123 "Admin User"',
    );
    process.exit(1);
  }

  try {
    console.log("Setting up admin user...");
    const adminUser = await createAdminUser(email, password, name);
    console.log("✅ Admin user created successfully!");
    console.log("Email:", adminUser.email);
    console.log("Role:", adminUser.role);
    console.log("ID:", adminUser.id);
  } catch (error) {
    console.error("❌ Failed to create admin user:", error);
    process.exit(1);
  }
}

main();
