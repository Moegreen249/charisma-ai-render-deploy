import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function seedAnalyticsDemo() {
  console.log("🌱 Seeding analytics demo data...");

  try {
    // Get existing users or create demo users
    let users = await prisma.user.findMany({ take: 5 });

    if (users.length < 3) {
      console.log("Creating demo users...");
      const demoUsers = await Promise.all([
        prisma.user.create({
          data: {
            email: "demo1@charisma-ai.com",
            name: "Demo User 1",
            role: "USER",
          },
        }),
        prisma.user.create({
          data: {
            email: "demo2@charisma-ai.com",
            name: "Demo User 2",
            role: "USER",
          },
        }),
        prisma.user.create({
          data: {
            email: "demo3@charisma-ai.com",
            name: "Demo User 3",
            role: "USER",
          },
        }),
      ]);
      users = [...users, ...demoUsers];
    }

    // Create demo analyses from the past 30 days
    console.log("Creating demo analyses...");
    const analysisPromises = [];
    const now = new Date();

    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const hoursAgo = Math.floor(Math.random() * 24);
      const analysisDate = new Date(
        now.getTime() - (daysAgo * 24 + hoursAgo) * 60 * 60 * 1000,
      );
      const userId = users[Math.floor(Math.random() * users.length)].id;
      const duration = 15000 + Math.floor(Math.random() * 45000); // 15-60 seconds

      analysisPromises.push(
        prisma.analysis.create({
          data: {
            userId,
            templateId: "template_" + (Math.floor(Math.random() * 5) + 1),
            modelId: ["gpt-4", "gpt-3.5-turbo", "gemini-pro"][
              Math.floor(Math.random() * 3)
            ],
            provider: ["openai", "google", "anthropic"][
              Math.floor(Math.random() * 3)
            ],
            fileName: `chat_analysis_${i + 1}.txt`,
            durationMs: duration,
            analysisDate,
            createdAt: analysisDate,
            analysisResult: {
              summary: `Demo analysis result ${i + 1}`,
              insights: [
                "Communication pattern identified",
                "Emotional intelligence score: " +
                  (70 + Math.floor(Math.random() * 30)),
              ],
              scores: {
                overall: Math.floor(Math.random() * 100),
                emotional: Math.floor(Math.random() * 100),
                engagement: Math.floor(Math.random() * 100),
              },
            },
          },
        }),
      );
    }

    await Promise.all(analysisPromises);

    // Create demo background jobs
    console.log("Creating demo background jobs...");
    const jobPromises = [];

    for (let i = 0; i < 25; i++) {
      const daysAgo = Math.floor(Math.random() * 7);
      const hoursAgo = Math.floor(Math.random() * 24);
      const createdAt = new Date(
        now.getTime() - (daysAgo * 24 + hoursAgo) * 60 * 60 * 1000,
      );
      const userId = users[Math.floor(Math.random() * users.length)].id;

      const statuses = [
        "COMPLETED",
        "COMPLETED",
        "COMPLETED",
        "FAILED",
        "PROCESSING",
      ];
      const status = statuses[
        Math.floor(Math.random() * statuses.length)
      ] as any;

      jobPromises.push(
        prisma.backgroundJob.create({
          data: {
            userId,
            type: "ANALYSIS",
            status,
            progress:
              status === "COMPLETED"
                ? 100
                : status === "PROCESSING"
                  ? Math.floor(Math.random() * 80)
                  : 0,
            currentStep:
              status === "COMPLETED"
                ? "Completed"
                : status === "PROCESSING"
                  ? "Processing data"
                  : "Failed",
            totalSteps: 4,
            templateId: "template_" + (Math.floor(Math.random() * 5) + 1),
            modelId: ["gpt-4", "gpt-3.5-turbo", "gemini-pro"][
              Math.floor(Math.random() * 3)
            ],
            provider: ["openai", "google", "anthropic"][
              Math.floor(Math.random() * 3)
            ],
            fileName: `background_analysis_${i + 1}.txt`,
            result:
              status === "COMPLETED"
                ? {
                    summary: `Background analysis result ${i + 1}`,
                    processed: true,
                  }
                : undefined,
            error: status === "FAILED" ? "Demo error for testing" : null,
            startedAt: createdAt,
            completedAt:
              status === "COMPLETED"
                ? new Date(createdAt.getTime() + 30000)
                : null,
            createdAt,
          },
        }),
      );
    }

    await Promise.all(jobPromises);

    // Create demo platform errors
    console.log("Creating demo platform errors...");
    const errorCategories = [
      "AI_PROVIDER",
      "DATABASE",
      "AUTHENTICATION",
      "JSON_PARSING",
      "SYSTEM",
    ];
    const errorSeverities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
    const errorPromises = [];

    for (let i = 0; i < 20; i++) {
      const daysAgo = Math.floor(Math.random() * 14);
      const hoursAgo = Math.floor(Math.random() * 24);
      const createdAt = new Date(
        now.getTime() - (daysAgo * 24 + hoursAgo) * 60 * 60 * 1000,
      );
      const userId =
        Math.random() > 0.3
          ? users[Math.floor(Math.random() * users.length)].id
          : null;

      errorPromises.push(
        prisma.platformError.create({
          data: {
            category: errorCategories[
              Math.floor(Math.random() * errorCategories.length)
            ] as any,
            severity: errorSeverities[
              Math.floor(Math.random() * errorSeverities.length)
            ] as any,
            message: `Demo error message ${i + 1}: ${["API rate limit exceeded", "Database connection timeout", "Invalid JSON response", "Authentication failed", "Memory limit exceeded"][Math.floor(Math.random() * 5)]}`,
            userId,
            endpoint: [
              "/api/analyze",
              "/api/background/analyze",
              "/api/auth/signin",
              "/api/coach",
            ][Math.floor(Math.random() * 4)],
            stackTrace: `Error stack trace for demo error ${i + 1}\n    at demoFunction (demo.ts:${Math.floor(Math.random() * 100)}:${Math.floor(Math.random() * 50)})`,
            occurrenceCount: Math.floor(Math.random() * 10) + 1,
            isResolved: Math.random() > 0.4,
            resolvedAt:
              Math.random() > 0.4
                ? new Date(
                    createdAt.getTime() +
                      Math.random() * 7 * 24 * 60 * 60 * 1000,
                  )
                : null,
            firstOccurred: createdAt,
            lastOccurred: new Date(
              createdAt.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000,
            ),
            createdAt,
          },
        }),
      );
    }

    await Promise.all(errorPromises);

    // Create demo user activities
    console.log("Creating demo user activities...");
    const activityPromises = [];
    const actions = [
      "analysis_started",
      "file_uploaded",
      "settings_changed",
      "login",
      "logout",
      "view_history",
    ];
    const categories = ["analysis", "navigation", "settings", "auth"];

    for (let i = 0; i < 200; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const hoursAgo = Math.floor(Math.random() * 24);
      const timestamp = new Date(
        now.getTime() - (daysAgo * 24 + hoursAgo) * 60 * 60 * 1000,
      );
      const userId = users[Math.floor(Math.random() * users.length)].id;

      activityPromises.push(
        prisma.userActivity.create({
          data: {
            userId,
            action: actions[Math.floor(Math.random() * actions.length)],
            category: categories[Math.floor(Math.random() * categories.length)],
            page: ["/", "/settings", "/history", "/admin"][
              Math.floor(Math.random() * 4)
            ],
            metadata: {
              userAgent: "Mozilla/5.0 (Demo Browser)",
              ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
            },
            timestamp,
          },
        }),
      );
    }

    await Promise.all(activityPromises);

    // Create demo platform metrics
    console.log("Creating demo platform metrics...");
    const metricPromises = [];
    const metricNames = [
      "daily_analyses",
      "error_rate",
      "user_registrations",
      "response_time",
      "system_load",
    ];
    const metricCategories = [
      "usage",
      "performance",
      "errors",
      "users",
      "system",
    ];

    for (let days = 0; days < 30; days++) {
      const date = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      const dayStart = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      for (let m = 0; m < metricNames.length; m++) {
        const name = metricNames[m];
        const category = metricCategories[m];
        let value: number;

        switch (name) {
          case "daily_analyses":
            value = Math.floor(Math.random() * 50) + 10;
            break;
          case "error_rate":
            value = Math.random() * 5;
            break;
          case "user_registrations":
            value = Math.floor(Math.random() * 10);
            break;
          case "response_time":
            value = Math.random() * 2000 + 500;
            break;
          case "system_load":
            value = Math.random() * 100;
            break;
          default:
            value = Math.random() * 100;
        }

        metricPromises.push(
          prisma.platformMetric.create({
            data: {
              name,
              category,
              value,
              unit:
                name === "response_time"
                  ? "ms"
                  : name.includes("rate")
                    ? "percentage"
                    : "count",
              period: "daily",
              periodStart: dayStart,
              periodEnd: dayEnd,
              metadata: {
                generated: true,
                demo: true,
              },
            },
          }),
        );
      }
    }

    await Promise.all(metricPromises);

    console.log("✅ Analytics demo data seeded successfully!");
    console.log("\nDemo data created:");
    console.log(`- ${users.length} users`);
    console.log("- 50 analyses");
    console.log("- 25 background jobs");
    console.log("- 20 platform errors");
    console.log("- 200 user activities");
    console.log("- 150 platform metrics (30 days × 5 metrics)");
    console.log("\nYou can now visit /admin/analytics to see real data!");
  } catch (error) {
    console.error("❌ Error seeding analytics demo data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedAnalyticsDemo().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
