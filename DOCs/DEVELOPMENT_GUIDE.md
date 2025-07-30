# CharismaAI Development Guide

## Development Environment Setup

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher (or yarn)
- **Git**: For version control
- **Code Editor**: VS Code recommended with TypeScript support

### Initial Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd charisma-ai
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   # or
   npm install
   # or
   yarn install
   ```

> **Note:** pnpm is the default package manager for this project. npm and yarn are supported as alternatives.

3. **Environment Configuration**
   ```bash
   cp env-example.txt .env.local
   ```
   
   Edit `.env.local` with your API keys:
   ```env
   GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open Browser**
   Navigate to `http://localhost:3000`

### Development Tools

#### Recommended VS Code Extensions
- **TypeScript and JavaScript Language Features**
- **Tailwind CSS IntelliSense**
- **ESLint**
- **Prettier**
- **Auto Rename Tag**
- **Bracket Pair Colorizer**

#### Useful Commands
```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Type checking
npx tsc --noEmit     # Type check without emitting files
```

## Project Structure

### Directory Organization

```
charisma-ai/
├── app/                    # Next.js App Router
│   ├── actions/           # Server Actions
│   ├── api/              # API Routes
│   ├── settings/         # Settings pages
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main page
├── components/           # React Components
│   ├── ui/              # Reusable UI components
│   └── *.tsx            # Feature components
├── lib/                 # Utility libraries
├── src/types/           # TypeScript types
├── public/              # Static assets
└── DOCs/                # Documentation
```

### Key Files and Their Purposes

#### Core Application Files
- `app/page.tsx`: Main application component with state management
- `app/layout.tsx`: Root layout with metadata and global styles
- `app/globals.css`: Global CSS with Tailwind directives

#### Server Actions
- `app/actions/analyze.ts`: Chat analysis functionality
- `app/actions/coach.ts`: AI coaching functionality
- `app/actions/template.ts`: Template management functionality

#### API Routes
- `app/api/coach/route.ts`: Streaming coaching API

#### Core Components
- `components/FlexibleAnalysisView.tsx`: Main analysis results display
- `components/CoachChat.tsx`: Interactive AI coaching interface
- `components/UploadCard.tsx`: File upload and processing
- `components/TemplateManager.tsx`: Custom template management

#### Utility Libraries
- `lib/ai-providers.ts`: AI provider configuration and management
- `lib/analysis-templates.ts`: Analysis template system
- `lib/settings.ts`: User settings and preferences
- `lib/utils.ts`: General utility functions

#### Type Definitions
- `src/types/analysis.ts`: Analysis-related types
- `src/types/chat.ts`: Chat message types
- `src/types/metrics.ts`: Metric and measurement types
- `src/types/visualization.ts`: Chart and visualization types

## Development Patterns

### Component Development

#### Component Structure
```typescript
"use client";

import React from "react";
import type { ComponentProps } from "@/src/types";

interface ComponentNameProps {
  // Define props interface
}

export default function ComponentName({ 
  // Destructure props
}: ComponentNameProps) {
  // Component logic
  
  return (
    // JSX
  );
}
```

#### Best Practices
- **Type Safety**: Always define TypeScript interfaces for props
- **Client Components**: Use "use client" directive for interactive components
- **Error Boundaries**: Wrap components that might fail
- **Loading States**: Provide loading indicators for async operations
- **Accessibility**: Use semantic HTML and ARIA attributes

### State Management

#### Application State
The main application uses `useReducer` for complex state:

```typescript
interface State {
  currentView: AppState;
  selectedFile: File | null;
  analysisData: AnalysisResult | null;
  error: string | null;
}

type Action =
  | { type: "SET_FILE"; payload: File }
  | { type: "START_ANALYSIS" }
  | { type: "ANALYSIS_SUCCESS"; payload: AnalysisResult }
  | { type: "ANALYSIS_ERROR"; payload: string };

function appReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_FILE":
      return { ...state, selectedFile: action.payload };
    // ... other cases
  }
}
```

#### Local State
Use `useState` for component-specific state:

```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

#### Persistent State
Use localStorage for user preferences:

```typescript
// In lib/settings.ts
export function setApiKey(keyName: string, value: string): void {
  localStorage.setItem(keyName, value);
}

export function getApiKey(keyName: string): string | null {
  return localStorage.getItem(keyName);
}
```

### AI Integration

#### Adding New AI Providers

1. **Update Provider Configuration**
   ```typescript
   // In lib/ai-providers.ts
   export const AI_PROVIDERS: AIProviderConfig[] = [
     // ... existing providers
     {
       id: "new-provider",
       name: "New Provider",
       apiKeyName: "NEW_PROVIDER_API_KEY",
       apiKeyPlaceholder: "your-api-key-here",
       getApiKeyUrl: "https://provider.com/api-keys",
       models: [
         {
           id: "model-id",
           name: "Model Name",
           provider: "new-provider",
           description: "Model description",
           available: true,
           tier: "paid"
         }
       ]
     }
   ];
   ```

2. **Add Analysis Function**
   ```typescript
   // In app/actions/analyze.ts
   async function analyzeWithNewProvider(
     prompt: string,
     apiKey: string,
     modelId: string,
   ): Promise<string> {
     // Implementation
   }
   ```

3. **Update Provider Selection Logic**
   ```typescript
   // In app/actions/analyze.ts
   switch (provider) {
     case "new-provider":
       return analyzeWithNewProvider(prompt, apiKey, modelId);
     // ... other cases
   }
   ```

#### Adding New Analysis Templates

1. **Create Template**
   ```typescript
   // In lib/analysis-templates.ts
   export const BUILT_IN_TEMPLATES: AnalysisTemplate[] = [
     // ... existing templates
     {
       id: "new-template",
       name: "New Template",
       description: "Template description",
       category: "custom",
       icon: "🎯",
       isBuiltIn: true,
       systemPrompt: "You are an expert...",
       analysisPrompt: (chatContent: string) => `
         // Analysis prompt template
         ${chatContent}
       `
     }
   ];
   ```

2. **Add Template-Specific Rendering**
   ```typescript
   // In components/FlexibleAnalysisView.tsx
   case "new-template":
     return (
       <div className="space-y-4">
         {/* Template-specific UI */}
       </div>
     );
   ```

### Error Handling

#### Client-Side Error Handling
```typescript
try {
  const result = await analyzeChat(formData);
  if (result.success) {
    // Handle success
  } else {
    throw new Error(result.error);
  }
} catch (error) {
  console.error("Analysis error:", error);
  // Handle error appropriately
}
```

#### Server-Side Error Handling
```typescript
export async function analyzeChat(formData: FormData) {
  try {
    // Analysis logic
    return { success: true, data: result };
  } catch (error) {
    console.error("Server error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}
```

#### Error Boundaries
```typescript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```

### Testing

#### Unit Testing
```typescript
// __tests__/analyze.test.ts
import { analyzeChat } from '@/app/actions/analyze';

describe('analyzeChat', () => {
  it('should analyze a valid chat file', async () => {
    const formData = new FormData();
    formData.append('chatFile', new File(['test content'], 'test.txt'));
    formData.append('modelId', 'gemini-2.5-flash');
    formData.append('provider', 'google');
    formData.append('apiKey', 'test-key');
    formData.append('templateId', 'communication-analysis');

    const result = await analyzeChat(formData);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });
});
```

#### Component Testing
```typescript
// __tests__/UploadCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import UploadCard from '@/components/UploadCard';

describe('UploadCard', () => {
  it('should handle file upload', () => {
    const mockOnFileSelect = jest.fn();
    const mockOnAnalyze = jest.fn();

    render(
      <UploadCard
        onFileSelect={mockOnFileSelect}
        onAnalyze={mockOnAnalyze}
        loading={false}
        error={null}
      />
    );

    const file = new File(['test content'], 'test.txt');
    const input = screen.getByLabelText(/upload/i);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(mockOnFileSelect).toHaveBeenCalledWith(file);
  });
});
```

### Performance Optimization

#### Code Splitting
```typescript
// Dynamic imports for heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
```

#### Memoization
```typescript
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Memoize components
const MemoizedComponent = React.memo(Component);
```

#### Bundle Optimization
```typescript
// Tree shaking friendly imports
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Avoid
import * as UI from '@/components/ui';
```

### Styling Guidelines

#### Tailwind CSS
```typescript
// Use Tailwind utility classes
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-semibold text-gray-900">Title</h2>
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    Action
  </button>
</div>
```

#### Component Variants
```typescript
// Use class-variance-authority for component variants
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

#### Responsive Design
```typescript
// Mobile-first responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="p-4 bg-white rounded-lg">
    Content
  </div>
</div>
```

## Contributing Guidelines

### Code Style

#### TypeScript
- Use strict TypeScript configuration
- Define interfaces for all props and data structures
- Use type inference where appropriate
- Avoid `any` type - use `unknown` or proper types

#### Naming Conventions
- **Components**: PascalCase (e.g., `FlexibleAnalysisView`)
- **Files**: kebab-case (e.g., `flexible-analysis-view.tsx`)
- **Functions**: camelCase (e.g., `analyzeChat`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `AI_PROVIDERS`)
- **Types/Interfaces**: PascalCase (e.g., `AnalysisResult`)

#### File Organization
- One component per file
- Group related components in directories
- Use index files for clean imports
- Keep files under 500 lines when possible

### Git Workflow

#### Branch Naming
- `feature/feature-name`: New features
- `fix/bug-description`: Bug fixes
- `docs/documentation-update`: Documentation changes
- `refactor/component-name`: Code refactoring

#### Commit Messages
```
type(scope): description

feat(analysis): add new analysis template
fix(upload): resolve file validation issue
docs(readme): update installation instructions
refactor(components): simplify state management
```

#### Pull Request Process
1. Create feature branch from main
2. Make changes with clear commit messages
3. Write tests for new functionality
4. Update documentation if needed
5. Create pull request with description
6. Request code review
7. Address feedback and merge

### Testing Strategy

#### Test Types
- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows
- **API Tests**: Test server actions and API routes

#### Test Coverage
- Aim for 80%+ code coverage
- Test error conditions and edge cases
- Mock external dependencies
- Use realistic test data

#### Testing Tools
- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing
- **MSW**: API mocking
- **Playwright**: E2E testing

### Documentation

#### Code Documentation
```typescript
/**
 * Analyzes chat conversations using AI models
 * @param formData - Form data containing chat file and configuration
 * @returns Promise resolving to analysis results
 * @throws Error if analysis fails
 */
export async function analyzeChat(formData: FormData): Promise<AnalysisResponse> {
  // Implementation
}
```

#### Component Documentation
```typescript
/**
 * Displays analysis results with interactive features
 * 
 * @example
 * ```tsx
 * <FlexibleAnalysisView
 *   analysisData={result}
 *   templateId="communication-analysis"
 *   onOpenCoach={() => setCoachOpen(true)}
 * />
 * ```
 */
interface FlexibleAnalysisViewProps {
  /** Analysis results to display */
  analysisData: AnalysisResult;
  /** Template ID for custom rendering */
  templateId?: string;
  /** Callback when coach is opened */
  onOpenCoach: () => void;
}
```

#### README Updates
- Update README.md for new features
- Add examples and usage instructions
- Update installation steps if needed
- Document breaking changes

## Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables
```env
# Production environment variables
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Deployment Platforms

#### Vercel (Recommended)
1. Connect GitHub repository
2. Configure environment variables
3. Deploy automatically on push to main

#### Netlify
1. Connect repository
2. Set build command: `npm run build`
3. Set publish directory: `.next`

#### Self-Hosted
1. Build the application
2. Set up reverse proxy (nginx)
3. Configure SSL certificates
4. Set up monitoring and logging

### Performance Monitoring

#### Core Web Vitals
- **LCP**: Largest Contentful Paint
- **FID**: First Input Delay
- **CLS**: Cumulative Layout Shift

#### Monitoring Tools
- **Vercel Analytics**: Built-in performance monitoring
- **Sentry**: Error tracking and performance monitoring
- **Google Analytics**: User behavior tracking

## Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Check TypeScript errors
npx tsc --noEmit

# Update dependencies
npm update
```

#### Runtime Errors
- Check browser console for client-side errors
- Check server logs for server-side errors
- Verify environment variables are set correctly
- Check API key validity and quotas

#### Performance Issues
- Use React DevTools Profiler
- Check bundle size with `npm run build`
- Optimize images and assets
- Implement code splitting

### Debug Tools

#### Development Tools
- **React DevTools**: Component inspection and profiling
- **Next.js DevTools**: Built-in debugging features
- **Browser DevTools**: Network, console, and performance

#### Logging
```typescript
// Development logging
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}

// Error logging
console.error('Error occurred:', error);
```

## Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Community
- [Next.js Discord](https://discord.gg/nextjs)
- [React Community](https://reactjs.org/community)
- [TypeScript Community](https://www.typescriptlang.org/community)

### Tools
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Tailwind CSS Playground](https://play.tailwindcss.com)
- [React DevTools](https://react.dev/learn/react-developer-tools)

---

This development guide should help you get started with contributing to CharismaAI. Remember to follow the established patterns and conventions, and don't hesitate to ask questions or seek help from the community. 