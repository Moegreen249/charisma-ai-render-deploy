/**
 * Domain models for analysis-related types
 */

export interface PersonalityProfile {
  traits: string[];
  summary: string;
  [key: string]: unknown;
}

export interface EmotionalArcPoint {
  timestamp: string;
  emotion: string;
  intensity: number;
  context: string;
  [key: string]: unknown;
}

export interface Topic {
  name: string;
  keywords: string[];
  relevance: number;
  [key: string]: unknown;
}

export interface CommunicationPattern {
  pattern: string;
  examples: string[];
  impact: string;
  [key: string]: unknown;
}

// Enhanced insight types for dynamic visualization
export type InsightType =
  | "text"
  | "list"
  | "score"
  | "timeline"
  | "metric"
  | "category"
  | "chart"
  | "table";

export interface InsightMetadata {
  category?: string;
  priority?: number;
  confidence?: number;
  timestamp?: string;
  tags?: string[];
  color?: string; // General color hint for this insight
  icon?: string;
  // NEW: Visualization-specific metadata
  chartTypeHint?: "line" | "bar" | "pie" | "radar" | "area"; // Hint for the chart type
  dataKey?: string; // Key in insight.content for chart data (e.g., 'topics' or 'emotionalArc')
  xDataKey?: string; // Key for X-axis (e.g., 'name' for topic, 'timestamp' for emotional arc)
  yDataKey?: string | string[]; // Key(s) for Y-axis (e.g., 'relevance', 'intensity')
  colorSchemeHint?:
    | "positive-negative"
    | "intensity"
    | "categorical"
    | "sequential"; // How to color the data
  mainColor?: string; // A specific color (e.g., '#FF0000' if AI suggests a dominant negative emotion)
  highlightCondition?: {
    key: string;
    value: any;
    color: string;
    message?: string;
  }; // e.g., { key: 'sentiment', value: 'negative', color: 'red' }
  unit?: string; // Unit for a metric or axis (e.g., '%', 'score')
  descriptionShort?: string; // A short description for the insight
}

export interface Insight {
  type: InsightType;
  title: string;
  content?: unknown; // This can now be complex data objects for charts or simple text/list
  metadata: InsightMetadata;
}

export interface AnalysisResult {
  detectedLanguage: string;
  overallSummary: string;
  personality?: PersonalityProfile;
  communicationPatterns?: CommunicationPattern[];
  insights: Insight[]; // All visualizations (charts) are now part of insights
  metrics?: Record<string, unknown>;
  templateData?: Record<string, unknown>;
}

export interface AnalysisTemplate {
  id: string;
  name: string;
  description: string;
  category:
    | "general"
    | "business"
    | "personal"
    | "clinical"
    | "coaching"
    | "custom";
  systemPrompt: string;
  analysisPrompt: string; // Changed from function to string to match database storage
  icon: string;
  isBuiltIn: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AnalysisResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
}
