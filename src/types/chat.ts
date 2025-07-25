/**
 * Domain models for chat-related types
 */

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface ChatTurn {
  id: string;
  messages: ChatMessage[];
  timestamp: Date;
  analysisId?: string;
}

export interface ChatFile {
  name: string;
  size: number;
  type: string;
  content: string;
  uploadedAt: Date;
}

export interface CoachMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CoachRequest {
  messages: CoachMessage[];
  analysisData: import('./analysis').AnalysisResult;
  provider: string;
  modelId: string;
  apiKey: string;
}

export interface CoachResponse {
  content: string;
  isStreaming: boolean;
  error?: string;
}
