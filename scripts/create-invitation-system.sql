-- ================================
-- INVITATION SYSTEM DATABASE SETUP
-- ================================

-- 1. Create InvitationStatus enum
DO $$ BEGIN
    CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Invitation table
CREATE TABLE IF NOT EXISTS "Invitation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "personalMessage" TEXT,
    "templateId" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "invitedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- 3. Create EmailTemplate table
CREATE TABLE IF NOT EXISTS "EmailTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "htmlContent" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "isBuiltIn" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "variables" JSONB,
    "styling" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- 4. Add constraints
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_name_key" UNIQUE ("name");

-- 5. Add foreign key constraints for Invitation table
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_invitedBy_fkey" 
    FOREIGN KEY ("invitedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 6. Create indexes for Invitation table
CREATE INDEX IF NOT EXISTS "Invitation_userId_idx" ON "Invitation"("userId");
CREATE INDEX IF NOT EXISTS "Invitation_invitedBy_idx" ON "Invitation"("invitedBy");
CREATE INDEX IF NOT EXISTS "Invitation_status_idx" ON "Invitation"("status");
CREATE INDEX IF NOT EXISTS "Invitation_createdAt_idx" ON "Invitation"("createdAt");

-- 7. Create indexes for EmailTemplate table
CREATE INDEX IF NOT EXISTS "EmailTemplate_category_idx" ON "EmailTemplate"("category");
CREATE INDEX IF NOT EXISTS "EmailTemplate_isActive_idx" ON "EmailTemplate"("isActive");
CREATE INDEX IF NOT EXISTS "EmailTemplate_isBuiltIn_idx" ON "EmailTemplate"("isBuiltIn");

-- 8. Create trigger function for updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW."updatedAt" = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Create triggers for updatedAt
CREATE TRIGGER update_invitation_updated_at 
    BEFORE UPDATE ON "Invitation" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_template_updated_at 
    BEFORE UPDATE ON "EmailTemplate" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
