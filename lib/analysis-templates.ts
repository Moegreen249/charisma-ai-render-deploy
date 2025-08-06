import type { AnalysisTemplate } from "@/types";
import { prisma } from "@/lib/prisma";
import {
  ENHANCED_COMMUNICATION_TEMPLATE,
  ENHANCED_RELATIONSHIP_TEMPLATE,
  ENHANCED_BUSINESS_TEMPLATE,
  ENHANCED_COACHING_TEMPLATE,
  CLINICAL_THERAPEUTIC_TEMPLATE,
} from "./enhanced-templates";
import { FORENSIC_ANALYSIS_TEMPLATE } from "./forensic-analysis-template";
import { getStandardizedPromptInstructions } from "./template-standards";

export type { AnalysisTemplate };

export const BUILT_IN_TEMPLATES: AnalysisTemplate[] = [
  {
    id: "communication-analysis",
    name: "Communication Analysis",
    description: "General communication patterns, personality traits, and emotional dynamics",
    category: "general",
    icon: "💬",
    isBuiltIn: true,
    systemPrompt: "You are an expert communication analyst specializing in interpersonal communication patterns.",
    analysisPrompt: `You are an expert general analyst. Your task is to analyze the provided chat conversation and extract detailed insights.

IMPORTANT INSTRUCTIONS:
${getStandardizedPromptInstructions()}

SPECIALIZED FOCUS:
- Focus on communication effectiveness and patterns

Analyze the following aspects:
1. **Personality Traits**: Identify key personality characteristics exhibited by the participants
2. **Emotional Arc**: Track how emotions evolve throughout the conversation
3. **Topics**: Extract main discussion topics and their relevance
4. **Communication Patterns**: Identify recurring patterns in how participants communicate
5. **Overall Summary**: Provide a comprehensive summary of the conversation dynamics

You MUST respond with a valid JSON object that exactly matches this structure:
{
  "detectedLanguage": "Name of the detected language (e.g., English, Spanish, French)",
  "overallSummary": "A comprehensive summary of the conversation dynamics",
  "personality": {
    "traits": ["trait1", "trait2", ...],
    "summary": "A concise summary of the overall personality profile"
  },
  "communicationPatterns": [
    {
      "pattern": "Pattern name",
      "examples": ["example quote 1", "example quote 2"],
      "impact": "How this pattern affects the conversation"
    }
  ],
  "insights": [
    {
      "type": "score",
      "title": "Communication Effectiveness",
      "content": 85,
      "metadata": {
        "category": "effectiveness",
        "priority": 5,
        "confidence": 0.8,
        "unit": "Score",
        "color": "#3B82F6",
        "icon": "trending-up"
      }
    },
    {
      "type": "chart",
      "title": "Emotional Intensity Over Time",
      "content": [
        {"timestamp": "0:00", "intensity": 0.5, "emotion": "Neutral", "context": "Conversation start"},
        {"timestamp": "0:15", "intensity": 0.8, "emotion": "Joy", "context": "Positive discussion"},
        {"timestamp": "0:30", "intensity": 0.3, "emotion": "Calm", "context": "Reflection period"}
      ],
      "metadata": {
        "chartTypeHint": "line",
        "dataKey": "emotionalArcPoints",
        "xDataKey": "timestamp",
        "yDataKey": "intensity",
        "colorSchemeHint": "intensity",
        "mainColor": "#F59E0B",
        "unit": "Intensity Score",
        "descriptionShort": "Tracks emotional valence throughout the conversation",
        "category": "emotion",
        "priority": 4,
        "confidence": 0.9
      }
    },
    {
      "type": "chart",
      "title": "Topic Relevance Breakdown",
      "content": [
        {"name": "Main Discussion", "relevance": 0.8, "keywords": ["main", "topic"]},
        {"name": "Personal Updates", "relevance": 0.6, "keywords": ["personal", "life"]},
        {"name": "Technical Details", "relevance": 0.4, "keywords": ["technical", "details"]}
      ],
      "metadata": {
        "chartTypeHint": "bar",
        "dataKey": "topicsData",
        "xDataKey": "name",
        "yDataKey": "relevance",
        "colorSchemeHint": "categorical",
        "mainColor": "#3B82F6",
        "unit": "Relevance Score",
        "descriptionShort": "Identifies key discussion points and their importance",
        "category": "communication",
        "priority": 3,
        "confidence": 0.85
      }
    },
    {
      "type": "text",
      "title": "Key Communication Strength",
      "content": "You demonstrated active listening throughout the conversation, frequently acknowledging the other person's points before responding.",
      "metadata": {
        "category": "strength",
        "priority": 4,
        "confidence": 0.9,
        "color": "#16A34A",
        "icon": "check-circle"
      }
    }
  ],
  "metrics": {
    "communicationEffectiveness": 0.85,
    "emotionalStability": 0.72,
    "relationshipHealth": 0.78
  }
}

Chat Conversation:
---
\${chatContent}
---

Respond ONLY with the JSON object. Do not include any other text, markdown formatting, or explanation.`,
  },
  {
    id: "relationship-analysis",
    name: "Relationship Analysis",
    description: "Focus on relationship dynamics, intimacy levels, and emotional connections",
    category: "personal",
    icon: "💕",
    isBuiltIn: true,
    systemPrompt: "You are an expert relationship counselor and interpersonal dynamics analyst.",
    analysisPrompt: `You are an expert personal analyst. Your task is to analyze the provided chat conversation and extract detailed insights.

IMPORTANT INSTRUCTIONS:
${getStandardizedPromptInstructions()}

SPECIALIZED FOCUS:
- Focus specifically on relationship dynamics, emotional bonds, and interpersonal connections

Analyze the following aspects:
1. **Personality Traits**: Identify key personality characteristics exhibited by the participants
2. **Emotional Arc**: Track how emotions evolve throughout the conversation
3. **Topics**: Extract main discussion topics and their relevance
4. **Communication Patterns**: Identify recurring patterns in how participants communicate
5. **Overall Summary**: Provide a comprehensive summary of the conversation dynamics

You MUST respond with a valid JSON object that exactly matches this structure:
{
  "detectedLanguage": "Name of the detected language (e.g., English, Spanish, French)",
  "overallSummary": "A comprehensive summary of the conversation dynamics",
  "personality": {
    "traits": ["trait1", "trait2", ...],
    "summary": "A concise summary of the overall personality profile"
  },
  "communicationPatterns": [
    {
      "pattern": "Pattern name",
      "examples": ["example quote 1", "example quote 2"],
      "impact": "How this pattern affects the conversation"
    }
  ],
  "insights": [
    {
      "type": "score",
      "title": "Communication Effectiveness",
      "content": 85,
      "metadata": {
        "category": "effectiveness",
        "priority": 5,
        "confidence": 0.8,
        "unit": "Score",
        "color": "#3B82F6",
        "icon": "trending-up"
      }
    },
    {
      "type": "chart",
      "title": "Emotional Intensity Over Time",
      "content": [
        {"timestamp": "0:00", "intensity": 0.5, "emotion": "Neutral", "context": "Conversation start"},
        {"timestamp": "0:15", "intensity": 0.8, "emotion": "Joy", "context": "Positive discussion"},
        {"timestamp": "0:30", "intensity": 0.3, "emotion": "Calm", "context": "Reflection period"}
      ],
      "metadata": {
        "chartTypeHint": "line",
        "dataKey": "emotionalArcPoints",
        "xDataKey": "timestamp",
        "yDataKey": "intensity",
        "colorSchemeHint": "intensity",
        "mainColor": "#F59E0B",
        "unit": "Intensity Score",
        "descriptionShort": "Tracks emotional valence throughout the conversation",
        "category": "emotion",
        "priority": 4,
        "confidence": 0.9
      }
    },
    {
      "type": "chart",
      "title": "Topic Relevance Breakdown",
      "content": [
        {"name": "Main Discussion", "relevance": 0.8, "keywords": ["main", "topic"]},
        {"name": "Personal Updates", "relevance": 0.6, "keywords": ["personal", "life"]},
        {"name": "Technical Details", "relevance": 0.4, "keywords": ["technical", "details"]}
      ],
      "metadata": {
        "chartTypeHint": "bar",
        "dataKey": "topicsData",
        "xDataKey": "name",
        "yDataKey": "relevance",
        "colorSchemeHint": "categorical",
        "mainColor": "#3B82F6",
        "unit": "Relevance Score",
        "descriptionShort": "Identifies key discussion points and their importance",
        "category": "communication",
        "priority": 3,
        "confidence": 0.85
      }
    },
    {
      "type": "text",
      "title": "Key Communication Strength",
      "content": "You demonstrated active listening throughout the conversation, frequently acknowledging the other person's points before responding.",
      "metadata": {
        "category": "strength",
        "priority": 4,
        "confidence": 0.9,
        "color": "#16A34A",
        "icon": "check-circle"
      }
    }
  ],
  "metrics": {
    "communicationEffectiveness": 0.85,
    "emotionalStability": 0.72,
    "relationshipHealth": 0.78
  }
}

Chat Conversation:
---
\${chatContent}
---

Respond ONLY with the JSON object. Do not include any other text, markdown formatting, or explanation.`,
  },
  {
    id: "business-meeting",
    name: "Business Meeting Analysis",
    description: "Professional communication analysis for meetings, negotiations, and team interactions",
    category: "business",
    icon: "💼",
    isBuiltIn: true,
    systemPrompt: "You are an expert business communication analyst specializing in professional interactions.",
    analysisPrompt: `You are an expert business communication analyst. Your task is to analyze the provided chat conversation and extract detailed insights.

IMPORTANT INSTRUCTIONS:
${getStandardizedPromptInstructions()}

SPECIALIZED FOCUS:
- Focus on professional communication effectiveness, leadership dynamics, and business outcomes

Analyze the following aspects:
1. **Personality Traits**: Identify key personality characteristics exhibited by the participants
2. **Emotional Arc**: Track how emotions evolve throughout the conversation
3. **Topics**: Extract main discussion topics and their relevance
4. **Communication Patterns**: Identify recurring patterns in how participants communicate
5. **Overall Summary**: Provide a comprehensive summary of the conversation dynamics

You MUST respond with a valid JSON object that exactly matches this structure:
{
  "detectedLanguage": "Name of the detected language (e.g., English, Spanish, French)",
  "overallSummary": "A comprehensive summary of the conversation dynamics",
  "personality": {
    "traits": ["trait1", "trait2", ...],
    "summary": "A concise summary of the overall personality profile"
  },
  "communicationPatterns": [
    {
      "pattern": "Pattern name",
      "examples": ["example quote 1", "example quote 2"],
      "impact": "How this pattern affects the conversation"
    }
  ],
  "insights": [
    {
      "type": "score",
      "title": "Communication Effectiveness",
      "content": 85,
      "metadata": {
        "category": "effectiveness",
        "priority": 5,
        "confidence": 0.8,
        "unit": "Score",
        "color": "#3B82F6",
        "icon": "trending-up"
      }
    },
    {
      "type": "chart",
      "title": "Emotional Intensity Over Time",
      "content": [
        {"timestamp": "0:00", "intensity": 0.5, "emotion": "Neutral", "context": "Conversation start"},
        {"timestamp": "0:15", "intensity": 0.8, "emotion": "Joy", "context": "Positive discussion"},
        {"timestamp": "0:30", "intensity": 0.3, "emotion": "Calm", "context": "Reflection period"}
      ],
      "metadata": {
        "chartTypeHint": "line",
        "dataKey": "emotionalArcPoints",
        "xDataKey": "timestamp",
        "yDataKey": "intensity",
        "colorSchemeHint": "intensity",
        "mainColor": "#F59E0B",
        "unit": "Intensity Score",
        "descriptionShort": "Tracks emotional valence throughout the conversation",
        "category": "emotion",
        "priority": 4,
        "confidence": 0.9
      }
    },
    {
      "type": "chart",
      "title": "Topic Relevance Breakdown",
      "content": [
        {"name": "Main Discussion", "relevance": 0.8, "keywords": ["main", "topic"]},
        {"name": "Personal Updates", "relevance": 0.6, "keywords": ["personal", "life"]},
        {"name": "Technical Details", "relevance": 0.4, "keywords": ["technical", "details"]}
      ],
      "metadata": {
        "chartTypeHint": "bar",
        "dataKey": "topicsData",
        "xDataKey": "name",
        "yDataKey": "relevance",
        "colorSchemeHint": "categorical",
        "mainColor": "#10B981",
        "unit": "Relevance Score",
        "descriptionShort": "Identifies key discussion points and their importance",
        "category": "communication",
        "priority": 3,
        "confidence": 0.85
      }
    },
    {
      "type": "text",
      "title": "Key Communication Strength",
      "content": "You demonstrated active listening throughout the conversation, frequently acknowledging the other person's points before responding.",
      "metadata": {
        "category": "strength",
        "priority": 4,
        "confidence": 0.9,
        "color": "#16A34A",
        "icon": "check-circle"
      }
    }
  ],
  "metrics": {
    "communicationEffectiveness": 0.85,
    "emotionalStability": 0.72,
    "relationshipHealth": 0.78
  }
}

Chat Conversation:
---
\${chatContent}
---

Respond ONLY with the JSON object. Do not include any other text, markdown formatting, or explanation.`,
  },
  {
    id: "coaching-session",
    name: "Coaching Session Analysis",
    description: "Analyze coaching conversations for goal setting, progress tracking, and development insights",
    category: "coaching",
    icon: "🎯",
    isBuiltIn: true,
    systemPrompt: "You are an expert coaching analyst specializing in personal and professional development conversations.",
    analysisPrompt: `You are an expert coaching analyst. Your task is to analyze the provided chat conversation and extract detailed insights.

IMPORTANT INSTRUCTIONS:
${getStandardizedPromptInstructions()}

SPECIALIZED FOCUS:
- Focus on coaching effectiveness, goal progress, and development insights

Analyze the following aspects:
1. **Personality Traits**: Identify key personality characteristics exhibited by the participants
2. **Emotional Arc**: Track how emotions evolve throughout the conversation
3. **Topics**: Extract main discussion topics and their relevance
4. **Communication Patterns**: Identify recurring patterns in how participants communicate
5. **Overall Summary**: Provide a comprehensive summary of the conversation dynamics

You MUST respond with a valid JSON object that exactly matches this structure:
{
  "detectedLanguage": "Name of the detected language (e.g., English, Spanish, French)",
  "overallSummary": "A comprehensive summary of the conversation dynamics",
  "personality": {
    "traits": ["trait1", "trait2", ...],
    "summary": "A concise summary of the overall personality profile"
  },
  "communicationPatterns": [
    {
      "pattern": "Pattern name",
      "examples": ["example quote 1", "example quote 2"],
      "impact": "How this pattern affects the conversation"
    }
  ],
  "insights": [
    {
      "type": "score",
      "title": "Communication Effectiveness",
      "content": 85,
      "metadata": {
        "category": "effectiveness",
        "priority": 5,
        "confidence": 0.8,
        "unit": "Score",
        "color": "#3B82F6",
        "icon": "trending-up"
      }
    },
    {
      "type": "chart",
      "title": "Emotional Intensity Over Time",
      "content": [
        {"timestamp": "0:00", "intensity": 0.5, "emotion": "Neutral", "context": "Conversation start"},
        {"timestamp": "0:15", "intensity": 0.8, "emotion": "Joy", "context": "Positive discussion"},
        {"timestamp": "0:30", "intensity": 0.3, "emotion": "Calm", "context": "Reflection period"}
      ],
      "metadata": {
        "chartTypeHint": "line",
        "dataKey": "emotionalArcPoints",
        "xDataKey": "timestamp",
        "yDataKey": "intensity",
        "colorSchemeHint": "intensity",
        "mainColor": "#F59E0B",
        "unit": "Intensity Score",
        "descriptionShort": "Tracks emotional valence throughout the conversation",
        "category": "emotion",
        "priority": 4,
        "confidence": 0.9
      }
    },
    {
      "type": "chart",
      "title": "Topic Relevance Breakdown",
      "content": [
        {"name": "Main Discussion", "relevance": 0.8, "keywords": ["main", "topic"]},
        {"name": "Personal Updates", "relevance": 0.6, "keywords": ["personal", "life"]},
        {"name": "Technical Details", "relevance": 0.4, "keywords": ["technical", "details"]}
      ],
      "metadata": {
        "chartTypeHint": "bar",
        "dataKey": "topicsData",
        "xDataKey": "name",
        "yDataKey": "relevance",
        "colorSchemeHint": "categorical",
        "mainColor": "#F59E0B",
        "unit": "Relevance Score",
        "descriptionShort": "Identifies key discussion points and their importance",
        "category": "communication",
        "priority": 3,
        "confidence": 0.85
      }
    },
    {
      "type": "text",
      "title": "Key Communication Strength",
      "content": "You demonstrated active listening throughout the conversation, frequently acknowledging the other person's points before responding.",
      "metadata": {
        "category": "strength",
        "priority": 4,
        "confidence": 0.9,
        "color": "#16A34A",
        "icon": "check-circle"
      }
    }
  ],
  "metrics": {
    "communicationEffectiveness": 0.85,
    "emotionalStability": 0.72,
    "relationshipHealth": 0.78
  }
}

Chat Conversation:
---
\${chatContent}
---

Respond ONLY with the JSON object. Do not include any other text, markdown formatting, or explanation.`,
  },
  // Enhanced Analysis Templates
  {
    id: "advanced-communication-analysis",
    name: ENHANCED_COMMUNICATION_TEMPLATE.name,
    description: ENHANCED_COMMUNICATION_TEMPLATE.description,
    category:
      ENHANCED_COMMUNICATION_TEMPLATE.category as AnalysisTemplate["category"],
    icon: ENHANCED_COMMUNICATION_TEMPLATE.icon,
    isBuiltIn: true,
    systemPrompt: ENHANCED_COMMUNICATION_TEMPLATE.systemPrompt,
    analysisPrompt: ENHANCED_COMMUNICATION_TEMPLATE.analysisPrompt,
  },
  {
    id: "deep-relationship-dynamics",
    name: ENHANCED_RELATIONSHIP_TEMPLATE.name,
    description: ENHANCED_RELATIONSHIP_TEMPLATE.description,
    category:
      ENHANCED_RELATIONSHIP_TEMPLATE.category as AnalysisTemplate["category"],
    icon: ENHANCED_RELATIONSHIP_TEMPLATE.icon,
    isBuiltIn: true,
    systemPrompt: ENHANCED_RELATIONSHIP_TEMPLATE.systemPrompt,
    analysisPrompt: ENHANCED_RELATIONSHIP_TEMPLATE.analysisPrompt,
  },
  {
    id: "executive-leadership-analysis",
    name: ENHANCED_BUSINESS_TEMPLATE.name,
    description: ENHANCED_BUSINESS_TEMPLATE.description,
    category:
      ENHANCED_BUSINESS_TEMPLATE.category as AnalysisTemplate["category"],
    icon: ENHANCED_BUSINESS_TEMPLATE.icon,
    isBuiltIn: true,
    systemPrompt: ENHANCED_BUSINESS_TEMPLATE.systemPrompt,
    analysisPrompt: ENHANCED_BUSINESS_TEMPLATE.analysisPrompt,
  },
  {
    id: "advanced-coaching-analysis",
    name: ENHANCED_COACHING_TEMPLATE.name,
    description: ENHANCED_COACHING_TEMPLATE.description,
    category:
      ENHANCED_COACHING_TEMPLATE.category as AnalysisTemplate["category"],
    icon: ENHANCED_COACHING_TEMPLATE.icon,
    isBuiltIn: true,
    systemPrompt: ENHANCED_COACHING_TEMPLATE.systemPrompt,
    analysisPrompt: ENHANCED_COACHING_TEMPLATE.analysisPrompt,
  },
  {
    id: "clinical-therapeutic-assessment",
    name: CLINICAL_THERAPEUTIC_TEMPLATE.name,
    description: CLINICAL_THERAPEUTIC_TEMPLATE.description,
    category:
      CLINICAL_THERAPEUTIC_TEMPLATE.category as AnalysisTemplate["category"],
    icon: CLINICAL_THERAPEUTIC_TEMPLATE.icon,
    isBuiltIn: true,
    systemPrompt: CLINICAL_THERAPEUTIC_TEMPLATE.systemPrompt,
    analysisPrompt: CLINICAL_THERAPEUTIC_TEMPLATE.analysisPrompt,
  },
  {
    id: "deep-forensic-analysis",
    name: FORENSIC_ANALYSIS_TEMPLATE.name,
    description: FORENSIC_ANALYSIS_TEMPLATE.description,
    category:
      FORENSIC_ANALYSIS_TEMPLATE.category as AnalysisTemplate["category"],
    icon: FORENSIC_ANALYSIS_TEMPLATE.icon,
    isBuiltIn: true,
    systemPrompt: FORENSIC_ANALYSIS_TEMPLATE.systemPrompt,
    analysisPrompt: FORENSIC_ANALYSIS_TEMPLATE.analysisPrompt,
  },
];

// Helper to map a user template from Prisma to AnalysisTemplate
function mapUserTemplateToAnalysisTemplate(
  userTemplate: any,
): AnalysisTemplate {
  return {
    id: userTemplate.id,
    name: userTemplate.name,
    description: userTemplate.description || "",
    category: userTemplate.category || "custom",
    icon: userTemplate.icon || "✨",
    isBuiltIn: false,
    systemPrompt: userTemplate.systemPrompt || "",
    analysisPrompt: userTemplate.analysisPrompt || "",
  };
}

// Async version: fetches both built-in and user templates
export async function getAllAnalysisTemplates(
  userId?: string,
): Promise<AnalysisTemplate[]> {
  let userTemplates: AnalysisTemplate[] = [];
  if (userId) {
    const dbTemplates = await prisma.userTemplate.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    userTemplates = dbTemplates.map(mapUserTemplateToAnalysisTemplate);
  }
  return [...BUILT_IN_TEMPLATES, ...userTemplates];
}

// Async version: fetches a template by id, checking built-in first, then user templates
export async function getAnalysisTemplate(
  templateId: string,
  userId?: string,
): Promise<AnalysisTemplate | undefined> {
  const builtIn = BUILT_IN_TEMPLATES.find(
    (template) => template.id === templateId,
  );
  if (builtIn) return builtIn;
  if (userId) {
    const userTemplate = await prisma.userTemplate.findUnique({
      where: { id: templateId, userId },
    });
    return userTemplate ? mapUserTemplateToAnalysisTemplate(userTemplate) : undefined;
  }
}

export function getAnalysisTemplatesByCategory(
  category: AnalysisTemplate["category"],
): AnalysisTemplate[] {
  return BUILT_IN_TEMPLATES.filter(
    (template) => template.category === category,
  );
}

export function getBuiltInTemplates(): AnalysisTemplate[] {
  return BUILT_IN_TEMPLATES;
}

export function canEditTemplate(templateId: string): boolean {
  return !BUILT_IN_TEMPLATES.some((template) => template.id === templateId);
}

export function clearUserTemplates(): void {
  console.warn("clearUserTemplates is deprecated. Use server actions instead.");
}

export function repairUserTemplates(): void {
  console.warn(
    "repairUserTemplates is deprecated. Use server actions instead.",
  );
}

export function saveUserTemplate(
  template: Omit<AnalysisTemplate, "id" | "isBuiltIn">,
): void {
  console.warn("saveUserTemplate is deprecated. Use server actions instead.");
}

export function updateUserTemplate(
  templateId: string,
  updates: Partial<AnalysisTemplate>,
): void {
  console.warn("updateUserTemplate is deprecated. Use server actions instead.");
}

export function deleteUserTemplate(templateId: string): void {
  console.warn("deleteUserTemplate is deprecated. Use server actions instead.");
}

export function duplicateTemplate(templateId: string): AnalysisTemplate | null {
  console.warn("duplicateTemplate is deprecated. Use server actions instead.");
  return null;
}
