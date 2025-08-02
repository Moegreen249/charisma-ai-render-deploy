#!/usr/bin/env tsx

import { createAdminUser } from "../lib/admin-setup";

// Load environment variables like Next.js does
import { loadEnvConfig } from "@next/env";
const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] || "Admin User";

  if (!email || !password) {
    console.error("Usage: npm run setup-admin <email> <password> [name]");
    console.error(
      'Example: npm run setup-admin admin@charisma-ai.com <password> "Admin User"',
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
