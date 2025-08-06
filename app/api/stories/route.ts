import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authConfig } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { 
  createApiErrorResponse, 
  createApiSuccessResponse, 
  withApiErrorHandler, 
  ApiErrorCode,
  validatePaginationParams 
} from "@/lib/api-error-handler";

export const GET = withApiErrorHandler(async (request: NextRequest) => {
  const session = await getServerSession(authConfig);

  if (!session) {
    return createApiErrorResponse(ApiErrorCode.UNAUTHORIZED);
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  
  // Validate and sanitize pagination parameters
  const { page, limit, offset } = validatePaginationParams(
    searchParams.get("page"),
    searchParams.get("limit")
  );

  // Build where clause
  const where: any = {
    userId: session.user.id,
  };

  if (status && status !== "all") {
    // Validate status parameter
    const validStatuses = ['PENDING', 'GENERATING', 'COMPLETED', 'FAILED'];
    const upperStatus = status.toUpperCase();
    if (!validStatuses.includes(upperStatus)) {
      return createApiErrorResponse(
        ApiErrorCode.INVALID_INPUT,
        `Invalid status filter. Must be one of: ${validStatuses.join(', ')}`
      );
    }
    where.status = upperStatus;
  }

  if (search) {
    // Sanitize search input
    const sanitizedSearch = search.trim();
    if (sanitizedSearch.length > 100) {
      return createApiErrorResponse(
        ApiErrorCode.INVALID_INPUT,
        "Search query too long. Maximum 100 characters allowed."
      );
    }
    
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
    
    where.OR = searchConditions;
  }

  // Optimized database query with efficient joins and selective field loading
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
        // Only load content for completed stories to optimize query performance
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
    // Use more efficient count query
    prisma.story.count({ where })
  ]);

  // Helper function to generate enhanced content preview
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

  // Transform stories for client
  const transformedStories = stories.map(story => ({
    id: story.id,
    title: story.title,
    status: story.status,
    generatedAt: story.generatedAt,
    aiProvider: story.aiProvider,
    modelId: story.modelId,
    processingTime: story.processingTime,
    promptVersion: story.promptVersion,
    errorMessage: story.errorMessage,
    analysis: {
      fileName: story.analysis.fileName,
      provider: story.analysis.provider,
      modelId: story.analysis.modelId,
      analysisDate: story.analysis.analysisDate,
      templateId: story.analysis.templateId,
    },
    // Enhanced content preview generation
    contentPreview: generateContentPreview(story)
  }));

  const responseData = {
    stories: transformedStories,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasNext: page * limit < totalCount,
      hasPrev: page > 1,
      startIndex: offset + 1,
      endIndex: Math.min(offset + limit, totalCount),
    }
  };

  return createApiSuccessResponse(responseData);
}, '/api/stories');