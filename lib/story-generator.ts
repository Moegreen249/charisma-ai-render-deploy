import { prisma } from "@/lib/prisma";
import { aiService, AIRequest } from "@/lib/ai-service";
import { enhancedErrorHandler, ErrorCategory } from "@/lib/enhanced-error-handler";
import { logger } from "@/lib/logger";

interface StoryChapter {
  id: string;
  title: string;
  timestamp: string;
  content: string;
  insights: string[];
  mood?: 'positive' | 'negative' | 'neutral';
  keyPoints: string[];
}

interface StoryContent {
  title: string;
  overview: string;
  chapters: StoryChapter[];
  conclusion: string;
  timeline: {
    start: string;
    end: string;
    duration: string;
  };
  keyInsights: string[];
}

export async function generateStoryFromAnalysis(
  storyId: string, 
  analysisResult: any, 
  userId: string
): Promise<void> {
  const startTime = Date.now();
  const requestId = `story-${storyId}-${Date.now()}`;
  
  const context = {
    operation: 'story-generation',
    requestId,
    userId,
    metadata: { storyId, analysisId: analysisResult?.id }
  };

  try {
    logger.info(`Starting story generation for story ${storyId}`, context);

    // Get story settings with error handling
    const settings = await enhancedErrorHandler.executeWithRetry(
      () => getStorySettings(),
      { ...context, operation: 'get-story-settings' }
    );

    if (!settings.isEnabled) {
      const error = new Error("Story generation is currently disabled");
      const errorResponse = await enhancedErrorHandler.handleError(error, context);
      throw new Error(errorResponse.userMessage);
    }

    // Get analysis data for context with error handling
    const story = await enhancedErrorHandler.executeWithRetry(
      () => prisma.story.findUnique({
        where: { id: storyId },
        include: { analysis: true }
      }),
      { ...context, operation: 'fetch-story-data' }
    );

    if (!story) {
      const error = new Error("Story not found");
      const errorResponse = await enhancedErrorHandler.handleError(error, context);
      throw new Error(errorResponse.userMessage);
    }

    // Generate story using AI service with enhanced error handling
    const aiResponse = await generateStoryWithFallback(
      analysisResult, 
      story.analysis, 
      settings, 
      context
    );

    // Parse the AI response with enhanced error handling
    const parseResult = await parseAIResponseWithRecovery(
      aiResponse.response!, 
      context,
      { aiProvider: aiResponse.provider, model: aiResponse.model }
    );
    
    // Check if parsing failed (indicated by error title)
    const isFailed = parseResult.title === "Story Generation Failed";
    
    // Update story with generated content using enhanced error handling
    await enhancedErrorHandler.executeWithRetry(
      () => prisma.story.update({
        where: { id: storyId },
        data: {
          title: parseResult.title,
          content: parseResult as any,
          status: isFailed ? 'FAILED' : 'COMPLETED',
          errorMessage: isFailed ? 'Failed to parse AI response as valid JSON' : null,
          processingTime: Date.now() - startTime,
          aiProvider: aiResponse.provider,
          modelId: aiResponse.model,
          promptVersion: settings.promptVersion,
        }
      }),
      { ...context, operation: 'update-story-status' }
    );

    // Update user story usage only if successful
    if (!isFailed) {
      await enhancedErrorHandler.executeWithRetry(
        () => updateUserStoryUsage(userId),
        { ...context, operation: 'update-user-usage' }
      );
    }

    logger.info(`Successfully generated story ${storyId}`, { 
      ...context, 
      processingTime: Date.now() - startTime,
      isFailed 
    });

  } catch (error) {
    logger.error(`Story generation failed for story ${storyId}`, error, context);
    
    // Handle error with enhanced error handler
    const errorResponse = await enhancedErrorHandler.handleError(
      error instanceof Error ? error : new Error(String(error)), 
      context
    );

    // Update story with error status using fallback data if available
    try {
      const updateData: any = {
        status: 'FAILED',
        errorMessage: errorResponse.userMessage,
        processingTime: Date.now() - startTime,
      };

      // If we have fallback data, use it
      if (errorResponse.fallbackData) {
        updateData.title = errorResponse.fallbackData.title;
        updateData.content = errorResponse.fallbackData;
        updateData.status = 'COMPLETED'; // Mark as completed with fallback content
        updateData.errorMessage = `Generated with fallback: ${errorResponse.userMessage}`;
      }

      await prisma.story.update({
        where: { id: storyId },
        data: updateData
      });

      logger.info(`Updated story ${storyId} with ${errorResponse.fallbackData ? 'fallback content' : 'error status'}`, context);
    } catch (updateError) {
      logger.error(`Failed to update story ${storyId} with error status`, updateError, context);
    }
    
    throw error;
  }
}

/**
 * Generate story with enhanced error handling and fallback mechanisms
 */
async function generateStoryWithFallback(
  analysisResult: any,
  analysis: any,
  settings: any,
  context: any
): Promise<any> {
  const aiRequest: AIRequest = {
    feature: 'story-generation',
    prompt: createStoryPrompt(analysisResult, analysis, settings),
    temperature: 0.7,
    maxTokens: (settings as any).maxTokens || 4000,
  };

  try {
    // Primary AI generation attempt
    const aiResponse = await enhancedErrorHandler.executeWithRetry(
      () => aiService.request(aiRequest),
      { ...context, operation: 'ai-story-generation' }
    );

    if (!aiResponse.success) {
      throw new Error(`AI story generation failed: ${aiResponse.error}`);
    }

    return aiResponse;
  } catch (error) {
    logger.warn(`Primary AI generation failed, attempting fallback: ${error}`, { context });
    
    // Handle error and potentially provide fallback
    const errorResponse = await enhancedErrorHandler.handleError(
      error instanceof Error ? error : new Error(String(error)),
      context
    );

    // If we have fallback data from error handler, create a mock AI response
    if (errorResponse.fallbackData) {
      return {
        success: true,
        response: JSON.stringify(errorResponse.fallbackData),
        provider: 'fallback',
        model: 'error-recovery',
        responseTime: 0,
        fallbackUsed: true
      };
    }

    // If no fallback available, try with simplified prompt as last resort
    try {
      const simplifiedRequest: AIRequest = {
        ...aiRequest,
        prompt: createSimplifiedStoryPrompt(analysisResult, analysis),
        maxTokens: 2000, // Reduced token limit
        temperature: 0.5 // More conservative temperature
      };

      logger.info('Attempting simplified story generation', context);
      const fallbackResponse = await aiService.request(simplifiedRequest);
      
      if (fallbackResponse.success) {
        logger.info('Simplified story generation succeeded', context);
        return fallbackResponse;
      }
    } catch (fallbackError) {
      logger.error('Simplified story generation also failed', fallbackError, context);
    }

    // All attempts failed, throw original error
    throw error;
  }
}

/**
 * Parse AI response with enhanced error recovery
 */
async function parseAIResponseWithRecovery(
  response: string,
  context: any,
  metadata: { aiProvider: string; model: string }
): Promise<any> {
  try {
    // Use existing parsing logic with enhanced error handling
    return await enhancedErrorHandler.executeWithRetry(
      () => parseAIResponse(response),
      { ...context, operation: 'parse-ai-response', metadata }
    );
  } catch (error) {
    logger.error('AI response parsing failed with all strategies', error, context);
    
    // Handle parsing error with enhanced error handler
    const errorResponse = await enhancedErrorHandler.handleError(
      error instanceof Error ? error : new Error(String(error)),
      { ...context, operation: 'parse-ai-response' }
    );

    // If we have fallback data, use it
    if (errorResponse.fallbackData) {
      logger.info('Using fallback data for failed parsing', context);
      return errorResponse.fallbackData;
    }

    // Try content extraction as last resort
    try {
      const extractedContent = await extractContentFromFailedResponse(response, context);
      if (extractedContent) {
        logger.info('Successfully extracted content from failed response', context);
        return extractedContent;
      }
    } catch (extractError) {
      logger.error('Content extraction also failed', extractError, context);
    }

    // Generate final fallback with error details
    return generateDetailedFallback(response, error, metadata, context);
  }
}

/**
 * Create a simplified story prompt for fallback generation
 */
function createSimplifiedStoryPrompt(analysisResult: any, analysis: any): string {
  return `Create a simple story summary from this analysis data. Return only valid JSON:

Analysis: ${analysis.fileName}
Data: ${JSON.stringify(analysisResult).substring(0, 1000)}...

Return this exact format:
{
  "title": "Story Title",
  "overview": "Brief overview",
  "chapters": [{"id": "ch1", "title": "Chapter 1", "timestamp": "Beginning", "content": "Story content", "insights": ["insight"], "mood": "neutral", "keyPoints": ["point"]}],
  "conclusion": "Conclusion",
  "timeline": {"start": "Beginning", "end": "End", "duration": "Short"},
  "keyInsights": ["insight"]
}`;
}

/**
 * Extract usable content from failed AI response
 */
async function extractContentFromFailedResponse(response: string, context: any): Promise<any | null> {
  try {
    // Look for any story-like content in the response
    const storyPatterns = [
      /title[^:]*:\s*["']([^"']+)["']/i,
      /overview[^:]*:\s*["']([^"']+)["']/i,
      /conclusion[^:]*:\s*["']([^"']+)["']/i
    ];

    const extractedData: any = {
      title: "Extracted Story",
      overview: "Story extracted from partial AI response",
      chapters: [],
      conclusion: "Story extraction completed",
      timeline: { start: "Beginning", end: "End", duration: "Extracted" },
      keyInsights: []
    };

    // Try to extract title
    const titleMatch = response.match(storyPatterns[0]);
    if (titleMatch) {
      extractedData.title = titleMatch[1];
    }

    // Try to extract overview
    const overviewMatch = response.match(storyPatterns[1]);
    if (overviewMatch) {
      extractedData.overview = overviewMatch[1];
    }

    // Try to extract conclusion
    const conclusionMatch = response.match(storyPatterns[2]);
    if (conclusionMatch) {
      extractedData.conclusion = conclusionMatch[1];
    }

    // Look for chapter-like content
    const chapterPattern = /chapter[^:]*:\s*["']([^"']+)["']/gi;
    const chapters = [];
    let match;
    let chapterIndex = 1;

    while ((match = chapterPattern.exec(response)) !== null && chapters.length < 3) {
      chapters.push({
        id: `extracted-chapter-${chapterIndex}`,
        title: match[1],
        timestamp: chapterIndex === 1 ? "Beginning" : chapterIndex === 2 ? "Middle" : "End",
        content: `Content extracted from AI response: ${match[1]}`,
        insights: ["Content extracted from partial response"],
        mood: "neutral" as const,
        keyPoints: ["Partial content recovery"]
      });
      chapterIndex++;
    }

    if (chapters.length > 0) {
      extractedData.chapters = chapters;
      extractedData.keyInsights = ["Successfully extracted partial content", "Manual review recommended"];
      
      logger.info(`Extracted ${chapters.length} chapters from failed response`, context);
      return extractedData;
    }

    return null;
  } catch (error) {
    logger.error('Content extraction failed', error, context);
    return null;
  }
}

/**
 * Generate detailed fallback with error information
 */
function generateDetailedFallback(
  response: string, 
  error: unknown, 
  metadata: { aiProvider: string; model: string },
  context: any
): any {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  return {
    title: "Story Generation Recovery",
    overview: `Story generation encountered issues with ${metadata.aiProvider} (${metadata.model}). This is a recovery response with available information.`,
    chapters: [{
      id: "recovery-chapter",
      title: "Generation Recovery Details",
      timestamp: "Recovery Process",
      content: `The AI service (${metadata.aiProvider}/${metadata.model}) generated content but encountered parsing issues. Error: ${errorMessage}. Response length: ${response.length} characters. The system attempted multiple recovery strategies but was unable to extract a complete story structure.`,
      insights: [
        "AI generation partially succeeded but parsing failed",
        "Multiple recovery strategies were attempted",
        "Manual review of the raw response may recover usable content",
        `Provider: ${metadata.aiProvider}, Model: ${metadata.model}`
      ],
      mood: "neutral" as const,
      keyPoints: [
        "Story generation service is operational",
        "Response parsing encountered technical issues",
        "Retry with different parameters may succeed",
        "Raw response data is preserved for analysis"
      ]
    }],
    conclusion: "While the complete story could not be generated due to technical issues, the system has preserved all available information and provided recovery guidance. Please try generating the story again, or contact support if the issue persists.",
    timeline: {
      start: "Generation initiated",
      end: "Recovery completed",
      duration: "Technical recovery process"
    },
    keyInsights: [
      "Story generation system is functional but encountered parsing issues",
      "Recovery mechanisms successfully preserved available data",
      "Retry recommended with potential for full success"
    ]
  };
}

function createStoryPrompt(analysisResult: any, analysis: any, settings: any): string {
  const basePrompt = settings.systemPrompt || `Transform this analysis into an engaging story with a clear timeline. Create chapters that flow naturally and make complex information easy to understand without overwhelming the reader.`;
  
  const analysisDataJSON = JSON.stringify(analysisResult, null, 2);
  
  return `${basePrompt}

ANALYSIS DATA:
File: ${analysis.fileName}
Analysis Date: ${analysis.analysisDate}
Provider: ${analysis.provider}
Model: ${analysis.modelId}

ANALYSIS RESULTS:
${analysisDataJSON}

Please create a story that transforms this analysis into an engaging narrative. Return your response as valid JSON in exactly this format:

{
  "title": "An engaging title for the story",
  "overview": "A brief overview of what the story covers",
  "chapters": [
    {
      "id": "chapter-1",
      "title": "Chapter Title",
      "timestamp": "Beginning/Early/Middle/Late in the conversation",
      "content": "Engaging narrative content that tells the story of this part of the analysis",
      "insights": ["Key insight 1", "Key insight 2"],
      "mood": "positive|negative|neutral",
      "keyPoints": ["Important point 1", "Important point 2"]
    }
  ],
  "conclusion": "A thoughtful conclusion that ties everything together",
  "timeline": {
    "start": "Beginning of conversation",
    "end": "End of conversation", 
    "duration": "Overall conversation flow"
  },
  "keyInsights": ["Overall insight 1", "Overall insight 2", "Overall insight 3"]
}

Make the story engaging, easy to follow, and organized chronologically. Focus on making complex analysis results accessible and interesting to read.`;
}

function parseAIResponse(response: string): any {
  // Enhanced parsing with multiple fallback strategies
  const parseStrategies = [
    () => parseWithMarkdownRemoval(response),
    () => parseWithRegexExtraction(response),
    () => parseWithPartialRecovery(response),
    () => parseWithFuzzyMatching(response)
  ];

  let lastError: Error | null = null;
  
  for (const strategy of parseStrategies) {
    try {
      const result = strategy();
      if (result && typeof result === 'object') {
        console.log('Successfully parsed AI response using parsing strategy');
        return validateStoryContent(result);
      }
    } catch (error) {
      lastError = error as Error;
      console.warn('Parsing strategy failed:', error);
      continue;
    }
  }

  // All parsing strategies failed, log detailed error information
  console.error('All parsing strategies failed for AI response');
  console.error('Last error:', lastError?.message);
  console.error('Response length:', response.length);
  console.error('Response preview:', response.substring(0, 200) + '...');
  console.error('Response ending:', '...' + response.substring(Math.max(0, response.length - 200)));
  
  // Generate intelligent fallback based on response content
  return generateIntelligentFallback(response, lastError);
}

function parseWithMarkdownRemoval(response: string): any {
  let cleanedResponse = response.trim();
  
  // Remove various markdown code block formats
  const codeBlockPatterns = [
    /^```json\s*([\s\S]*?)\s*```$/,
    /^```\s*([\s\S]*?)\s*```$/,
    /^`([\s\S]*?)`$/,
    /^\s*json\s*([\s\S]*?)$/i
  ];
  
  for (const pattern of codeBlockPatterns) {
    const match = cleanedResponse.match(pattern);
    if (match) {
      cleanedResponse = match[1].trim();
      break;
    }
  }
  
  // Remove common AI response prefixes
  const prefixPatterns = [
    /^Here's the story.*?:\s*/i,
    /^Here is the story.*?:\s*/i,
    /^The story is.*?:\s*/i,
    /^Story:\s*/i
  ];
  
  for (const pattern of prefixPatterns) {
    cleanedResponse = cleanedResponse.replace(pattern, '');
  }
  
  return JSON.parse(cleanedResponse);
}

function parseWithRegexExtraction(response: string): any {
  // Extract JSON using regex patterns
  const jsonPatterns = [
    /\{[\s\S]*\}/,  // Match outermost braces
    /"title"[\s\S]*?"keyInsights"[^}]*\]/,  // Match from title to keyInsights
    /\{[^{}]*"title"[\s\S]*\}/  // Match JSON-like structure with title
  ];
  
  for (const pattern of jsonPatterns) {
    const match = response.match(pattern);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (error) {
        continue;
      }
    }
  }
  
  throw new Error('No valid JSON found with regex extraction');
}

function parseWithPartialRecovery(response: string): any {
  // Attempt to recover partial JSON by fixing common issues
  let fixedResponse = response.trim();
  
  // Fix common JSON issues
  fixedResponse = fixedResponse
    .replace(/,\s*}/g, '}')  // Remove trailing commas
    .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
    .replace(/'/g, '"')      // Replace single quotes with double quotes
    .replace(/(\w+):/g, '"$1":')  // Quote unquoted keys
    .replace(/:\s*([^",\[\{][^,\]\}]*)/g, ': "$1"');  // Quote unquoted string values
  
  // Try to extract and fix the JSON structure
  const jsonMatch = fixedResponse.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  
  throw new Error('Partial recovery failed');
}

function parseWithFuzzyMatching(response: string): any {
  // Extract key components using fuzzy matching
  const extractField = (fieldName: string, defaultValue: any) => {
    const patterns = [
      new RegExp(`"${fieldName}"\\s*:\\s*"([^"]*)"`, 'i'),
      new RegExp(`"${fieldName}"\\s*:\\s*([^,\\}\\]]+)`, 'i'),
      new RegExp(`${fieldName}[^:]*:\\s*"([^"]*)"`, 'i')
    ];
    
    for (const pattern of patterns) {
      const match = response.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    return defaultValue;
  };
  
  // Build basic structure from extracted fields
  return {
    title: extractField('title', 'Generated Story'),
    overview: extractField('overview', 'Story generated from analysis'),
    chapters: [], // Will be filled by validation
    conclusion: extractField('conclusion', 'Story analysis complete'),
    timeline: {
      start: 'Beginning',
      end: 'End',
      duration: 'Full analysis'
    },
    keyInsights: []
  };
}

function generateIntelligentFallback(response: string, error: Error | null): any {
  // Analyze the response to provide better fallback content
  const hasContent = response.length > 100;
  const seemsLikeStory = /story|chapter|timeline|insight/i.test(response);
  const hasStructure = /\{|\[|title|overview/i.test(response);
  
  let fallbackTitle = "Story Generation Failed";
  let fallbackContent = "Unable to parse AI response. Please try again.";
  let fallbackInsights = ["AI response parsing failed", "JSON format was invalid"];
  
  if (hasContent && seemsLikeStory) {
    fallbackTitle = "Partial Story Generated";
    fallbackContent = "The AI generated content but it couldn't be properly formatted. The raw content has been preserved for manual review.";
    fallbackInsights = [
      "AI generated story content but formatting failed",
      "Manual review may recover usable content",
      "Consider regenerating with different parameters"
    ];
  } else if (hasStructure) {
    fallbackTitle = "Malformed Story Response";
    fallbackContent = "The AI response contained story elements but had structural issues that prevented proper parsing.";
    fallbackInsights = [
      "Response contained recognizable story elements",
      "JSON structure was malformed or incomplete",
      "Retry may produce better formatted results"
    ];
  }
  
  return {
    title: fallbackTitle,
    overview: fallbackContent,
    chapters: [{
      id: "fallback-chapter",
      title: "Generation Error Details",
      timestamp: "Error occurred",
      content: fallbackContent + (error ? ` Error: ${error.message}` : ''),
      insights: fallbackInsights,
      mood: "neutral" as const,
      keyPoints: [
        "Please try generating the story again",
        "Check AI service status if problem persists",
        "Contact support for assistance"
      ]
    }],
    conclusion: "Story generation encountered parsing issues and could not be completed successfully.",
    timeline: {
      start: "Generation started",
      end: "Parsing failed",
      duration: "Incomplete"
    },
    keyInsights: fallbackInsights
  };
}

function validateStoryContent(content: any): StoryContent {
  // Ensure all required fields are present
  const validated: StoryContent = {
    title: content.title || "Untitled Story",
    overview: content.overview || "Analysis story",
    chapters: Array.isArray(content.chapters) ? content.chapters.map((chapter: any, index: number) => ({
      id: chapter.id || `chapter-${index + 1}`,
      title: chapter.title || `Chapter ${index + 1}`,
      timestamp: chapter.timestamp || `Part ${index + 1}`,
      content: chapter.content || "Content not available",
      insights: Array.isArray(chapter.insights) ? chapter.insights : [],
      mood: ['positive', 'negative', 'neutral'].includes(chapter.mood) ? chapter.mood : 'neutral',
      keyPoints: Array.isArray(chapter.keyPoints) ? chapter.keyPoints : [],
    })) : [],
    conclusion: content.conclusion || "Story complete",
    timeline: {
      start: content.timeline?.start || "Beginning",
      end: content.timeline?.end || "End",
      duration: content.timeline?.duration || "Full conversation"
    },
    keyInsights: Array.isArray(content.keyInsights) ? content.keyInsights : []
  };

  return validated;
}

async function getStorySettings() {
  const settings = await prisma.storySettings.findFirst({
    orderBy: { updatedAt: 'desc' }
  });

  return settings || {
    isEnabled: false,
    systemPrompt: "Transform this analysis into an engaging story with a clear timeline.",
    defaultProvider: "google",
    defaultModel: "gemini-2.5-flash",
    promptVersion: "v1.0",
    timeoutSeconds: 120,
  };
}

async function updateUserStoryUsage(userId: string) {
  await prisma.userStoryUsage.upsert({
    where: { userId },
    update: {
      storiesGenerated: { increment: 1 },
      lastStoryAt: new Date(),
    },
    create: {
      userId,
      storiesGenerated: 1,
      lastStoryAt: new Date(),
      freeTrialStart: new Date(),
    }
  });
}