import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
  
  try {
    // Get story settings
    const settings = await getStorySettings();
    if (!settings.isEnabled) {
      throw new Error("Story generation is currently disabled");
    }

    // Get analysis data for context
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        analysis: true
      }
    });

    if (!story) {
      throw new Error("Story not found");
    }

    // Generate story using AI
    const storyContent = await generateStoryWithAI(
      analysisResult, 
      story.analysis, 
      settings
    );

    // Update story with generated content
    await prisma.story.update({
      where: { id: storyId },
      data: {
        title: storyContent.title,
        content: storyContent as any,
        status: 'COMPLETED',
        processingTime: Date.now() - startTime,
        aiProvider: settings.defaultProvider,
        modelId: settings.defaultModel,
        promptVersion: settings.promptVersion,
      }
    });

    // Update user story usage
    await updateUserStoryUsage(userId);

  } catch (error) {
    console.error('Story generation failed:', error);
    
    // Update story with error status
    await prisma.story.update({
      where: { id: storyId },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime,
      }
    });
    
    throw error;
  }
}

async function generateStoryWithAI(
  analysisResult: any, 
  analysis: any, 
  settings: any
): Promise<StoryContent> {
  // For now, using Google Gemini as default
  // TODO: Add support for other providers based on settings
  
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("Google AI API key not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: settings.defaultModel || "gemini-1.5-flash" });

  const prompt = createStoryPrompt(analysisResult, analysis, settings);
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the AI response as JSON
    const storyContent = JSON.parse(text);
    
    // Validate and ensure proper structure
    return validateStoryContent(storyContent);
    
  } catch (error) {
    console.error('AI generation error:', error);
    throw new Error('Failed to generate story with AI');
  }
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
    defaultModel: "gemini-1.5-flash",
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