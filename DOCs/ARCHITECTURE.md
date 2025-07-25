# CharismaAI Architecture Documentation

## System Overview

CharismaAI is built as a modern web application using Next.js 15 with the App Router, leveraging server-side rendering and client-side interactivity. The application follows a component-based architecture with clear separation of concerns between UI components, business logic, and data management.

## High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Side   │    │   Server Side   │    │   AI Providers  │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │   React     │ │    │ │ Next.js     │ │    │ │ Google      │ │
│ │ Components  │ │◄──►│ │ App Router  │ │◄──►│ │ Gemini      │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │   State     │ │    │ │ Server      │ │    │ │ OpenAI      │ │
│ │ Management  │ │    │ │ Actions     │ │    │ │ GPT         │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │   UI/UX     │ │    │ │ API Routes  │ │    │ │ Anthropic   │ │
│ │ Components  │ │    │ └─────────────┘ │    │ │ Claude      │ │
│ └─────────────┘ │    │                 │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Technology Stack

### Frontend Technologies
- **Next.js 15**: React framework with App Router for server-side rendering
- **React 19**: Latest React with concurrent features and improved performance
- **TypeScript**: Type-safe JavaScript for better development experience
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Radix UI**: Accessible, unstyled UI components
- **Framer Motion**: Animation library for smooth transitions

### Backend Technologies
- **Next.js API Routes**: Server-side API endpoints
- **Server Actions**: Next.js 15 feature for server-side mutations
- **Zod**: Schema validation and type inference

### AI Integration
- **Google Generative AI**: Gemini models for analysis
- **OpenAI**: GPT models for analysis and coaching
- **Anthropic**: Claude models for analysis

### Development Tools
- **ESLint**: Code linting and formatting
- **Turbopack**: Fast bundler for development
- **PostCSS**: CSS processing

## Component Architecture

### Core Components

#### 1. Application State Management
```typescript
// Main application state using useReducer
interface State {
  currentView: AppState;
  selectedFile: File | null;
  analysisData: AnalysisResult | null;
  error: string | null;
}

type AppState = "idle" | "loading" | "success" | "error" | "coaching";
```

#### 2. Component Hierarchy
```
App (page.tsx)
├── LanguageProvider
├── AnimatePresence
│   ├── LoadingIndicator (loading state)
│   ├── FlexibleAnalysisView (success state)
│   └── UploadCard (idle/error state)
└── CoachChat (coaching state)
```

### Key Components

#### FlexibleAnalysisView
- **Purpose**: Main analysis results display
- **Features**: 
  - Template-specific rendering
  - Interactive visualizations
  - Insight categorization
  - Coaching integration
- **Props**: `analysisData`, `templateId`, `onOpenCoach`

#### CoachChat
- **Purpose**: Interactive AI coaching interface
- **Features**:
  - Real-time streaming responses
  - Context-aware suggestions
  - Template-specific guidance
- **Props**: `analysisData`, `onClose`

#### UploadCard
- **Purpose**: File upload and processing
- **Features**:
  - Drag-and-drop interface
  - File validation
  - Progress indication
- **Props**: `onFileSelect`, `onAnalyze`, `loading`, `error`

## Data Flow

### 1. File Upload Flow
```
User Upload → UploadCard → FormData → Server Action → AI Analysis → Results
```

### 2. Analysis Flow
```
Chat File → AI Provider → Analysis Template → Structured Results → UI Rendering
```

### 3. Coaching Flow
```
User Question → CoachChat → AI Provider → Streaming Response → Real-time Display
```

## State Management

### Application State
The application uses React's `useReducer` for complex state management:

```typescript
type Action =
  | { type: "SET_FILE"; payload: File }
  | { type: "START_ANALYSIS" }
  | { type: "ANALYSIS_SUCCESS"; payload: AnalysisResult }
  | { type: "ANALYSIS_ERROR"; payload: string }
  | { type: "OPEN_COACH" }
  | { type: "CLOSE_COACH" }
  | { type: "RESET" };
```

### Local State
Individual components use `useState` for local state management:
- Form inputs
- UI interactions
- Loading states
- Error handling

### Persistent State
Settings and user preferences are stored in localStorage:
- API keys
- Selected models
- Analysis templates
- User preferences

## AI Integration Architecture

### Provider Abstraction
The application abstracts AI providers through a unified interface:

```typescript
interface AIProviderConfig {
  id: AIProvider;
  name: string;
  apiKeyName: string;
  models: AIModel[];
  getApiKeyUrl: string;
}
```

### Model Selection
Users can select from available models across providers:
- Google Gemini 2.5 Flash/Pro
- OpenAI GPT-4o/GPT-4o Mini
- Anthropic Claude 3.5 Sonnet/Haiku

### Analysis Templates
Templates provide structured analysis frameworks:

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
}
```

## API Architecture

### Server Actions
Located in `app/actions/`:
- `analyze.ts`: Main analysis functionality
- `coach.ts`: AI coaching functionality
- `template.ts`: Template management functionality

### API Routes
Located in `app/api/`:
- `/api/coach`: Streaming coaching responses
- `/api/templates`: Template management API

### Data Validation
All data is validated using Zod schemas:
- Input validation
- Type safety
- Error handling

## File Structure

```
charisma-ai/
├── app/                          # Next.js App Router
│   ├── actions/                  # Server Actions
│   │   ├── analyze.ts           # Chat analysis logic
│   │   ├── coach.ts             # AI coaching logic
│   │   └── template.ts          # Template management logic
│   ├── api/                     # API Routes
│   │   └── coach/               # Coaching API
│   │       └── route.ts         # Streaming responses
│   │   └── templates/           # Template management API
│   │       └── route.ts         # Template CRUD operations
│   ├── settings/                # Settings page
│   │   └── page.tsx             # Configuration UI
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main application
├── components/                   # React Components
│   ├── ui/                      # Reusable UI components
│   │   ├── alert.tsx           # Alert component
│   │   ├── button.tsx          # Button component
│   │   ├── card.tsx            # Card component
│   │   ├── dialog.tsx          # Dialog component
│   │   ├── input.tsx           # Input component
│   │   ├── label.tsx           # Label component
│   │   ├── progress.tsx        # Progress component
│   │   ├── scroll-area.tsx     # Scroll area component
│   │   ├── select.tsx          # Select component
│   │   ├── separator.tsx       # Separator component
│   │   ├── tabs.tsx            # Tabs component
│   │   └── textarea.tsx        # Textarea component
│   ├── CoachChat.tsx            # AI coaching interface
│   ├── ConversationCanvas.tsx   # Conversation visualization
│   ├── FlexibleAnalysisView.tsx # Main analysis display
│   ├── FlexibleInsightRenderer.tsx # Insight rendering
│   ├── LanguageProvider.tsx     # Language context
│   ├── LoadingIndicator.tsx     # Loading states
│   ├── TemplateManager.tsx      # Template management
│   └── UploadCard.tsx           # File upload interface
├── lib/                         # Utility Libraries
│   ├── ai-providers.ts          # AI provider configuration
│   ├── analysis-templates.ts    # Analysis template system
│   ├── i18n.ts                  # Internationalization
│   ├── settings.ts              # Settings management
│   └── utils.ts                 # Utility functions
├── src/types/                   # TypeScript Type Definitions
│   ├── analysis.ts              # Analysis-related types
│   ├── chat.ts                  # Chat-related types
│   ├── index.ts                 # Type exports
│   ├── metrics.ts               # Metric types
│   └── visualization.ts         # Visualization types
├── public/                      # Static Assets
├── package.json                 # Dependencies and scripts
├── tailwind.config.js           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
└── next.config.ts               # Next.js configuration
```

## Security Considerations

### API Key Management
- API keys are stored in environment variables
- Client-side access is limited to necessary operations
- Keys are not exposed in client-side code

### Data Privacy
- Chat files are processed in memory
- No persistent storage of chat content
- Analysis results are temporary

### Input Validation
- All inputs are validated using Zod schemas
- File type and size restrictions
- Sanitization of user inputs

## Performance Optimizations

### Code Splitting
- Next.js automatic code splitting
- Dynamic imports for heavy components
- Lazy loading of non-critical features

### Caching
- Static asset caching
- API response caching where appropriate
- Template caching for analysis

### Bundle Optimization
- Tree shaking for unused code
- Image optimization
- CSS purging with Tailwind

## Scalability Considerations

### Horizontal Scaling
- Stateless application design
- No server-side session storage
- Environment-based configuration

### AI Provider Scaling
- Multiple provider support
- Fallback mechanisms
- Rate limiting considerations

### Database Considerations
- Currently uses localStorage for settings
- Future: Database integration for user management
- Future: Analysis result storage

## Monitoring and Logging

### Error Handling
- Comprehensive error boundaries
- User-friendly error messages
- Console logging for debugging

### Performance Monitoring
- Next.js built-in performance monitoring
- Component render tracking
- API response time monitoring

## Future Architecture Considerations

### Microservices
- Separate analysis service
- Dedicated coaching service
- File processing service

### Database Integration
- User management system
- Analysis history
- Template sharing

### Real-time Features
- WebSocket integration
- Live collaboration
- Real-time notifications

### Mobile Support
- Progressive Web App (PWA)
- Native mobile applications
- Responsive design optimization 