'use client';

import React from 'react';
import { RefreshCw, ArrowLeft, BookOpen } from "lucide-react";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import Home from "lucide-react/dist/esm/icons/home";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { themeConfig } from '@/lib/theme-config';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface StoryErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  retryCount: number;
}

interface StoryErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<StoryErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  maxRetries?: number;
  context?: 'story-list' | 'story-viewer' | 'story-component';
}

interface StoryErrorFallbackProps {
  error?: Error;
  errorInfo?: React.ErrorInfo;
  retry: () => void;
  canRetry: boolean;
  context?: string;
}

class StoryErrorBoundaryClass extends React.Component<StoryErrorBoundaryProps, StoryErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: StoryErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<StoryErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('StoryErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({ errorInfo });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error details for debugging
    console.group('Story Error Boundary Details');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Context:', this.props.context);
    console.groupEnd();
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  retry = () => {
    const maxRetries = this.props.maxRetries || 3;
    
    if (this.state.retryCount >= maxRetries) {
      console.warn('Maximum retry attempts reached');
      return;
    }

    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: prevState.retryCount + 1
    }));

    // Add a small delay before retry to prevent immediate re-error
    this.retryTimeoutId = setTimeout(() => {
      // Force a re-render by updating state
      this.forceUpdate();
    }, 100);
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || StoryErrorFallback;
      const maxRetries = this.props.maxRetries || 3;
      const canRetry = this.state.retryCount < maxRetries;
      
      return (
        <FallbackComponent 
          error={this.state.error} 
          errorInfo={this.state.errorInfo}
          retry={this.retry}
          canRetry={canRetry}
          context={this.props.context}
        />
      );
    }

    return this.props.children;
  }
}

function StoryErrorFallback({ 
  error, 
  errorInfo, 
  retry, 
  canRetry, 
  context 
}: StoryErrorFallbackProps) {
  const getContextualContent = () => {
    switch (context) {
      case 'story-list':
        return {
          title: 'Stories List Error',
          description: 'There was an error loading your stories. This might be due to a network issue or server problem.',
          icon: BookOpen,
          actions: (
            <div className="space-y-3">
              {canRetry && (
                <Button
                  onClick={retry}
                  className={cn(
                    "w-full",
                    "bg-gradient-to-r",
                    themeConfig.colors.gradients.button,
                    "text-white font-medium",
                    "hover:opacity-90 transition-all duration-300",
                    "touch-manipulation"
                  )}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Loading Stories
                </Button>
              )}
              <Link href="/" className="block">
                <Button
                  variant="outline"
                  className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 touch-manipulation"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Home
                </Button>
              </Link>
            </div>
          )
        };
      
      case 'story-viewer':
        return {
          title: 'Story Viewer Error',
          description: 'There was an error displaying this story. The story data might be corrupted or there could be a rendering issue.',
          icon: BookOpen,
          actions: (
            <div className="space-y-3">
              {canRetry && (
                <Button
                  onClick={retry}
                  className={cn(
                    "w-full",
                    "bg-gradient-to-r",
                    themeConfig.colors.gradients.button,
                    "text-white font-medium",
                    "hover:opacity-90 transition-all duration-300",
                    "touch-manipulation"
                  )}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Loading Story
                </Button>
              )}
              <Link href="/stories" className="block">
                <Button
                  variant="outline"
                  className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 touch-manipulation"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Stories
                </Button>
              </Link>
            </div>
          )
        };
      
      default:
        return {
          title: 'Story Component Error',
          description: 'A story component encountered an error. This might be a temporary issue.',
          icon: AlertTriangle,
          actions: (
            <div className="space-y-3">
              {canRetry && (
                <Button
                  onClick={retry}
                  className={cn(
                    "w-full",
                    "bg-gradient-to-r",
                    themeConfig.colors.gradients.button,
                    "text-white font-medium",
                    "hover:opacity-90 transition-all duration-300",
                    "touch-manipulation"
                  )}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 touch-manipulation"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Page
              </Button>
            </div>
          )
        };
    }
  };

  const contextContent = getContextualContent();
  const Icon = contextContent.icon;

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Neural background particles - error state */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 left-8 sm:left-20 w-2 h-2 bg-red-400/20 rounded-full animate-pulse motion-reduce:animate-none"></div>
        <div className="absolute top-48 right-12 sm:right-32 w-1 h-1 bg-orange-400/25 rounded-full animate-ping motion-reduce:animate-none"></div>
        <div className="absolute bottom-40 left-16 w-1.5 h-1.5 bg-red-300/20 rounded-full animate-pulse motion-reduce:animate-none" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-24 right-20 w-1 h-1 bg-orange-300/25 rounded-full animate-ping motion-reduce:animate-none" style={{animationDelay: '2s'}}></div>
      </div>

      <Card className={cn(
        "w-full max-w-md mx-auto relative z-10",
        themeConfig.colors.glass.background,
        themeConfig.colors.glass.border,
        "border backdrop-blur-xl",
        "border-red-500/20"
      )}>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <Icon className="w-6 h-6 text-red-400" />
          </div>
          <CardTitle className="text-white">{contextContent.title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-400 text-sm">
            {contextContent.description}
          </p>
          
          {/* Error details for development */}
          {process.env.NODE_ENV === 'development' && error && (
            <details className="text-left">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                Error Details (Development)
              </summary>
              <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-300 font-mono">
                <div className="mb-1">
                  <strong>Message:</strong> {error.message}
                </div>
                {error.stack && (
                  <div className="mb-1">
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap text-xs mt-1 max-h-32 overflow-y-auto">
                      {error.stack}
                    </pre>
                  </div>
                )}
                {errorInfo?.componentStack && (
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="whitespace-pre-wrap text-xs mt-1 max-h-32 overflow-y-auto">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          {!canRetry && (
            <p className="text-xs text-orange-400">
              Maximum retry attempts reached. Please refresh the page or contact support if the issue persists.
            </p>
          )}

          {contextContent.actions}
        </CardContent>
      </Card>
    </div>
  );
}

// Specialized error boundaries for different story contexts
export function StoryListErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <StoryErrorBoundaryClass context="story-list" maxRetries={3}>
      {children}
    </StoryErrorBoundaryClass>
  );
}

export function StoryViewerErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <StoryErrorBoundaryClass context="story-viewer" maxRetries={2}>
      {children}
    </StoryErrorBoundaryClass>
  );
}

export function StoryComponentErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <StoryErrorBoundaryClass context="story-component" maxRetries={1}>
      {children}
    </StoryErrorBoundaryClass>
  );
}

// Export the main class component as StoryErrorBoundary
export const StoryErrorBoundary = StoryErrorBoundaryClass;
export default StoryErrorBoundary;