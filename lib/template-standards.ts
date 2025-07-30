/**
 * Template Standards and Standardization Schema
 *
 * This file defines the standardized structure, metadata, and requirements
 * that should be consistent across all analysis templates to ensure
 * uniform output format and quality.
 */

export interface StandardMetadata {
  category: StandardCategory;
  priority: 1 | 2 | 3 | 4 | 5;
  confidence: number; // 0.0 - 1.0
  color: string;
  icon: string;
  unit?: string;
  descriptionShort?: string;
}

export type StandardCategory =
  | 'communication'
  | 'emotion'
  | 'relationship'
  | 'psychology'
  | 'business'
  | 'coaching'
  | 'clinical'
  | 'forensic'
  | 'effectiveness'
  | 'metric'
  | 'strength'
  | 'improvement'
  | 'pattern'
  | 'narrative'
  | 'predictive'
  | 'attachment'
  | 'subtext'
  | 'data';

export const STANDARD_METADATA_SCHEMA = {
  categories: [
    'communication',
    'emotion',
    'relationship',
    'psychology',
    'business',
    'coaching',
    'clinical',
    'forensic',
    'effectiveness',
    'metric',
    'strength',
    'improvement',
    'pattern',
    'narrative',
    'predictive',
    'attachment',
    'subtext',
    'data'
  ] as StandardCategory[],

  priorityScale: {
    min: 1,
    max: 5,
    description: {
      5: "Critical insight - highest importance",
      4: "High importance - significant finding",
      3: "Medium importance - notable observation",
      2: "Low importance - supplementary info",
      1: "Minimal importance - background detail"
    }
  },

  confidenceScale: {
    min: 0.0,
    max: 1.0,
    description: {
      "0.9-1.0": "Very high confidence - clear evidence",
      "0.8-0.89": "High confidence - strong evidence",
      "0.7-0.79": "Medium confidence - moderate evidence",
      "0.6-0.69": "Low confidence - limited evidence",
      "0.0-0.59": "Very low confidence - minimal evidence"
    }
  }
};

export const COLOR_MAPPING: Record<StandardCategory, string> = {
  communication: "#3B82F6", // Blue
  emotion: "#F59E0B",       // Orange
  relationship: "#FF69B4",  // Pink
  psychology: "#8B5CF6",    // Purple
  business: "#10B981",      // Green
  coaching: "#F59E0B",      // Orange
  clinical: "#DC2626",      // Red
  forensic: "#6B7280",      // Gray
  effectiveness: "#3B82F6", // Blue
  metric: "#059669",        // Emerald
  strength: "#16A34A",      // Green
  improvement: "#EAB308",   // Yellow
  pattern: "#7C3AED",       // Violet
  narrative: "#4F46E5",     // Indigo
  predictive: "#06B6D4",    // Cyan
  attachment: "#EC4899",    // Pink
  subtext: "#F97316",       // Orange
  data: "#64748B"           // Slate
};

export const ICON_MAPPING: Record<StandardCategory, string> = {
  communication: "message-circle",
  emotion: "heart",
  relationship: "users",
  psychology: "brain",
  business: "briefcase",
  coaching: "target",
  clinical: "stethoscope",
  forensic: "search",
  effectiveness: "trending-up",
  metric: "bar-chart",
  strength: "check-circle",
  improvement: "arrow-up-circle",
  pattern: "repeat",
  narrative: "book-open",
  predictive: "crystal-ball",
  attachment: "link",
  subtext: "eye",
  data: "database"
};

export interface RequiredInsight {
  type: 'chart' | 'text' | 'score';
  category: StandardCategory;
  title: string;
  priority: 1 | 2 | 3 | 4 | 5;
  description?: string;
}

export const REQUIRED_INSIGHTS: RequiredInsight[] = [
  {
    type: 'score',
    category: 'communication',
    title: 'Communication Effectiveness',
    priority: 5,
    description: 'Overall effectiveness score (0-100) for communication quality'
  },
  {
    type: 'chart',
    category: 'emotion',
    title: 'Emotional Timeline',
    priority: 4,
    description: 'Timeline showing emotional progression throughout the conversation'
  },
  {
    type: 'text',
    category: 'relationship',
    title: 'Key Communication Pattern',
    priority: 4,
    description: 'Primary communication pattern identified in the conversation'
  }
];

export const CORE_METRICS = {
  required: [
    'communicationEffectiveness',
    'emotionalStability',
    'relationshipHealth'
  ],
  optional: [
    'topicDiversity',
    'psychologicalComplexity',
    'relationshipToxicity',
    'manipulationQuotient',
    'authenticationLevel',
    'predictabilityScore',
    'communicationClarity',
    'powerBalance',
    'goalClarity',
    'progressLevel',
    'coachingEffectiveness',
    'meetingEffectiveness',
    'decisionQuality',
    'teamAlignment',
    'emotionalIntimacy'
  ],
  scale: {
    min: 0.0,
    max: 1.0,
    description: "All metrics should be normalized to 0.0-1.0 scale"
  }
};

export const STANDARDIZED_INSTRUCTIONS = {
  languageDetection: `1. First, detect the language used in the conversation automatically from the context
2. Respond in the SAME LANGUAGE as the conversation (e.g., if the chat is in Spanish, respond in Spanish)`,

  jsonFormatting: `IMPORTANT JSON FORMATTING RULES:
- Use commas (,) to separate ALL array elements, never periods (.)
- Ensure all strings are properly quoted with double quotes
- Do not use trailing commas before closing brackets or braces
- Validate your JSON syntax before responding`,

  evidenceRequirement: `3. Provide objective observations rather than judgments. Be constructive and insightful.
4. Every assertion MUST cite direct evidence from the chat conversation
5. Focus on actionable insights for improvement`,

  insightStructure: `6. Pay special attention to the 'insights' array. Each insight MUST have a 'type', 'title', 'content', and 'metadata' object.
7. For charts, set 'type' to 'chart' and include 'chartTypeHint', 'dataKey', 'xDataKey', 'yDataKey' within 'metadata'.
8. Use standardized categories, colors, and priority levels as defined in the template standards.`
};

export interface TemplateValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingRequiredInsights: string[];
  nonStandardMetadata: string[];
}

export function validateTemplateResponse(response: any): TemplateValidationResult {
  const result: TemplateValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    missingRequiredInsights: [],
    nonStandardMetadata: []
  };

  // Check required structure
  if (!response.detectedLanguage) {
    result.errors.push("Missing 'detectedLanguage' field");
    result.isValid = false;
  }

  if (!response.overallSummary) {
    result.errors.push("Missing 'overallSummary' field");
    result.isValid = false;
  }

  if (!response.insights || !Array.isArray(response.insights)) {
    result.errors.push("Missing or invalid 'insights' array");
    result.isValid = false;
  }

  if (!response.metrics || typeof response.metrics !== 'object') {
    result.errors.push("Missing or invalid 'metrics' object");
    result.isValid = false;
  }

  // Check required insights
  if (response.insights) {
    const insightTitles = response.insights.map((insight: any) => insight.title);
    REQUIRED_INSIGHTS.forEach(required => {
      if (!insightTitles.some((title: string) =>
        title.toLowerCase().includes(required.title.toLowerCase().split(' ')[0]))) {
        result.missingRequiredInsights.push(required.title);
      }
    });
  }

  // Check metadata standards
  if (response.insights) {
    response.insights.forEach((insight: any, index: number) => {
      if (insight.metadata) {
        const category = insight.metadata.category;
        if (category && !STANDARD_METADATA_SCHEMA.categories.includes(category)) {
          result.nonStandardMetadata.push(`Insight ${index + 1}: Invalid category '${category}'`);
        }

        const priority = insight.metadata.priority;
        if (priority && (priority < 1 || priority > 5)) {
          result.nonStandardMetadata.push(`Insight ${index + 1}: Invalid priority '${priority}' (must be 1-5)`);
        }

        const confidence = insight.metadata.confidence;
        if (confidence && (confidence < 0 || confidence > 1)) {
          result.nonStandardMetadata.push(`Insight ${index + 1}: Invalid confidence '${confidence}' (must be 0.0-1.0)`);
        }
      }
    });
  }

  // Check core metrics
  if (response.metrics) {
    CORE_METRICS.required.forEach(metric => {
      if (!(metric in response.metrics)) {
        result.warnings.push(`Missing required metric: ${metric}`);
      }
    });
  }

  if (result.errors.length > 0 || result.missingRequiredInsights.length > 0) {
    result.isValid = false;
  }

  return result;
}

export function generateStandardizedMetadata(
  category: StandardCategory,
  priority: 1 | 2 | 3 | 4 | 5,
  confidence: number,
  unit?: string,
  descriptionShort?: string
): StandardMetadata {
  return {
    category,
    priority,
    confidence: Math.max(0, Math.min(1, confidence)), // Clamp to 0-1
    color: COLOR_MAPPING[category],
    icon: ICON_MAPPING[category],
    unit,
    descriptionShort
  };
}

export function getStandardizedPromptInstructions(): string {
  return `
${STANDARDIZED_INSTRUCTIONS.languageDetection}
${STANDARDIZED_INSTRUCTIONS.evidenceRequirement}
${STANDARDIZED_INSTRUCTIONS.insightStructure}

STANDARDIZED METADATA REQUIREMENTS:
- Use only these categories: ${STANDARD_METADATA_SCHEMA.categories.join(', ')}
- Priority scale: 1-5 (where 5 = highest priority)
- Confidence scale: 0.0-1.0 (where 1.0 = highest confidence)
- Colors and icons will be automatically assigned based on category

REQUIRED CORE INSIGHTS:
${REQUIRED_INSIGHTS.map(insight => `- ${insight.type}: ${insight.title} (${insight.category}, priority ${insight.priority})`).join('\n')}

REQUIRED CORE METRICS:
${CORE_METRICS.required.map(metric => `- ${metric}: 0.0-1.0`).join('\n')}

${STANDARDIZED_INSTRUCTIONS.jsonFormatting}
`;
}

export default {
  STANDARD_METADATA_SCHEMA,
  COLOR_MAPPING,
  ICON_MAPPING,
  REQUIRED_INSIGHTS,
  CORE_METRICS,
  STANDARDIZED_INSTRUCTIONS,
  validateTemplateResponse,
  generateStandardizedMetadata,
  getStandardizedPromptInstructions
};
