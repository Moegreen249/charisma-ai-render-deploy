import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { getModelInfo, getProviderConfig } from "@/lib/ai-providers";
import { getAllAnalysisTemplates } from "@/lib/analysis-templates";
import { logPlatformError } from "./error-tracker";
import { trackUserActivity } from "./analytics";

export interface BackgroundJobData {
  userId: string;
  templateId: string;
  modelId: string;
  provider: string;
  fileName: string;
  fileContent: string;
  apiKey: string;
}

export class BackgroundJobProcessor {
  private static instance: BackgroundJobProcessor;
  private processingJobs = new Set<string>();
  private maxConcurrentJobs = 3;
  private retryAttempts = 3;
  private retryDelay = 5000; // 5 seconds

  private constructor() {
    // Start the job processing loop
    this.startProcessingLoop();
  }

  public static getInstance(): BackgroundJobProcessor {
    if (!BackgroundJobProcessor.instance) {
      BackgroundJobProcessor.instance = new BackgroundJobProcessor();
    }
    return BackgroundJobProcessor.instance;
  }

  /**
   * Create a new background analysis job
   */
  async createAnalysisJob(data: BackgroundJobData): Promise<string> {
    try {
      const job = await prisma.backgroundJob.create({
        data: {
          userId: data.userId,
          type: "ANALYSIS",
          status: "PENDING",
          templateId: data.templateId,
          modelId: data.modelId,
          provider: data.provider,
          fileName: data.fileName,
          fileContent: data.fileContent,
          apiKey: data.apiKey,
          totalSteps: 4, // Analysis steps: parsing, AI processing, validation, saving
          currentStep: "Queued for processing",
        },
      });

      // Track user activity
      await trackUserActivity({
        userId: data.userId,
        action: "analysis_job_created",
        category: "analysis",
        metadata: {
          jobId: job.id,
          fileName: data.fileName,
          provider: data.provider,
        },
      });

      console.log(`Created background job ${job.id} for user ${data.userId}`);
      return job.id;
    } catch (error) {
      await logPlatformError({
        category: "SYSTEM",
        severity: "HIGH",
        message: "Failed to create background job",
        userId: data.userId,
        stackTrace: error instanceof Error ? error.stack : undefined,
        requestData: { ...data, fileContent: "[REDACTED]" },
      });
      throw error;
    }
  }

  /**
   * Get job status and progress
   */
  async getJobStatus(jobId: string, userId: string) {
    try {
      const job = await prisma.backgroundJob.findFirst({
        where: {
          id: jobId,
          userId: userId,
        },
        select: {
          id: true,
          status: true,
          progress: true,
          currentStep: true,
          totalSteps: true,
          error: true,
          result: true,
          startedAt: true,
          completedAt: true,
          createdAt: true,
        },
      });

      if (!job) {
        throw new Error("Job not found or access denied");
      }

      return {
        ...job,
        isComplete: job.status === "COMPLETED" || job.status === "FAILED",
        estimatedTimeRemaining: this.calculateEstimatedTime(job),
      };
    } catch (error) {
      await logPlatformError({
        category: "DATABASE",
        severity: "MEDIUM",
        message: "Failed to get job status",
        userId: userId,
        stackTrace: error instanceof Error ? error.stack : undefined,
        requestData: { jobId },
      });
      throw error;
    }
  }

  /**
   * Get user's job history
   */
  async getUserJobs(userId: string, limit = 10) {
    try {
      const jobs = await prisma.backgroundJob.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          status: true,
          progress: true,
          fileName: true,
          error: true,
          startedAt: true,
          completedAt: true,
          createdAt: true,
        },
      });

      return jobs;
    } catch (error) {
      await logPlatformError({
        category: "DATABASE",
        severity: "MEDIUM",
        message: "Failed to get user jobs",
        userId: userId,
        stackTrace: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  /**
   * Cancel a pending or processing job
   */
  async cancelJob(jobId: string, userId: string) {
    try {
      const job = await prisma.backgroundJob.updateMany({
        where: {
          id: jobId,
          userId: userId,
          status: { in: ["PENDING", "PROCESSING"] },
        },
        data: {
          status: "CANCELLED",
          currentStep: "Cancelled by user",
          completedAt: new Date(),
        },
      });

      if (job.count === 0) {
        throw new Error("Job not found, already completed, or access denied");
      }

      // Remove from processing set
      this.processingJobs.delete(jobId);

      await trackUserActivity({
        userId: userId,
        action: "analysis_job_cancelled",
        category: "analysis",
        metadata: { jobId },
      });

      return true;
    } catch (error) {
      await logPlatformError({
        category: "SYSTEM",
        severity: "MEDIUM",
        message: "Failed to cancel job",
        userId: userId,
        stackTrace: error instanceof Error ? error.stack : undefined,
        requestData: { jobId },
      });
      throw error;
    }
  }

  /**
   * Main processing loop
   */
  private async startProcessingLoop() {
    console.log("Background job processor started");

    const processJobs = async () => {
      try {
        // Don't process if we're at max capacity
        if (this.processingJobs.size >= this.maxConcurrentJobs) {
          return;
        }

        // Get pending jobs
        const pendingJobs = await prisma.backgroundJob.findMany({
          where: {
            status: "PENDING",
            id: { notIn: Array.from(this.processingJobs) },
          },
          orderBy: { createdAt: "asc" },
          take: this.maxConcurrentJobs - this.processingJobs.size,
        });

        // Process each job
        for (const job of pendingJobs) {
          this.processJob(job.id).catch((error) => {
            console.error(`Error processing job ${job.id}:`, error);
          });
        }
      } catch (error) {
        console.error("Error in job processing loop:", error);
        await logPlatformError({
          category: "SYSTEM",
          severity: "HIGH",
          message: "Background job processing loop error",
          stackTrace: error instanceof Error ? error.stack : undefined,
        });
      }
    };

    // Run immediately and then every 5 seconds
    setInterval(processJobs, 5000);
    processJobs();
  }

  /**
   * Process a single job
   */
  private async processJob(jobId: string) {
    // Mark as processing
    this.processingJobs.add(jobId);

    try {
      // Update job status
      await prisma.backgroundJob.update({
        where: { id: jobId },
        data: {
          status: "PROCESSING",
          startedAt: new Date(),
          currentStep: "Starting analysis",
          progress: 0,
        },
      });

      // Get job details
      const job = await prisma.backgroundJob.findUnique({
        where: { id: jobId },
      });

      if (!job || !job.fileContent) {
        throw new Error("Job not found or missing file content");
      }

      // Step 1: Prepare file data
      await this.updateJobProgress(jobId, 25, "Preparing file data");

      // Get API key from job record (stored during job creation)
      const providerConfig = getProviderConfig(
        (job.provider as any) || "openai",
      );
      if (!providerConfig) {
        throw new Error(`Provider configuration not found: ${job.provider}`);
      }

      const apiKey = job.apiKey;
      if (!apiKey) {
        throw new Error(
          `No API key found for ${providerConfig.name}. Please check your settings and try again.`,
        );
      }

      // Step 2: Run analysis
      await this.updateJobProgress(jobId, 50, "Running AI analysis");

      const formData = new FormData();
      const file = new File([job.fileContent], job.fileName || "chat.txt", {
        type: "text/plain",
      });
      formData.append("chatFile", file);
      formData.append("templateId", job.templateId || "");
      formData.append("modelId", job.modelId || "");
      formData.append("provider", job.provider || "");
      formData.append("apiKey", apiKey);

      const result = await this.backgroundAnalyzeChat(formData, job.userId);

      if (!result.success) {
        throw new Error(result.error || "Analysis failed");
      }

      // Step 3: Validate results
      await this.updateJobProgress(jobId, 75, "Validating results");

      if (!result.data) {
        throw new Error("No analysis data returned");
      }

      // Step 4: Save and complete
      await this.updateJobProgress(jobId, 100, "Saving results");

      await prisma.backgroundJob.update({
        where: { id: jobId },
        data: {
          status: "COMPLETED",
          result: result.data as any,
          progress: 100,
          currentStep: "Analysis completed successfully",
          completedAt: new Date(),
        },
      });

      // Track completion
      await trackUserActivity({
        userId: job.userId,
        action: "analysis_job_completed",
        category: "analysis",
        metadata: {
          jobId,
          fileName: job.fileName,
          duration: job.startedAt
            ? Date.now() - job.startedAt.getTime()
            : undefined,
        },
      });

      console.log(`Completed background job ${jobId}`);
    } catch (error) {
      console.error(`Failed to process job ${jobId}:`, error);

      // Get current job to check retry count
      const currentJob = await prisma.backgroundJob.findUnique({
        where: { id: jobId },
        select: { retryCount: true },
      });

      const retryCount = (currentJob?.retryCount || 0) + 1;

      // Check if we should retry
      if (retryCount <= this.retryAttempts) {
        console.log(
          `Retrying job ${jobId} (attempt ${retryCount}/${this.retryAttempts})`,
        );

        // Schedule retry with exponential backoff
        setTimeout(async () => {
          await prisma.backgroundJob.update({
            where: { id: jobId },
            data: {
              status: "PENDING",
              progress: 0,
              currentStep: `Retrying... (attempt ${retryCount}/${this.retryAttempts})`,
              startedAt: null,
              retryCount: retryCount,
            },
          });
        }, this.retryDelay * retryCount);

        return;
      }

      // Mark job as failed with more detailed error message
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const detailedError = `Failed to analyze conversation after ${this.retryAttempts} attempts. Error: ${errorMessage}. Please check your API keys and provider settings.`;

      await prisma.backgroundJob.update({
        where: { id: jobId },
        data: {
          status: "FAILED",
          error: detailedError,
          currentStep: "Analysis failed",
          completedAt: new Date(),
          retryCount: retryCount,
        },
      });

      // Log the error
      const job = await prisma.backgroundJob.findUnique({
        where: { id: jobId },
      });

      await logPlatformError({
        category: "AI_PROVIDER",
        severity: "HIGH",
        message: `Background analysis job failed: ${error instanceof Error ? error.message : String(error)}`,
        userId: job?.userId,
        stackTrace: error instanceof Error ? error.stack : undefined,
        requestData: {
          jobId,
          fileName: job?.fileName,
          provider: job?.provider,
          modelId: job?.modelId,
          templateId: job?.templateId,
        },
      });

      await trackUserActivity({
        userId: job?.userId || "",
        action: "analysis_job_failed",
        category: "analysis",
        metadata: {
          jobId,
          error: error instanceof Error ? error.message : String(error),
        },
      });
    } finally {
      // Remove from processing set
      this.processingJobs.delete(jobId);
    }
  }

  /**
   * Update job progress
   */
  private async updateJobProgress(
    jobId: string,
    progress: number,
    currentStep: string,
  ) {
    await prisma.backgroundJob.update({
      where: { id: jobId },
      data: { progress, currentStep },
    });
  }

  /**
   * Calculate estimated time remaining
   */
  private calculateEstimatedTime(job: any): number | null {
    if (job.status !== "PROCESSING" || !job.startedAt) {
      return null;
    }

    const elapsedTime = Date.now() - new Date(job.startedAt).getTime();
    const progressRatio = job.progress / 100;

    if (progressRatio === 0) {
      return null;
    }

    const estimatedTotalTime = elapsedTime / progressRatio;
    const remainingTime = estimatedTotalTime - elapsedTime;

    return Math.max(0, remainingTime);
  }

  /**
   * Background-safe analyze function that doesn't require request context
   */
  private async backgroundAnalyzeChat(formData: FormData, userId: string) {
    try {
      // Extract form data
      const file = formData.get("chatFile") as File;
      const templateId = formData.get("templateId") as string;
      const modelId = formData.get("modelId") as string;
      const provider = formData.get("provider") as string;
      const apiKey = formData.get("apiKey") as string;
      const customTemplateStr = formData.get("customTemplate") as string;

      if (!file || !templateId || !modelId || !provider || !apiKey) {
        throw new Error("Missing required parameters");
      }

      // Read file content
      const fileContent = await file.text();
      if (!fileContent.trim()) {
        throw new Error("File content is empty");
      }

      // Get template and generate prompt
      let systemPrompt: string;
      let analysisPrompt: string;

      if (customTemplateStr) {
        const customTemplate = JSON.parse(customTemplateStr);
        systemPrompt = customTemplate.systemPrompt;
        analysisPrompt = customTemplate.analysisPromptString.replace(
          /\$\{chatContent\}/g,
          fileContent,
        );
      } else {
        const allTemplates = await getAllAnalysisTemplates();
        const template = allTemplates.find((t) => t.id === templateId);

        if (!template) {
          throw new Error(`Template not found: ${templateId}`);
        }

        systemPrompt = template.systemPrompt;
        // Replace ${chatContent} placeholder in template with actual file content
        analysisPrompt = template.analysisPrompt.replace(
          /\${chatContent}/g,
          fileContent,
        );

        // Debug logging to verify chat content is included
        console.log(`Processing background analysis:`);
        console.log(`- Template: ${templateId}`);
        console.log(`- Chat content length: ${fileContent.length} characters`);
        console.log(
          `- Prompt includes chat: ${analysisPrompt.includes(fileContent) ? "YES" : "NO"}`,
        );
        console.log(
          `- First 100 chars of chat: ${fileContent.substring(0, 100)}...`,
        );

        // Validate that chat content was properly included
        if (!analysisPrompt.includes(fileContent)) {
          throw new Error(
            "Chat content was not properly included in the analysis prompt. Template may be missing ${chatContent} placeholder.",
          );
        }

        if (analysisPrompt.includes("${chatContent}")) {
          throw new Error(
            "Template placeholder ${chatContent} was not replaced with actual chat content.",
          );
        }
      }

      // Get model info
      const modelInfo = await getModelInfo(modelId);
      if (!modelInfo) {
        throw new Error(`Model not found: ${provider}/${modelId}`);
      }

      // Call AI provider
      let analysisResult;

      if (provider === "openai") {
        const openai = new OpenAI({ apiKey });
        const response = await openai.chat.completions.create({
          model: modelId,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: analysisPrompt },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error("No response from OpenAI");
        }

        console.log("Google AI response length:", content.length);
        console.log("Response starts with:", content.substring(0, 50));
        console.log(
          "Response ends with:",
          content.substring(content.length - 50),
        );

        // Clean and validate JSON response
        analysisResult = this.parseAndValidateJSON(content, "OpenAI");
      } else if (provider === "google") {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelId });

        const prompt = `${systemPrompt}\n\n${analysisPrompt}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const content = response.text();

        if (!content) {
          throw new Error("No response from Google AI");
        }

        console.log("Google AI response length:", content.length);
        console.log("Response starts with:", content.substring(0, 50));
        console.log(
          "Response ends with:",
          content.substring(content.length - 50),
        );

        // Clean and validate JSON response
        analysisResult = this.parseAndValidateJSON(content, "Google AI");
      } else if (provider === "anthropic") {
        const anthropic = new Anthropic({ apiKey });
        const response = await anthropic.messages.create({
          model: modelId,
          max_tokens: 4000,
          system: systemPrompt,
          messages: [{ role: "user", content: analysisPrompt }],
        });

        const content = response.content[0];
        if (content.type !== "text") {
          throw new Error("Unexpected response type from Anthropic");
        }

        // Clean and validate JSON response
        analysisResult = this.parseAndValidateJSON(content.text, "Anthropic");
      } else {
        throw new Error(`Unsupported provider: ${provider}`);
      }

      // Save analysis to database
      const analysis = await prisma.analysis.create({
        data: {
          userId,
          templateId,
          modelId,
          provider,
          fileName: file.name,
          analysisResult: analysisResult as any,
          durationMs: 0, // Will be calculated by job processor
        },
      });

      return {
        success: true,
        data: analysisResult,
        analysisId: analysis.id,
      };
    } catch (error) {
      console.error("Background analysis error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Analysis failed",
      };
    }
  }

  /**
   * Parse and validate JSON response from AI providers (Original Implementation)
   */
  private parseAndValidateJSON(content: string, provider: string) {
    try {
      // Step 1: Clean markdown code blocks
      let cleanContent = content
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .replace(/^```/, "")
        .replace(/```$/, "")
        .trim();

      // Step 2: Find JSON object boundaries
      const jsonStart = cleanContent.indexOf("{");
      const jsonEnd = cleanContent.lastIndexOf("}");

      if (jsonStart === -1 || jsonEnd === -1 || jsonStart >= jsonEnd) {
        throw new Error("No valid JSON object found in response");
      }

      cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);

      // Step 3: Additional cleaning for common AI response issues
      cleanContent = cleanContent
        .replace(/\n\s*\/\/.*$/gm, "") // Remove comment lines
        .replace(/,(\s*[}\]])/g, "$1") // Remove trailing commas
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove control characters
        .replace(/\r\n/g, "\n") // Normalize line endings
        .replace(/\n+/g, "\n"); // Remove multiple newlines

      // Step 4: Parse JSON
      const parsed = JSON.parse(cleanContent);

      // Step 5: Validate required structure
      if (!parsed || typeof parsed !== "object") {
        throw new Error("Response is not a valid object");
      }

      // Check for required fields
      const requiredFields = ["detectedLanguage", "overallSummary"];
      for (const field of requiredFields) {
        if (!parsed[field]) {
          console.warn(`Missing required field: ${field} from ${provider}`);
        }
      }

      // Ensure insights array exists
      if (!parsed.insights || !Array.isArray(parsed.insights)) {
        parsed.insights = [];
        console.warn(`Missing or invalid insights array from ${provider}`);
      }

      return parsed;
    } catch (error) {
      console.error(`JSON parsing error from ${provider}:`, error);
      console.error("Raw content:", content);

      // Return a fallback structure to prevent total failure
      return {
        detectedLanguage: "English",
        overallSummary: `Analysis completed with ${provider}, but there was an issue parsing the detailed results. The conversation appears to contain meaningful communication patterns.`,
        insights: [
          {
            type: "text",
            title: "Parsing Issue",
            content: `The AI analysis from ${provider} completed but encountered a formatting issue. Please try again or contact support if this persists.`,
            metadata: {
              category: "system",
              priority: 1,
              timestamp: new Date().toISOString(),
              error:
                error instanceof Error
                  ? error.message
                  : "Unknown parsing error",
            },
          },
        ],
        personality: {
          traits: ["communicative"],
          summary: "Basic communication patterns detected",
        },
        communicationPatterns: ["Standard conversational exchange"],
        topics: ["General conversation"],
        emotionalArc: [
          {
            timestamp: "0:00",
            emotion: "neutral",
            intensity: 0.5,
            context: "Conversation analysis",
          },
        ],
      };
    }
  }
}

// Export singleton instance
export const jobProcessor = BackgroundJobProcessor.getInstance();
