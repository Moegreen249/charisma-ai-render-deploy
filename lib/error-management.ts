// Comprehensive Error Management System for CharismaAI
import React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ErrorDetails {
  id: string;
  timestamp: Date;
  type: 'AI_PROVIDER' | 'DATABASE' | 'AUTHENTICATION' | 'FILE_PROCESSING' | 'JSON_PARSING' | 'VALIDATION' | 'NETWORK' | 'SYSTEM' | 'USER_INPUT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  code?: string;
  message: string;
  description?: string;
  stackTrace?: string;
  endpoint?: string;
  userAgent?: string;
  userId?: string;
  sessionId?: string;
  requestData?: Record<string, any>;
  responseData?: Record<string, any>;
  aiProvider?: string;
  modelId?: string;
  metadata?: Record<string, any>;
  resolved?: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface ErrorStats {
  total: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  recent: number;
  resolved: number;
  unresolved: number;
}

interface ErrorStore {
  errors: ErrorDetails[];
  stats: ErrorStats;
  isLoading: boolean;
  lastFetch: Date | null;
  
  // Actions
  addError: (error: Omit<ErrorDetails, 'id' | 'timestamp'>) => void;
  resolveError: (errorId: string, resolvedBy?: string) => void;
  clearErrors: () => void;
  fetchErrors: () => Promise<void>;
  getErrorsByType: (type: ErrorDetails['type']) => ErrorDetails[];
  getErrorsBySeverity: (severity: ErrorDetails['severity']) => ErrorDetails[];
  getRecentErrors: (hours?: number) => ErrorDetails[];
  updateStats: () => void;
}

export const useErrorStore = create<ErrorStore>()(
  persist(
    (set, get) => ({
      errors: [],
      stats: {
        total: 0,
        byType: {},
        bySeverity: {},
        recent: 0,
        resolved: 0,
        unresolved: 0,
      },
      isLoading: false,
      lastFetch: null,

      addError: (errorData) => {
        const error: ErrorDetails = {
          ...errorData,
          id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
        };

        set((state) => ({
          errors: [error, ...state.errors.slice(0, 999)], // Keep only last 1000 errors
        }));

        // Update stats
        get().updateStats();

        // Send to backend if in production
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
          reportErrorToBackend(error);
        }
      },

      resolveError: (errorId, resolvedBy) => {
        set((state) => ({
          errors: state.errors.map((error) =>
            error.id === errorId
              ? {
                  ...error,
                  resolved: true,
                  resolvedAt: new Date(),
                  resolvedBy,
                }
              : error
          ),
        }));
        get().updateStats();
      },

      clearErrors: () => {
        set({ errors: [] });
        get().updateStats();
      },

      fetchErrors: async () => {
        set({ isLoading: true });
        try {
          const response = await fetch('/api/admin/errors');
          if (response.ok) {
            const data = await response.json();
            set({
              errors: data.errors || [],
              lastFetch: new Date(),
            });
            get().updateStats();
          }
        } catch (error) {
          console.error('Failed to fetch errors:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      getErrorsByType: (type) => {
        return get().errors.filter((error) => error.type === type);
      },

      getErrorsBySeverity: (severity) => {
        return get().errors.filter((error) => error.severity === severity);
      },

      getRecentErrors: (hours = 24) => {
        const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
        return get().errors.filter((error) => error.timestamp > cutoff);
      },

      updateStats: () => {
        const { errors } = get();
        const byType: Record<string, number> = {};
        const bySeverity: Record<string, number> = {};

        errors.forEach((error) => {
          byType[error.type] = (byType[error.type] || 0) + 1;
          bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
        });

        const recent = get().getRecentErrors().length;
        const resolved = errors.filter((e) => e.resolved).length;

        set({
          stats: {
            total: errors.length,
            byType,
            bySeverity,
            recent,
            resolved,
            unresolved: errors.length - resolved,
          },
        });
      },

    }),
    {
      name: 'charisma-error-store',
      partialize: (state) => ({
        errors: state.errors.slice(0, 100), // Only persist last 100 errors
        stats: state.stats,
        lastFetch: state.lastFetch,
      }),
    }
  )
);

// Helper function to report errors to backend
const reportErrorToBackend = async (error: ErrorDetails) => {
  try {
    await fetch('/api/errors/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category: error.type,
        severity: error.severity,
        code: error.code,
        message: error.message,
        endpoint: error.endpoint,
        userAgent: error.userAgent,
        userId: error.userId,
        sessionId: error.sessionId,
        stackTrace: error.stackTrace,
        requestData: error.requestData,
        responseData: error.responseData,
        aiProvider: error.aiProvider,
        modelId: error.modelId,
        timestamp: error.timestamp.toISOString(),
      }),
    });
  } catch (reportError) {
    console.error('Failed to report error:', reportError);
  }
};

// Error reporting helper functions
export const reportError = (
  type: ErrorDetails['type'],
  severity: ErrorDetails['severity'],
  message: string,
  options?: Partial<ErrorDetails>
) => {
  const errorStore = useErrorStore.getState();
  
  errorStore.addError({
    type,
    severity,
    message,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    endpoint: typeof window !== 'undefined' ? window.location.href : undefined,
    ...options,
  });
};

// Specialized error reporters
export const reportAPIError = (
  message: string,
  statusCode?: number,
  endpoint?: string,
  severity: ErrorDetails['severity'] = 'MEDIUM'
) => {
  reportError('NETWORK', severity, message, {
    endpoint,
    requestData: { statusCode },
    description: `API error occurred${endpoint ? ` at ${endpoint}` : ''}${statusCode ? ` with status ${statusCode}` : ''}`,
  });
};

export const reportClientError = (
  error: Error,
  component?: string,
  action?: string,
  severity: ErrorDetails['severity'] = 'LOW'
) => {
  reportError('SYSTEM', severity, error.message, {
    stackTrace: error.stack,
    metadata: { component, action },
    description: `Client-side error in ${component || 'unknown component'}`,
  });
};

export const reportNetworkError = (
  message: string,
  url?: string,
  severity: ErrorDetails['severity'] = 'HIGH'
) => {
  reportError('NETWORK', severity, message, {
    endpoint: url,
    description: `Network connectivity issue${url ? ` for ${url}` : ''}`,
  });
};

export const reportValidationError = (
  field: string,
  value: any,
  rule: string,
  severity: ErrorDetails['severity'] = 'LOW'
) => {
  reportError('VALIDATION', severity, `Validation failed for ${field}`, {
    requestData: { field, value, rule },
    description: `Validation rule '${rule}' failed for field '${field}'`,
  });
};

// Error boundary hook
export const useErrorHandler = () => {
  const addError = useErrorStore((state) => state.addError);

  const handleError = React.useCallback(
    (error: Error, errorInfo?: { componentStack: string }) => {
      addError({
        type: 'SYSTEM',
        severity: 'HIGH',
        message: error.message,
        stackTrace: error.stack,
        metadata: errorInfo,
        description: 'Unhandled React error caught by error boundary',
      });
    },
    [addError]
  );

  return { handleError };
};

// Global error handler setup
export const setupGlobalErrorHandling = () => {
  if (typeof window === 'undefined') return;

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    reportError('SYSTEM', 'HIGH', `Unhandled promise rejection: ${event.reason}`, {
      stackTrace: event.reason?.stack,
      description: 'Unhandled promise rejection detected',
    });
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    reportError('SYSTEM', 'HIGH', event.message, {
      stackTrace: event.error?.stack,
      endpoint: event.filename,
      metadata: {
        line: event.lineno,
        column: event.colno,
      },
      description: 'Uncaught JavaScript error',
    });
  });

  // Handle resource loading errors
  window.addEventListener('error', (event) => {
    if (event.target !== window) {
      const target = event.target as HTMLElement;
      reportError('SYSTEM', 'MEDIUM', `Resource failed to load: ${target.tagName}`, {
        endpoint: (target as any).src || (target as any).href,
        description: `Failed to load ${target.tagName.toLowerCase()} resource`,
      });
    }
  }, true);
};