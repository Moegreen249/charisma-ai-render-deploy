-- CreateTable
CREATE TABLE "AnalysisModule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "instructionPrompt" TEXT NOT NULL,
    "expectedJsonHint" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "icon" TEXT NOT NULL DEFAULT '✨',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isBuiltIn" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalysisModule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "module_unique_name" ON "AnalysisModule"("name");

-- CreateIndex
CREATE INDEX "AnalysisModule_category_idx" ON "AnalysisModule"("category");

-- CreateIndex
CREATE INDEX "AnalysisModule_isActive_idx" ON "AnalysisModule"("isActive");
