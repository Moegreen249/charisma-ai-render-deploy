import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting migration for landing page features...");

  try {
    // Check if we're already migrated by looking for the new tables
    const existingWaitingList = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'WaitingList'
      );
    `;

    const existingCountdown = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'LaunchCountdown'
      );
    `;

    const existingWelcome = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'UserWelcome'
      );
    `;

    if (existingWaitingList && existingCountdown && existingWelcome) {
      console.log("✅ Migration already completed. All tables exist.");
      return;
    }

    console.log("🔄 Creating new tables...");

    // Create WaitingList table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "WaitingList" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "name" TEXT,
        "company" TEXT,
        "useCase" TEXT,
        "source" TEXT,
        "isNotified" BOOLEAN NOT NULL DEFAULT false,
        "position" INTEGER,
        "inviteCode" TEXT,
        "invitedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "WaitingList_pkey" PRIMARY KEY ("id")
      );
    `;

    // Create unique constraints for WaitingList
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "WaitingList_email_key" ON "WaitingList"("email");
    `;

    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "WaitingList_inviteCode_key" ON "WaitingList"("inviteCode");
    `;

    // Create indexes for WaitingList
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "WaitingList_email_idx" ON "WaitingList"("email");
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "WaitingList_position_idx" ON "WaitingList"("position");
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "WaitingList_createdAt_idx" ON "WaitingList"("createdAt");
    `;

    // Create LaunchCountdown table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "LaunchCountdown" (
        "id" TEXT NOT NULL,
        "targetDate" TIMESTAMP(3) NOT NULL,
        "title" TEXT NOT NULL DEFAULT 'CharismaAI is Coming Soon',
        "subtitle" TEXT DEFAULT 'Get ready for AI-powered communication insights',
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "showDays" BOOLEAN NOT NULL DEFAULT true,
        "showHours" BOOLEAN NOT NULL DEFAULT true,
        "showMinutes" BOOLEAN NOT NULL DEFAULT true,
        "showSeconds" BOOLEAN NOT NULL DEFAULT true,
        "completedTitle" TEXT DEFAULT 'CharismaAI is Now Live!',
        "completedSubtitle" TEXT DEFAULT 'Start analyzing your conversations today',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "LaunchCountdown_pkey" PRIMARY KEY ("id")
      );
    `;

    // Create indexes for LaunchCountdown
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "LaunchCountdown_isActive_idx" ON "LaunchCountdown"("isActive");
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "LaunchCountdown_targetDate_idx" ON "LaunchCountdown"("targetDate");
    `;

    // Create UserWelcome table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "UserWelcome" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "hasSeenWelcome" BOOLEAN NOT NULL DEFAULT false,
        "welcomeShownAt" TIMESTAMP(3),
        "onboardingStep" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "UserWelcome_pkey" PRIMARY KEY ("id")
      );
    `;

    // Create unique constraint for UserWelcome
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "UserWelcome_userId_key" ON "UserWelcome"("userId");
    `;

    // Create indexes for UserWelcome
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "UserWelcome_userId_idx" ON "UserWelcome"("userId");
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "UserWelcome_hasSeenWelcome_idx" ON "UserWelcome"("hasSeenWelcome");
    `;

    // Add foreign key constraint for UserWelcome
    await prisma.$executeRaw`
      ALTER TABLE "UserWelcome"
      ADD CONSTRAINT "UserWelcome_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `;

    console.log("✅ Created WaitingList table with indexes");
    console.log("✅ Created LaunchCountdown table with indexes");
    console.log("✅ Created UserWelcome table with indexes and foreign key");

    // Create default countdown entry
    const defaultTargetDate = new Date();
    defaultTargetDate.setDate(defaultTargetDate.getDate() + 30); // 30 days from now

    await prisma.$executeRaw`
      INSERT INTO "LaunchCountdown" (
        "id",
        "targetDate",
        "title",
        "subtitle",
        "isActive",
        "showDays",
        "showHours",
        "showMinutes",
        "showSeconds",
        "completedTitle",
        "completedSubtitle",
        "createdAt",
        "updatedAt"
      ) VALUES (
        gen_random_uuid()::text,
        ${defaultTargetDate},
        'CharismaAI is Coming Soon',
        'Get ready for AI-powered communication insights that will transform how you understand conversations',
        true,
        true,
        true,
        true,
        true,
        'CharismaAI is Now Live! 🎉',
        'Start analyzing your conversations with AI-powered insights today',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      ) ON CONFLICT DO NOTHING;
    `;

    console.log("✅ Created default countdown configuration");

    // Update trigger functions for auto-updating timestamps
    await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `;

    // Create triggers for each table
    await prisma.$executeRaw`
      DROP TRIGGER IF EXISTS update_waitinglist_updated_at ON "WaitingList";
      CREATE TRIGGER update_waitinglist_updated_at
        BEFORE UPDATE ON "WaitingList"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `;

    await prisma.$executeRaw`
      DROP TRIGGER IF EXISTS update_launchcountdown_updated_at ON "LaunchCountdown";
      CREATE TRIGGER update_launchcountdown_updated_at
        BEFORE UPDATE ON "LaunchCountdown"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `;

    await prisma.$executeRaw`
      DROP TRIGGER IF EXISTS update_userwelcome_updated_at ON "UserWelcome";
      CREATE TRIGGER update_userwelcome_updated_at
        BEFORE UPDATE ON "UserWelcome"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `;

    console.log("✅ Created database triggers for auto-updating timestamps");

    console.log("🎉 Migration completed successfully!");
    console.log("");
    console.log("📋 Summary:");
    console.log("  - WaitingList table: ✅ Created with indexes");
    console.log("  - LaunchCountdown table: ✅ Created with indexes");
    console.log("  - UserWelcome table: ✅ Created with indexes and FK");
    console.log("  - Default countdown: ✅ Created");
    console.log("  - Database triggers: ✅ Created");
    console.log("");
    console.log("🚀 Your landing page features are ready to use!");
  } catch (error) {
    console.error("❌ Migration failed:", error);

    if (error instanceof Error) {
      console.error("Error details:", error.message);

      if (error.message.includes("already exists")) {
        console.log(
          "ℹ️  Some tables may already exist. This is normal if you've run this migration before.",
        );
      }
    }

    throw error;
  }
}

main()
  .catch((e) => {
    console.error("❌ Migration script failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
