# CharismaAI API Reference

## Overview

This document provides comprehensive documentation for the CharismaAI API endpoints, server actions, and data structures. The application uses Next.js 15 Server Actions and API Routes for backend functionality.

## Server Actions

### analyzeChat

**Location**: `app/actions/analyze.ts`

**Purpose**: Analyzes chat conversations using AI models and returns structured insights.

**Signature**:
```typescript
export async function analyzeChat(formData: FormData): Promise<AnalysisResponse>
```

**Parameters**:
- `formData: FormData` - Form data containing:
  - `chatFile: File` - The chat conversation file to analyze
  - `modelId: string` - AI model identifier
  - `provider: string` - AI provider name
  - `apiKey: string` - API key for the selected provider
  - `templateId: string` - Analysis template identifier
  - `customTemplate?: string` - JSON string for custom templates

**Returns**:
```typescript
interface AnalysisResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
}
```

**Example Usage**:
```typescript
const formData = new FormData();
formData.append("chatFile", file);
formData.append("modelId", "gemini-2.5-flash");
formData.append("provider", "google");
formData.append("apiKey", "your-api-key");
formData.append("templateId", "communication-analysis");

const result = await analyzeChat(formData);
```

**Error Handling**:
- Invalid file format
- Missing API key
- AI provider errors
- Template validation errors
- JSON parsing errors

### coachChat

**Location**: `app/actions/coach.ts`

**Purpose**: Provides AI coaching responses based on analysis data.

**Signature**:
```typescript
export async function coachChat(request: CoachRequest): Promise<CoachResponse>
```

**Parameters**:
```typescript
interface CoachRequest {
  messages: CoachMessage[];
  analysisData: AnalysisResult;
  provider: AIProvider;
  modelId: string;
  apiKey: string;
}
```

**Returns**:
```typescript
interface CoachResponse {
  success: boolean;
  message?: string;
  error?: string;
}
```

## API Routes

### POST /api/coach

**Location**: `app/api/coach/route.ts`

**Purpose**: Streaming API endpoint for real-time AI coaching responses.

**Request Body**:
```typescript
{
  messages: CoachMessage[];
  analysisData: AnalysisResult;
  provider: AIProvider;
  modelId: string;
  apiKey: string;
}
```

**Response**: Server-Sent Events (SSE) stream

**Headers**:
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

**Example Usage**:
```typescript
const response = await fetch("/api/coach", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    messages: conversationHistory,
    analysisData: analysisResult,
    provider: "google",
    modelId: "gemini-2.5-flash",
    apiKey: "your-api-key"
  })
});

const reader = response.body?.getReader();
// Handle streaming response
```

## Data Types

### AnalysisResult

**Location**: `src/types/analysis.ts`

```typescript
interface AnalysisResult {
  detectedLanguage: string;
  overallSummary: string;
  personality?: PersonalityProfile;
  emotionalArc?: EmotionalArcPoint[];
  topics?: Topic[];
  communicationPatterns?: CommunicationPattern[];
  insights: Insight[];
  metrics?: Record<string, unknown>;
  templateData?: Record<string, unknown>;
}
```

**Fields**:
- `detectedLanguage`: Automatically detected language of the conversation
- `overallSummary`: Comprehensive summary of conversation dynamics
- `personality`: Personality traits and characteristics
- `emotionalArc`: Chronological emotional changes
- `topics`: Key discussion topics with relevance scores
- `communicationPatterns`: Identified communication patterns
- `insights`: Flexible insights array
- `metrics`: Key-value metrics
- `templateData`: Template-specific data

### PersonalityProfile

```typescript
interface PersonalityProfile {
  traits: string[];
  summary: string;
  [key: string]: unknown;
}
```

### EmotionalArcPoint

```typescript
interface EmotionalArcPoint {
  timestamp: string;
  emotion: string;
  intensity: number;
  context: string;
  [key: string]: unknown;
}
```

### Topic

```typescript
interface Topic {
  name: string;
  keywords: string[];
  relevance: number;
  [key: string]: unknown;
}
```

### CommunicationPattern

```typescript
interface CommunicationPattern {
  pattern: string;
  examples: string[];
  impact: string;
  [key: string]: unknown;
}
```

### Insight

```typescript
interface Insight {
  type: "text" | "list" | "score" | "timeline" | "metric" | "chart" | "table" | "category";
  title: string;
  content: unknown;
  metadata: InsightMetadata;
}

interface InsightMetadata {
  category?: string;
  priority?: number;
  confidence?: number;
  timestamp?: string;
  tags?: string[];
  color?: string;
  icon?: string;
}
```

### ChatMessage

**Location**: `src/types/chat.ts`

```typescript
interface ChatMessage {
  role: "user" | "assistant" | "error";
  content: string;
}

interface CoachMessage {
  role: "user" | "assistant";
  content: string;
}
```

### AI Provider Types

**Location**: `lib/ai-providers.ts`

```typescript
type AIProvider = "google" | "openai" | "anthropic";

interface AIModel {
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

interface AIProviderConfig {
  id: AIProvider;
  name: string;
  apiKeyName: string;
  apiKeyPlaceholder: string;
  models: AIModel[];
  getApiKeyUrl: string;
}
```

### Analysis Template Types

**Location**: `lib/analysis-templates.ts`

```typescript
interface AnalysisTemplate {
  id: string;
  name: string;
  description: string;
  category: "general" | "business" | "personal" | "clinical" | "custom";
  systemPrompt: string;
  analysisPrompt: (chatContent: string) => string;
  icon: string;
  isBuiltIn: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
```

## Utility Functions

### AI Provider Functions

**Location**: `lib/ai-providers.ts`

```typescript
// Get provider configuration
function getProviderConfig(providerId: AIProvider): AIProviderConfig | undefined

// Get model information
function getModelInfo(modelId: string): AIModel | undefined

// Get available models
function getAvailableModels(): AIModel[]

// Get models by provider
function getAvailableModelsByProvider(providerId: AIProvider): AIModel[]
```

### Analysis Template Functions

**Location**: `lib/analysis-templates.ts`

```typescript
// Get all templates
function getAllAnalysisTemplates(): AnalysisTemplate[]

// Get template by ID
function getAnalysisTemplate(templateId: string): AnalysisTemplate | undefined

// Get templates by category
function getAnalysisTemplatesByCategory(category: AnalysisTemplate["category"]): AnalysisTemplate[]

// Get built-in templates
function getBuiltInTemplates(): AnalysisTemplate[]

// Save user template
function saveUserTemplate(template: Omit<AnalysisTemplate, "id" | "isBuiltIn" | "createdAt" | "updatedAt">): AnalysisTemplate

// Update user template
function updateUserTemplate(id: string, updates: Partial<AnalysisTemplate>): AnalysisTemplate | null

// Delete user template
function deleteUserTemplate(id: string): boolean

// Duplicate template
function duplicateTemplate(templateId: string, newName?: string): AnalysisTemplate | null
```

### Settings Functions

**Location**: `lib/settings.ts`

```typescript
// API Key management
function getApiKey(keyName: string): string | null
function setApiKey(keyName: string, value: string): void
function clearApiKey(keyName: string): void

// Model selection
function getSelectedModel(): { provider: AIProvider; modelId: string }
function setSelectedModel(provider: AIProvider, modelId: string): void

// Template selection
function getSelectedAnalysisTemplate(): string
function setSelectedAnalysisTemplate(templateId: string): void
```

## Error Handling

### Common Error Types

```typescript
// File validation errors
interface FileError {
  type: "FILE_TOO_LARGE" | "INVALID_FORMAT" | "EMPTY_FILE";
  message: string;
}

// AI provider errors
interface AIError {
  type: "API_KEY_MISSING" | "RATE_LIMIT" | "MODEL_UNAVAILABLE" | "PROVIDER_ERROR";
  message: string;
  provider?: AIProvider;
}

// Analysis errors
interface AnalysisError {
  type: "TEMPLATE_NOT_FOUND" | "INVALID_TEMPLATE" | "JSON_PARSE_ERROR";
  message: string;
  templateId?: string;
}
```

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: string;
  errorType?: string;
  details?: Record<string, unknown>;
}
```

## Rate Limiting

### AI Provider Limits

| Provider | Model | RPM | RPD |
|----------|-------|-----|-----|
| Google | Gemini 2.5 Flash | 10 | 250 |
| Google | Gemini 2.0 Flash | 15 | 200 |
| OpenAI | GPT-4o | 10,000 | 10,000 |
| OpenAI | GPT-4o Mini | 30,000 | 10,000 |
| Anthropic | Claude 3.5 Sonnet | 4,000 | 4,000 |
| Anthropic | Claude 3.5 Haiku | 4,000 | 4,000 |

### Implementation

The application implements client-side rate limiting awareness but relies on AI providers for actual enforcement. Users should be aware of their provider's rate limits.

## Security

### API Key Security

- API keys are stored in environment variables
- Keys are transmitted securely via HTTPS
- No keys are logged or exposed in client-side code
- Keys are validated before use

### Input Validation

- All inputs are validated using Zod schemas
- File uploads are restricted by type and size
- JSON responses are parsed safely with error handling
- User inputs are sanitized

### Data Privacy

- Chat files are processed in memory only
- No persistent storage of conversation content
- Analysis results are temporary
- No user data is shared with third parties

## Testing

### API Testing Examples

```typescript
// Test analysis endpoint
describe("analyzeChat", () => {
  it("should analyze a valid chat file", async () => {
    const formData = new FormData();
    formData.append("chatFile", testFile);
    formData.append("modelId", "gemini-2.5-flash");
    formData.append("provider", "google");
    formData.append("apiKey", "test-key");
    formData.append("templateId", "communication-analysis");

    const result = await analyzeChat(formData);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.detectedLanguage).toBeDefined();
  });
});

// Test coaching endpoint
describe("coachChat", () => {
  it("should provide coaching response", async () => {
    const request: CoachRequest = {
      messages: [{ role: "user", content: "How can I improve?" }],
      analysisData: mockAnalysisData,
      provider: "google",
      modelId: "gemini-2.5-flash",
      apiKey: "test-key"
    };

    const result = await coachChat(request);
    
    expect(result.success).toBe(true);
    expect(result.message).toBeDefined();
  });
});
```

## Performance Considerations

### Optimization Strategies

1. **Streaming Responses**: Coaching API uses streaming for real-time responses
2. **Caching**: Template and provider configurations are cached
3. **Error Recovery**: Retry logic for transient AI provider errors
4. **JSON Parsing**: Optimized JSON parsing with error recovery
5. **Memory Management**: Efficient handling of large chat files

### Monitoring

- API response times
- Error rates by provider
- Template usage statistics
- User interaction patterns

## Future API Enhancements

### Planned Features

1. **Batch Analysis**: Process multiple files simultaneously
2. **Export APIs**: Export analysis results in various formats
3. **Webhook Support**: Notify external systems of analysis completion
4. **Rate Limit Management**: Built-in rate limiting and queuing
5. **Authentication**: User authentication and authorization
6. **Analytics**: Usage analytics and insights API 