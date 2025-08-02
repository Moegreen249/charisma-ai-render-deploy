-- Database optimization script for enhanced story search functionality
-- This script creates indexes to improve search performance for the Stories List API

-- Index for story search by title (case-insensitive search optimization)
CREATE INDEX IF NOT EXISTS idx_story_title_gin ON "Story" USING gin(to_tsvector('english', title));

-- Index for analysis fileName search (case-insensitive search optimization)  
CREATE INDEX IF NOT EXISTS idx_analysis_filename_gin ON "Analysis" USING gin(to_tsvector('english', "fileName"));

-- Composite index for user stories with status filtering and ordering
CREATE INDEX IF NOT EXISTS idx_story_user_status_date ON "Story" ("userId", "status", "generatedAt" DESC);

-- Index for story content search (JSON content search optimization)
CREATE INDEX IF NOT EXISTS idx_story_content_overview ON "Story" USING gin((content->'overview'));
CREATE INDEX IF NOT EXISTS idx_story_content_insights ON "Story" USING gin((content->'keyInsights'));

-- Composite index for pagination optimization
CREATE INDEX IF NOT EXISTS idx_story_pagination ON "Story" ("userId", "generatedAt" DESC, "id");

-- Index for analysis relationship optimization
CREATE INDEX IF NOT EXISTS idx_story_analysis_lookup ON "Story" ("analysisId", "userId");

-- Performance monitoring query to check index usage
-- Run this after implementing to verify indexes are being used:
/*
EXPLAIN (ANALYZE, BUFFERS) 
SELECT s.*, a."fileName", a.provider, a."modelId", a."analysisDate", a."templateId"
FROM "Story" s
JOIN "Analysis" a ON s."analysisId" = a.id
WHERE s."userId" = 'your-user-id'
  AND (s.title ILIKE '%search-term%' OR a."fileName" ILIKE '%search-term%')
ORDER BY s."generatedAt" DESC
LIMIT 10 OFFSET 0;
*/