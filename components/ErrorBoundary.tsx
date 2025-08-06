'use client';

import React from 'react';
import { RefreshCw } from "lucide-react";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { themeConfig } from '@/lib/theme-config';
import { cn } from '@/lib/utils';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
}

class ErrorBoundaryClass extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} retry={this.retry} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, retry }: { error?: Error; retry: () => void }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <Card className={cn(
        "w-full max-w-md mx-auto",
        themeConfig.colors.glass.background,
        themeConfig.colors.glass.border,
        "border backdrop-blur-xl"
      )}>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <CardTitle className="text-white">Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-400 text-sm">
            {error?.message || 'An unexpected error occurred. Please try again.'}
          </p>
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
        </CardContent>
      </Card>
    </div>
  );
}

// Admin-specific error fallback
function AdminErrorFallback({ error, retry }: { error?: Error; retry: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6 relative overflow-hidden">
      {/* Neural background particles - error state */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 left-8 sm:left-20 w-2 h-2 bg-red-400/20 rounded-full animate-pulse motion-reduce:animate-none"></div>
        <div className="absolute top-48 right-12 sm:right-32 w-1 h-1 bg-orange-400/25 rounded-full animate-ping motion-reduce:animate-none"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10 flex items-center justify-center min-h-[80vh]">
        <Card className={cn(
          "w-full max-w-lg mx-auto",
          themeConfig.colors.glass.background,
          themeConfig.colors.glass.border,
          "border backdrop-blur-xl"
        )}>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <CardTitle className="text-white text-xl">Admin Panel Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-gray-400">
              {error?.message || 'An error occurred while loading the admin panel. This might be a temporary issue.'}
            </p>
            <div className="space-y-3">
              <Button
                onClick={retry}
                className={cn(
                  "w-full h-12",
                  "bg-gradient-to-r",
                  themeConfig.colors.gradients.button,
                  "text-white font-medium",
                  "hover:opacity-90 transition-all duration-300",
                  "touch-manipulation"
                )}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Admin Panel
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="w-full h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 touch-manipulation"
              >
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Export the class component as ErrorBoundary
export const ErrorBoundary = ErrorBoundaryClass;
export { AdminErrorFallback, DefaultErrorFallback };