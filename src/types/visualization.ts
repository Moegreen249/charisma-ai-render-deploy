/**
 * Domain models for UI and visualization-related types
 */

export interface NodePosition {
  x: number;
  y: number;
}

export interface NodeData {
  id: string;
  label: string;
  type: string;
  content?: unknown;
  metadata?: Record<string, unknown>;
}

export interface EmotionNode extends NodeData {
  type: "emotion";
  emotion: string;
  intensity: number;
  timestamp: string;
  context: string;
}

export interface TopicNode extends NodeData {
  type: "topic";
  name: string;
  keywords: string[];
  relevance: number;
}

export interface CentralNode extends NodeData {
  type: "central";
  summary: string;
  connectionCount: number;
}

export interface PersonalityDetailNode extends NodeData {
  type: "personalityDetail";
  traits: string[];
  summary: string;
}

export interface EmotionDetailNode extends NodeData {
  type: "emotionDetail";
  emotions: Array<{
    emotion: string;
    intensity: number;
    timestamp: string;
    context: string;
  }>;
}

export interface TopicDetailNode extends NodeData {
  type: "topicDetail";
  topics: Array<{
    name: string;
    keywords: string[];
    relevance: number;
  }>;
}

export interface PatternDetailNode extends NodeData {
  type: "patternDetail";
  patterns: Array<{
    pattern: string;
    examples: string[];
    impact: string;
  }>;
}

export type ConversationNode = 
  | EmotionNode 
  | TopicNode 
  | CentralNode 
  | PersonalityDetailNode 
  | EmotionDetailNode 
  | TopicDetailNode 
  | PatternDetailNode;

export interface VisualizationTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    border: string;
  };
  typography: {
    fontSize: string;
    fontFamily: string;
    fontWeight: string;
  };
}

export interface VisualizationMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  theme: VisualizationTheme;
}

export interface LayoutConfig {
  algorithm: "force" | "hierarchical" | "circular" | "grid";
  spacing: {
    node: number;
    edge: number;
  };
  animation: {
    duration: number;
    easing: string;
  };
}
