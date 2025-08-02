# Enhanced Stories List API Documentation

## Overview

The Stories List API (`/api/stories`) has been enhanced with improved search capabilities, better pagination metadata, optimized database queries, and enhanced content preview generation.

## Key Enhancements

### 1. Fuzzy Search Capabilities

The API now supports multiple search strategies for better story discovery:

#### Search Strategies
- **Exact Phrase Matching**: Searches for the complete search term in story titles and analysis file names
- **Individual Word Matching**: For multi-word searches, each word is searched individually
- **Content Search**: Searches within story content (overview and key insights) for completed stories
- **Case-Insensitive**: All searches are case-insensitive for better user experience

#### Search Implementation
```typescript
// Enhanced fuzzy search with multiple search strategies
const searchTerms = sanitizedSearch.split(/\s+/).filter(term => term.length > 0);

// Build comprehensive search conditions
const searchConditions = [];

// Exact phrase matching (highest priority)
searchConditions.push(
  { title: { contains: sanitizedSearch, mode: "insensitive" } },
  { analysis: { fileName: { contains: sanitizedSearch, mode: "insensitive" } } }
);

// Individual word matching for better fuzzy search
if (searchTerms.length > 1) {
  searchTerms.forEach(term => {
    if (term.length >= 2) { // Only search terms with 2+ characters
      searchConditions.push(
        { title: { contains: term, mode: "insensitive" } },
        { analysis: { fileName: { contains: term, mode: "insensitive" } } }
      );
    }
  });
}

// Search in content for completed stories (overview and key insights)
if (sanitizedSearch.length >= 3) {
  searchConditions.push({
    AND: [
      { status: 'COMPLETED' },
      { content: { path: ['overview'], string_contains: sanitizedSearch } }
    ]
  });
  
  searchConditions.push({
    AND: [
      { status: 'COMPLETED' },
      { content: { path: ['keyInsights'], array_contains: [sanitizedSearch] } }
    ]
  });
}
```

### 2. Enhanced Pagination Metadata

The pagination response now includes comprehensive metadata:

```typescript
pagination: {
  page: number,           // Current page number
  limit: number,          // Items per page
  totalCount: number,     // Total number of items
  totalPages: number,     // Total number of pages
  hasNext: boolean,       // Whether there's a next page
  hasPrev: boolean,       // Whether there's a previous page
  startIndex: number,     // Starting index of current page items
  endIndex: number,       // Ending index of current page items
}
```

### 3. Optimized Database Queries

#### Query Optimizations
- **Selective Field Loading**: Only loads necessary fields to reduce data transfer
- **Efficient Joins**: Optimized joins with the Analysis table
- **Consistent Pagination**: Secondary sort by ID for consistent pagination results
- **Parallel Queries**: Count and data queries run in parallel for better performance

#### Database Query Structure
```typescript
const [stories, totalCount] = await Promise.all([
  prisma.story.findMany({
    where,
    select: {
      id: true,
      title: true,
      status: true,
      generatedAt: true,
      aiProvider: true,
      modelId: true,
      processingTime: true,
      promptVersion: true,
      errorMessage: true,
      content: true,
      analysis: {
        select: {
          fileName: true,
          provider: true,
          modelId: true,
          analysisDate: true,
          templateId: true,
        }
      }
    },
    orderBy: [
      { generatedAt: "desc" },
      { id: "desc" } // Secondary sort for consistent pagination
    ],
    skip: offset,
    take: limit,
  }),
  prisma.story.count({ where })
]);
```

### 4. Enhanced Content Preview Generation

The content preview generation now uses intelligent logic to create meaningful previews:

#### Preview Priority Order
1. **Story Overview**: Most descriptive content
2. **First Chapter Content**: If no overview available
3. **First Chapter Summary**: If no chapter content
4. **Key Insights**: Combined insights as fallback
5. **Conclusion**: Last resort content

#### Intelligent Truncation
- **Word Boundary Truncation**: Cuts at word boundaries when possible
- **Text Cleanup**: Removes excessive whitespace and newlines
- **Length Optimization**: 200 character limit with smart truncation
- **Fallback Logic**: Multiple content sources for robust preview generation

```typescript
const generateContentPreview = (story: any): string | null => {
  if (story.status !== 'COMPLETED' || !story.content) {
    return null;
  }
  
  const content = story.content as any;
  const previewLength = 200;
  
  // Priority order for preview content
  let previewText = '';
  
  // 1. Try overview first (most descriptive)
  if (content.overview && typeof content.overview === 'string') {
    previewText = content.overview.trim();
  }
  // 2. Try first chapter content if no overview
  else if (content.chapters && Array.isArray(content.chapters) && content.chapters.length > 0) {
    const firstChapter = content.chapters[0];
    if (firstChapter.content && typeof firstChapter.content === 'string') {
      previewText = firstChapter.content.trim();
    } else if (firstChapter.summary && typeof firstChapter.summary === 'string') {
      previewText = firstChapter.summary.trim();
    }
  }
  // 3. Try key insights as fallback
  else if (content.keyInsights && Array.isArray(content.keyInsights) && content.keyInsights.length > 0) {
    previewText = content.keyInsights.slice(0, 2).join('. ').trim();
  }
  // 4. Try conclusion as last resort
  else if (content.conclusion && typeof content.conclusion === 'string') {
    previewText = content.conclusion.trim();
  }
  
  if (!previewText) {
    return null;
  }
  
  // Clean up the text (remove excessive whitespace, newlines)
  previewText = previewText.replace(/\s+/g, ' ').trim();
  
  // Truncate intelligently at word boundaries
  if (previewText.length <= previewLength) {
    return previewText;
  }
  
  // Find the last complete word within the limit
  const truncated = previewText.substring(0, previewLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  if (lastSpaceIndex > previewLength * 0.7) { // Only truncate at word boundary if it's not too short
    return truncated.substring(0, lastSpaceIndex) + '...';
  }
  
  return truncated + '...';
};
```

## Database Indexing Recommendations

For optimal performance, the following database indexes are recommended:

### Recommended Indexes
```sql
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
```

### Applying Indexes
Run the SQL script to apply these optimizations:
```bash
# Apply database optimizations
psql $DATABASE_URL -f scripts/optimize-story-search-indexes.sql
```

## API Usage Examples

### Basic Story Listing
```javascript
GET /api/stories?page=1&limit=10
```

### Search with Fuzzy Matching
```javascript
GET /api/stories?search=conversation analysis&page=1&limit=10
```

### Filter by Status
```javascript
GET /api/stories?status=COMPLETED&page=1&limit=10
```

### Combined Search and Filter
```javascript
GET /api/stories?search=whatsapp&status=COMPLETED&page=1&limit=10
```

## Response Format

```typescript
{
  success: true,
  data: {
    stories: [
      {
        id: string,
        title: string,
        status: 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED',
        generatedAt: string,
        aiProvider: string,
        modelId: string,
        processingTime: number | null,
        promptVersion: string,
        errorMessage: string | null,
        analysis: {
          fileName: string,
          provider: string,
          modelId: string,
          analysisDate: string,
          templateId: string,
        },
        contentPreview: string | null
      }
    ],
    pagination: {
      page: number,
      limit: number,
      totalCount: number,
      totalPages: number,
      hasNext: boolean,
      hasPrev: boolean,
      startIndex: number,
      endIndex: number,
    }
  },
  timestamp: string,
  requestId: string
}
```

## Performance Considerations

### Search Performance
- **Minimum Search Length**: Content search only activates for terms ≥3 characters
- **Word Filtering**: Individual word search only for terms ≥2 characters
- **Index Usage**: Leverages database indexes for optimal query performance

### Memory Optimization
- **Selective Loading**: Only loads necessary fields from database
- **Efficient Joins**: Optimized relationship loading
- **Parallel Processing**: Count and data queries run concurrently

### Caching Recommendations
- Consider implementing Redis caching for frequently accessed stories
- Cache search results for common search terms
- Implement pagination result caching for better performance

## Testing

Use the provided test script to verify functionality:
```bash
npx tsx scripts/test-enhanced-stories-api.ts
```

The test script validates:
- Database connectivity and story structure
- Content preview generation logic
- Search pattern generation
- Performance optimization recommendations

## Requirements Satisfied

This implementation satisfies the following requirements:

- **Requirement 1.2**: Enhanced search and filtering capabilities
- **Requirement 1.3**: Improved pagination with comprehensive metadata
- **Requirement 1.5**: Better story metadata display and content previews

The enhanced API provides a robust foundation for improved story discovery and management in the CharismaAI platform.