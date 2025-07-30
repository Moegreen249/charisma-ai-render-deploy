"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { OpenAI } from "openai";
import { Anthropic } from "@anthropic-ai/sdk";
import { getAnalysisTemplate } from "@/lib/analysis-templates";
import { getSettings, getSelectedAnalysisTemplate } from "@/lib/settings";
import type { AIProvider } from "@/lib/ai-providers";
import type { AnalysisResult } from "@/app/actions/analyze";
// Remove import { PredictionServiceClient } from '@google-cloud/aiplatform';

interface Message {
  role: "user" | "assistant" | "error";
  content: string;
}

// Remove vertexAiClient and getVertexAiClient function

export async function coachChat(
  messages: Message[],
  analysisData: AnalysisResult,
  provider: AIProvider,
  modelId: string,
  apiKey: string,
) {
  try {
    // Get the template info for context
    const templateId = getSelectedAnalysisTemplate();
    let templateInfo = { name: "Communication Analysis", icon: "💬" };

    if (templateId) {
      try {
        const template = await getAnalysisTemplate(templateId);
        if (template) {
          templateInfo = { name: template.name, icon: template.icon };
        }
      } catch (error) {
        console.error("Failed to load template:", error);
      }
    }

    // Create the system prompt
    const systemPrompt = `You are an AI communication coach specializing in ${templateInfo.name} ${templateInfo.icon}.

You have analyzed a conversation and identified key insights about communication patterns, personality traits, emotional dynamics, and relationship dynamics.

Your role is to:
1. Help the user understand the analysis results
2. Provide actionable advice for improving communication
3. Answer questions about specific insights
4. Suggest strategies for better interpersonal communication

The analysis shows:
- Detected language: ${analysisData.detectedLanguage}
- Overall summary: ${analysisData.overallSummary}
- Key insights: ${analysisData.insights.length} insights identified

Be conversational, supportive, and provide practical advice. Use the analysis data to give specific, relevant recommendations.`;

    if (provider === "google-vertex-ai") {
      try {
        const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
        const location = process.env.GOOGLE_CLOUD_REGION;
        const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:predict`;
        const parameters = {
          temperature: 0.7,
          maxOutputTokens: 1024,
          topP: 0.95,
          topK: 40,
        };
        const body = {
          instances: [{ prompt }],
          parameters,
        };
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(body),
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Vertex AI API error: ${response.status} ${errorText}`,
          );
        }
        const data = await response.json();
        let aiResponseContent = "";
        if (data && data.predictions && data.predictions.length > 0) {
          const prediction = data.predictions[0];
          if (prediction.content) {
            aiResponseContent = prediction.content;
          } else if (
            prediction.structValue &&
            prediction.structValue.fields &&
            prediction.structValue.fields.candidates
          ) {
            // Gemini Pro format
            const candidates =
              prediction.structValue.fields.candidates.listValue.values;
            if (candidates && candidates.length > 0) {
              aiResponseContent =
                candidates[0].structValue.fields.content.stringValue;
            }
          }
        }
        if (!aiResponseContent) {
          throw new Error(
            "No content found in Vertex AI response or unexpected format.",
          );
        }
        return { role: "assistant", content: aiResponseContent };
      } catch (aiError: any) {
        console.error("Vertex AI coach error:", aiError);
        return {
          role: "error",
          content: `Vertex AI Error: ${aiError.message || JSON.stringify(aiError)}`,
        };
      }
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return { role: "error", content: errorMessage };
  }
}

async function streamGoogleResponse(
  controller: ReadableStreamDefaultController,
  messages: Message[],
  systemPrompt: string,
  modelId: string,
  apiKey: string,
  encoder: TextEncoder,
) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelId });

  // Filter out the initial assistant greeting and get actual conversation
  const conversationMessages = messages.filter((msg, index) => {
    // Skip the first message if it's from assistant (the greeting)
    if (index === 0 && msg.role === "assistant") return false;
    return true;
  });

  if (conversationMessages.length === 0) {
    throw new Error("No user messages found in conversation");
  }

  // For Google AI, we need to ensure conversation starts with user
  // Build history (all messages except the last one)
  const history = conversationMessages.slice(0, -1).map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const lastMessage = conversationMessages[conversationMessages.length - 1];
  const fullPrompt = `${systemPrompt}\n\nUser: ${lastMessage.content}`;

  const chat = model.startChat({ history });
  const result = await chat.sendMessageStream(fullPrompt);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      controller.enqueue(encoder.encode(text));
    }
  }
}

async function streamOpenAIResponse(
  controller: ReadableStreamDefaultController,
  messages: Message[],
  systemPrompt: string,
  modelId: string,
  apiKey: string,
  encoder: TextEncoder,
) {
  const openai = new OpenAI({ apiKey });

  const openaiMessages = [
    { role: "system" as const, content: systemPrompt },
    ...messages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
  ];

  const stream = await openai.chat.completions.create({
    model: modelId,
    messages: openaiMessages,
    stream: true,
    max_tokens: 1000,
    temperature: 0.7,
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) {
      controller.enqueue(encoder.encode(text));
    }
  }
}

async function streamAnthropicResponse(
  controller: ReadableStreamDefaultController,
  messages: Message[],
  systemPrompt: string,
  modelId: string,
  apiKey: string,
  encoder: TextEncoder,
) {
  const anthropic = new Anthropic({ apiKey });

  const anthropicMessages = messages
    .filter((msg) => msg.role !== "error")
    .map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

  const stream = await anthropic.messages.create({
    model: modelId,
    max_tokens: 1000,
    temperature: 0.7,
    system: systemPrompt,
    messages: anthropicMessages,
    stream: true,
  });

  for await (const chunk of stream) {
    if (
      chunk.type === "content_block_delta" &&
      chunk.delta.type === "text_delta"
    ) {
      controller.enqueue(encoder.encode(chunk.delta.text));
    }
  }
}

export async function streamCoachResponse(body: {
  messages: Message[];
  analysisData: AnalysisResult;
  provider: AIProvider;
  modelId: string;
  apiKey: string;
}) {
  const { messages, analysisData, provider, modelId, apiKey } = body;

  // Get the template info for context
  const templateId = getSelectedAnalysisTemplate();
  let templateInfo = { name: "Communication Analysis", icon: "💬" };

  if (templateId) {
    try {
      const template = await getAnalysisTemplate(templateId);
      if (template) {
        templateInfo = { name: template.name, icon: template.icon };
      }
    } catch (error) {
      console.error("Failed to load template:", error);
    }
  }

  // Create the system prompt
  const systemPrompt = `You are an AI communication coach specializing in ${templateInfo.name} ${templateInfo.icon}.

You have analyzed a conversation and identified key insights about communication patterns, personality traits, emotional dynamics, and relationship dynamics.

Your role is to:
1. Help the user understand the analysis results
2. Provide actionable advice for improving communication
3. Answer questions about specific insights
4. Suggest strategies for better interpersonal communication

The analysis shows:
- Detected language: ${analysisData.detectedLanguage}
- Overall summary: ${analysisData.overallSummary}
- Key insights: ${analysisData.insights.length} insights identified

Be conversational, supportive, and provide practical advice. Use the analysis data to give specific, relevant recommendations.`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (provider === "google" || provider === "google-genai") {
          await streamGoogleResponse(
            controller,
            messages,
            systemPrompt,
            modelId,
            apiKey,
            encoder,
          );
        } else if (provider === "openai") {
          await streamOpenAIResponse(
            controller,
            messages,
            systemPrompt,
            modelId,
            apiKey,
            encoder,
          );
        } else if (provider === "anthropic") {
          await streamAnthropicResponse(
            controller,
            messages,
            systemPrompt,
            modelId,
            apiKey,
            encoder,
          );
        } else {
          throw new Error(`Unsupported provider: ${provider}`);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        controller.enqueue(encoder.encode(`Error: ${errorMessage}`));
      } finally {
        controller.close();
      }
    },
  });

  return stream;
}
