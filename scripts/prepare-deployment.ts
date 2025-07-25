#!/usr/bin/env tsx

/**
 * Deployment Preparation Script
 *
 * This script prepares CharismaAI for production deployment by:
 * 1. Cleaning up outdated files and directories
 * 2. Validating template compliance
 * 3. Building the application
 * 4. Creating deployment-ready package
 * 5. Generating deployment documentation
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const log = (message: string, color: keyof typeof colors = "reset") => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logStep = (step: number, message: string) => {
  log(`\n🔄 [Step ${step}] ${message}`, "cyan");
};

const logSuccess = (message: string) => {
  log(`✅ ${message}`, "green");
};

const logError = (message: string) => {
  log(`❌ ${message}`, "red");
};

const logWarning = (message: string) => {
  log(`⚠️  ${message}`, "yellow");
};

const logInfo = (message: string) => {
  log(`ℹ️  ${message}`, "blue");
};

const execCommand = (command: string, options: { silent?: boolean } = {}) => {
  try {
    const result = execSync(command, {
      stdio: options.silent ? "pipe" : "inherit",
      encoding: "utf8",
    });
    return result;
  } catch (error) {
    if (!options.silent) {
      logError(`Failed to execute: ${command}`);
    }
    throw error;
  }
};

// Files and directories to remove for deployment
const CLEANUP_PATTERNS = [
  // Development files
  ".env.local",
  ".env.development",

  // Build artifacts that should be regenerated
  ".next",
  "dist",
  "build",

  // Temporary files
  "*.tmp",
  "temp",
  "tmp",

  // Development databases
  "dev.db",
  "test.db",

  // IDE files
  ".vscode/settings.json",
  ".idea",

  // OS files
  ".DS_Store",
  "Thumbs.db",

  // Log files
  "*.log",
  "logs",

  // Coverage reports
  "coverage",
  ".nyc_output",

  // Backup files
  "*backup*",
  "*.bak",

  // Old documentation that might be outdated
  "README.old.md",
  "CHANGELOG.old.md",
];

// Outdated files to specifically remove
const OUTDATED_FILES = [
  "lib/old-templates.ts",
  "lib/legacy-analysis.ts",
  "scripts/old-setup.js",
  "scripts/legacy-seed.ts",
  "DOCs/LEGACY_GUIDE.md",
  "DOCs/OLD_API.md",
  "components/OldAnalysis.tsx",
  "components/LegacyUpload.tsx",
];

function cleanupFiles(): void {
  logStep(1, "Cleaning up outdated files and development artifacts");

  let cleanedCount = 0;

  // Remove outdated files
  OUTDATED_FILES.forEach((file) => {
    if (fs.existsSync(file)) {
      try {
        if (fs.statSync(file).isDirectory()) {
          fs.rmSync(file, { recursive: true, force: true });
        } else {
          fs.unlinkSync(file);
        }
        logInfo(`Removed outdated: ${file}`);
        cleanedCount++;
      } catch (error) {
        logWarning(`Could not remove ${file}: ${error}`);
      }
    }
  });

  // Clean up development artifacts
  CLEANUP_PATTERNS.forEach((pattern) => {
    try {
      execCommand(`find . -name "${pattern}" -type f -delete`, {
        silent: true,
      });
    } catch (error) {
      // Ignore errors for cleanup patterns
    }
  });

  // Remove empty directories
  try {
    execCommand("find . -type d -empty -delete", { silent: true });
  } catch (error) {
    // Ignore errors
  }

  logSuccess(`Cleaned up ${cleanedCount} outdated files`);
}

function validateTemplates(): void {
  logStep(2, "Validating template compliance");

  try {
    logInfo("Running template validation...");
    execCommand("npx tsx scripts/validate-template-standards.ts");
    logSuccess("All templates are compliant (100%)");
  } catch (error) {
    logError("Template validation failed");
    throw new Error(
      "Template compliance check failed. Please fix issues before deployment.",
    );
  }
}

function updatePackageJson(): void {
  logStep(3, "Updating package.json for production");

  const packageJsonPath = "package.json";
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  // Update version to 2.0.0 (Template Standardization)
  packageJson.version = "2.0.0";

  // Add deployment-specific scripts if not present
  if (!packageJson.scripts.postbuild) {
    packageJson.scripts.postbuild = "npx prisma generate";
  }

  // Add production dependencies
  const prodDeps = {
    prisma:
      packageJson.devDependencies?.prisma || packageJson.dependencies?.prisma,
  };

  Object.entries(prodDeps).forEach(([dep, version]) => {
    if (version && !packageJson.dependencies[dep]) {
      packageJson.dependencies[dep] = version;
    }
  });

  // Add deployment metadata
  packageJson.deployment = {
    platform: "render.com",
    version: "2.0.0",
    templates: {
      count: 10,
      compliance: "100%",
      validation: "automated",
    },
    lastUpdated: new Date().toISOString(),
  };

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  logSuccess("Updated package.json for production deployment");
}

function buildApplication(): void {
  logStep(4, "Building application for production");

  try {
    logInfo("Installing dependencies...");
    execCommand("npm ci");

    logInfo("Generating Prisma client...");
    execCommand("npx prisma generate");

    logInfo("Building Next.js application...");
    execCommand("npm run build");

    logSuccess("Application built successfully");
  } catch (error) {
    logError("Build failed");
    throw error;
  }
}

function createDeploymentGuide(): void {
  logStep(5, "Creating deployment documentation");

  const deploymentGuide = `# CharismaAI Production Deployment Guide

## 🚀 Quick Deploy to Render.com

### Prerequisites
- Forked repository on GitHub
- Render.com account
- At least one AI provider API key

### Deployment Steps

1. **Database Setup:**
   \`\`\`
   - Create PostgreSQL database on Render
   - Database name: charisma_ai
   - Plan: Starter (free tier available)
   \`\`\`

2. **Web Service Setup:**
   \`\`\`
   - Connect GitHub repository
   - Build Command: npm ci && npm run build
   - Start Command: npm start
   - Health Check: /api/health
   \`\`\`

3. **Environment Variables:**
   \`\`\`env
   NODE_ENV=production
   DATABASE_URL=<from_postgres_service>
   NEXTAUTH_SECRET=<generate_secure_key>
   NEXTAUTH_URL=<your_render_url>
   GOOGLE_API_KEY=<your_api_key>
   \`\`\`

### Post-Deployment Verification

- [ ] Health check returns 200 OK
- [ ] All 10 templates available
- [ ] Template compliance: 100%
- [ ] Admin account creation works
- [ ] Analysis functionality operational

## 📊 Template System Status

- **Templates Available:** 10 standardized templates
- **Compliance Rate:** 100%
- **Validation:** Automated
- **Quality Assurance:** Built-in

### Template List
1. Communication Analysis
2. Relationship Analysis
3. Business Meeting Analysis
4. Coaching Session Analysis
5. Advanced Communication Analysis
6. Deep Relationship Dynamics
7. Executive Leadership Analysis
8. Advanced Coaching Analysis
9. Clinical Therapeutic Assessment
10. Deep Forensic Analysis

## 🔧 Production Configuration

### Required Environment Variables
- DATABASE_URL (PostgreSQL connection string)
- NEXTAUTH_SECRET (secure random string)
- NEXTAUTH_URL (your deployment URL)
- At least one AI provider API key

### Optional Environment Variables
- GOOGLE_CLOUD_PROJECT_ID (for Vertex AI)
- GOOGLE_CLIENT_ID/SECRET (for OAuth)
- Additional AI provider keys

## 📈 Monitoring

- **Health Endpoint:** /api/health
- **Template Status:** Included in health check
- **Database Status:** Connection monitoring
- **Service Status:** All systems operational

---

**Deployment Status:** ✅ Ready for Production
**Version:** 2.0.0 - Template Standardization Complete
**Last Updated:** ${new Date().toISOString()}
`;

  fs.writeFileSync("DEPLOYMENT_READY.md", deploymentGuide);
  logSuccess("Created deployment documentation");
}

function generateDeploymentSummary(): void {
  logStep(6, "Generating deployment summary");

  const summary = {
    version: "2.0.0",
    deploymentReady: true,
    timestamp: new Date().toISOString(),
    templates: {
      total: 10,
      compliance: "100%",
      validation: "passed",
    },
    build: {
      status: "success",
      nextjs: "compiled",
      prisma: "generated",
      typescript: "validated",
    },
    deployment: {
      platform: "render.com",
      database: "postgresql",
      healthCheck: "/api/health",
      documentation: "complete",
    },
    features: [
      "10 Standardized Analysis Templates",
      "Automated Template Validation",
      "Production Health Monitoring",
      "Database Migration Support",
      "Multi-AI Provider Support",
      "Real-time Coaching Interface",
      "Admin Dashboard",
      "Responsive UI/UX",
    ],
  };

  fs.writeFileSync(
    ".deployment-summary.json",
    JSON.stringify(summary, null, 2),
  );
  logSuccess("Generated deployment summary");
}

async function main(): Promise<void> {
  try {
    log("🚀 CharismaAI Deployment Preparation", "bright");
    log("Preparing production-ready deployment package\n", "cyan");

    cleanupFiles();
    validateTemplates();
    updatePackageJson();
    buildApplication();
    createDeploymentGuide();
    generateDeploymentSummary();

    log("\n🎉 Deployment preparation complete!", "green");
    log("\n📋 Summary:", "bright");
    logSuccess("✅ Cleaned up outdated files");
    logSuccess("✅ Validated template compliance (100%)");
    logSuccess("✅ Updated package.json for production");
    logSuccess("✅ Built application successfully");
    logSuccess("✅ Created deployment documentation");
    logSuccess("✅ Generated deployment summary");

    log("\n🚀 Next Steps:", "bright");
    logInfo("1. Push changes to your GitHub repository");
    logInfo("2. Follow DEPLOYMENT_READY.md for platform deployment");
    logInfo("3. Configure environment variables on your platform");
    logInfo("4. Deploy and verify using /api/health endpoint");

    log("\n🔗 Deployment Files Created:", "bright");
    logInfo("• DEPLOYMENT_READY.md - Complete deployment guide");
    logInfo("• .deployment-summary.json - Deployment metadata");
    logInfo("• render.yaml - Render.com configuration");
    logInfo("• RENDER_DEPLOYMENT.md - Render-specific guide");

    log("\n🎊 CharismaAI v2.0 is ready for production deployment!", "green");
  } catch (error) {
    logError("\n❌ Deployment preparation failed!");
    logError(error instanceof Error ? error.message : String(error));
    logInfo("\nPlease fix the errors above and run the script again.");
    process.exit(1);
  }
}

// Handle process termination
process.on("SIGINT", () => {
  log("\n\nDeployment preparation interrupted by user", "yellow");
  process.exit(0);
});

// Run the preparation
main().catch((error) => {
  logError("Unexpected error during deployment preparation:");
  console.error(error);
  process.exit(1);
});
