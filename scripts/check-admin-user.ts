#!/usr/bin/env tsx

import { prisma } from "../lib/prisma";

// Load environment variables like Next.js does
import { loadEnvConfig } from "@next/env";
const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function main() {
  try {
    console.log("Checking admin user details...");
    
    const user = await prisma.user.findUnique({
      where: { email: "admin@charisma-ai.com" }
    });

    if (!user) {
      console.error("❌ Admin user not found");
      return;
    }

    console.log("📋 Admin User Details:");
    console.log("ID:", user.id);
    console.log("Email:", user.email);
    console.log("Name:", user.name);
    console.log("Role:", user.role);
    console.log("Is Approved:", user.isApproved);
    console.log("Email Verified:", user.emailVerified);
    console.log("Has Password:", !!user.password);
    console.log("Approved By:", user.approvedBy);
    console.log("Approved At:", user.approvedAt);
    console.log("Created At:", user.createdAt);

  } catch (error) {
    console.error("❌ Error checking admin user:", error);
  }
}

main();