'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Bug, Send } from "lucide-react";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import Home from "lucide-react/dist/esm/icons/home";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { reportClientError } from '@/lib/error-management';
import { themeClasses } from '@/components/providers/ThemeProvider';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'feature';
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Report error to our error management system
    reportClientError(
      error,
      this.props.componentName || 'Unknown Component',
      'Component Error',
      'HIGH'
    );

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  handleReportError = async () => {
    const { error, errorInfo, errorId } = this.state;
    if (!error || !errorId) return;

    try {
      await fetch('/api/errors/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: errorId,
          type: 'CLIENT',
          severity: 'HIGH',
          message: error.message,
          stackTrace: error.stack,
          componentStack: errorInfo?.componentStack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          componentName: this.props.componentName,
        }),
      });
      
      // Show success feedback
      alert('Error reported successfully. Thank you for helping us improve!');
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
      alert('Failed to report error. Please try again later.');
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { level = 'component', componentName } = this.props;
      const { error, errorId } = this.state;

      // Different UI based on error level
      if (level === 'page') {
        return (
          <div className={`min-h-screen ${themeClasses.bg.primary} flex items-center justify-center p-6`}>
            <div className="max-w-2xl mx-auto">
              <Card className={`${themeClasses.bg.glass} border-red-500/30`}>
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-400" />
                  </div>
                  <CardTitle className={`text-2xl ${themeClasses.text.primary}`}>
                    Something went wrong
                  </CardTitle>
                  <CardDescription className={themeClasses.text.secondary}>
                    We encountered an unexpected error. Our team has been notified.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {errorId && (
                    <div className="text-center">
                      <Badge variant="outline" className="text-red-400 border-red-500/30">
                        Error ID: {errorId}
                      </Badge>
                    </div>
                  )}

                  {process.env.NODE_ENV === 'development' && error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-400 text-sm font-mono">
                        {error.message}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={this.handleRetry}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                    <Button
                      onClick={() => window.location.href = '/'}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Go Home
                    </Button>
                    <Button
                      onClick={this.handleReportError}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Report Issue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      }

      // Component-level error UI
      return (
        <div className={`p-4 ${themeClasses.bg.card} border border-red-500/30 rounded-lg`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
              <Bug className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h3 className={`font-medium ${themeClasses.text.primary}`}>
                Component Error
              </h3>
              <p className={`text-sm ${themeClasses.text.muted}`}>
                {componentName ? `Error in ${componentName}` : 'An error occurred in this component'}
              </p>
            </div>
          </div>

          {process.env.NODE_ENV === 'development' && error && (
            <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400 font-mono">
              {error.message}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={this.handleRetry}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={this.handleReportError}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Send className="w-3 h-3 mr-1" />
              Report
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Convenience wrapper for different error boundary levels
export const PageErrorBoundary: React.FC<Omit<Props, 'level'>> = (props) => (
  <ErrorBoundary {...props} level="page" />
);

export const ComponentErrorBoundary: React.FC<Omit<Props, 'level'>> = (props) => (
  <ErrorBoundary {...props} level="component" />
);

export const FeatureErrorBoundary: React.FC<Omit<Props, 'level'>> = (props) => (
  <ErrorBoundary {...props} level="feature" />
);