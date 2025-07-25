/**
 * Central type exports for the application
 */

// Analysis types
export type {
  AnalysisResult,
  AnalysisTemplate,
  AnalysisResponse,
  PersonalityProfile,
  EmotionalArcPoint,
  Topic,
  CommunicationPattern,
  Insight,
  InsightMetadata,
} from './analysis';

// Chat types
export type {
  ChatMessage,
  ChatTurn,
  ChatFile,
  CoachMessage,
  CoachRequest,
  CoachResponse,
} from './chat';

// Metric types
export type {
  Metric,
  ScoreMetric,
  CategoryMetric,
  TimeSeriesMetric,
  TimeSeriesPoint,
  MetricCollection,
  MetricThreshold,
} from './metrics';

// Visualization types
export type {
  NodePosition,
  NodeData,
  EmotionNode,
  TopicNode,
  CentralNode,
  PersonalityDetailNode,
  EmotionDetailNode,
  TopicDetailNode,
  PatternDetailNode,
  ConversationNode,
  VisualizationTheme,
  VisualizationMode,
  LayoutConfig,
} from './visualization';

// Common utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type NonNullable<T> = T extends null | undefined ? never : T;

export type ValueOf<T> = T[keyof T];

export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];
