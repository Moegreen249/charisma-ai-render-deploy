/**
 * Type definitions for the CharismaAI application
 */

// Analysis types
export interface AnalysisTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  systemPrompt: string;
  analysisPrompt: string;
  isBuiltIn: boolean;
}

export interface Insight {
  type?: "text" | "list" | "score" | "timeline" | "metric" | "chart" | "table" | "category";
  title?: string;
  content?: any;
  metadata?: {
    category?: string;
    priority?: number;
    confidence?: number;
    timestamp?: string;
    tags?: string[];
    color?: string;
    icon?: string;
    unit?: string;
    chartTypeHint?: string;
    xDataKey?: string;
    yDataKey?: string;
    mainColor?: string;
  };
}

export interface AnalysisResult {
  id?: string;
  detectedLanguage?: string;
  overallSummary?: string;
  insights?: Insight[];
  personality?: {
    traits?: string[];
    summary?: string;
  };
  emotionalArc?: Array<{
    timestamp?: string;
    emotion?: string;
    intensity?: number;
    context?: string;
    description?: string;
  }>;
  communicationPatterns?: Array<{
    pattern?: string;
    examples?: string[];
    impact?: string;
  }> | {
    responseTime?: {
      average?: number;
      pattern?: string;
    };
    messageLength?: {
      average?: number;
      distribution?: string;
    };
    initiationPattern?: string;
  };
  metrics?: {
    totalMessages?: number;
    averageLength?: number;
    sentimentScore?: number;
    engagementLevel?: string;
    [key: string]: any;
  };
  templateData?: Record<string, any>;
  metadata?: Record<string, any>;
}

// User types
export interface UserProfile {
  id: string;
  userId: string;
  bio?: string;
  avatar?: string;
  website?: string;
  location?: string;
  dateOfBirth?: Date;
  phone?: string;
  company?: string;
  jobTitle?: string;
  skills: string[];
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    notifications?: boolean;
    newsletter?: boolean;
  };
  isPublic: boolean;
}

// API types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form types
export interface SignInData {
  email: string;
  password: string;
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// AI Provider types
export type AIProvider = 'openai' | 'anthropic' | 'google' | 'google-vertex-ai' | 'google-genai';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  description: string;
  contextWindow?: number;
  available: boolean;
  tier: "free" | "paid" | "both";
  rpm?: number;
  rpd?: number;
}

// Analysis request types
export interface AnalysisRequest {
  templateId: string;
  modelId: string;
  provider: AIProvider;
  fileName: string;
  fileContent: string;
}

// Story types
export interface Story {
  id: string;
  analysisId: string;
  userId: string;
  title: string;
  content: any;
  generatedAt: Date;
  promptVersion: string;
  aiProvider: string;
  modelId: string;
  processingTime?: number;
  status: 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';
  errorMessage?: string;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  metadata?: any;
  read: boolean;
  readAt?: Date;
  persistent: boolean;
  createdAt: Date;
}

// Error types
export interface PlatformError {
  id: string;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  code?: string;
  message: string;
  userId?: string;
  endpoint?: string;
  userAgent?: string;
  sessionId?: string;
  stackTrace?: string;
  requestData?: any;
  responseData?: any;
  aiProvider?: string;
  modelId?: string;
  isResolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolution?: string;
  occurrenceCount: number;
  firstOccurred: Date;
  lastOccurred: Date;
}

// Chart/Visualization types
export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
    fill?: boolean;
  }>;
}

export interface VisualizationProps {
  data: ChartData;
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar';
  title?: string;
  options?: any;
}

// Theme types
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    mono: string;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
}

// Export commonly used utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};