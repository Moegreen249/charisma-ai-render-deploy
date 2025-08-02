#!/usr/bin/env tsx

import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/auth";

// Load environment variables like Next.js does
import { loadEnvConfig } from "@next/env";
const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function main() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error("Usage: npm run update-admin-password <email> <new-password>");
    console.error(
      'Example: npm run update-admin-password admin@charisma-ai.com newpassword123',
    );
    process.exit(1);
  }

  try {
    console.log("Updating admin password...");
    
    // Find the user first
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.error(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update the user password
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { 
        password: hashedPassword,
        emailVerified: new Date() // Ensure email is verified
      }
    });

    console.log("✅ Admin password updated successfully!");
    console.log("Email:", updatedUser.email);
    console.log("Role:", updatedUser.role);
    console.log("ID:", updatedUser.id);
    console.log("Email Verified:", updatedUser.emailVerified);
  } catch (error) {
    console.error("❌ Failed to update admin password:", error);
    process.exit(1);
  }
}

main();