-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "analysisDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationMs" INTEGER,
    "analysisResult" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTemplate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'custom',
    "icon" TEXT NOT NULL DEFAULT '✨',
    "systemPrompt" TEXT NOT NULL,
    "analysisPrompt" TEXT NOT NULL,
    "isBuiltIn" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Analysis_userId_idx" ON "Analysis"("userId");

-- CreateIndex
CREATE INDEX "Analysis_templateId_idx" ON "Analysis"("templateId");

-- CreateIndex
CREATE INDEX "Analysis_analysisDate_idx" ON "Analysis"("analysisDate");

-- CreateIndex
CREATE INDEX "UserTemplate_userId_idx" ON "UserTemplate"("userId");

-- CreateIndex
CREATE INDEX "UserTemplate_category_idx" ON "UserTemplate"("category");

-- CreateIndex
CREATE UNIQUE INDEX "UserTemplate_userId_name_key" ON "UserTemplate"("userId", "name");

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTemplate" ADD CONSTRAINT "UserTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
