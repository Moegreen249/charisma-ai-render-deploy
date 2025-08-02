'use client';

import { useState, useCallback, useRef } from 'react';

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  exponentialBackoff?: boolean;
  onRetry?: (attempt: number, error: Error) => void;
  onMaxRetriesReached?: (error: Error) => void;
}

interface RetryState {
  isRetrying: boolean;
  retryCount: number;
  lastError: Error | null;
  canRetry: boolean;
}

export function useRetry(options: RetryOptions = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    exponentialBackoff = true,
    onRetry,
    onMaxRetriesReached
  } = options;

  const [state, setState] = useState<RetryState>({
    isRetrying: false,
    retryCount: 0,
    lastError: null,
    canRetry: true
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setState({
      isRetrying: false,
      retryCount: 0,
      lastError: null,
      canRetry: true
    });
  }, []);

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T> => {
    const attempt = async (attemptNumber: number): Promise<T> => {
      try {
        setState(prev => ({ ...prev, isRetrying: attemptNumber > 0 }));
        const result = await operation();
        
        // Success - reset state
        setState({
          isRetrying: false,
          retryCount: 0,
          lastError: null,
          canRetry: true
        });
        
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        
        if (attemptNumber >= maxRetries) {
          // Max retries reached
          setState({
            isRetrying: false,
            retryCount: attemptNumber,
            lastError: err,
            canRetry: false
          });
          
          if (onMaxRetriesReached) {
            onMaxRetriesReached(err);
          }
          
          throw err;
        }

        // Update state for retry
        setState({
          isRetrying: true,
          retryCount: attemptNumber,
          lastError: err,
          canRetry: true
        });

        if (onRetry) {
          onRetry(attemptNumber, err);
        }

        // Calculate delay with exponential backoff
        const delay = exponentialBackoff 
          ? retryDelay * Math.pow(2, attemptNumber - 1)
          : retryDelay;

        // Wait before retry
        await new Promise(resolve => {
          timeoutRef.current = setTimeout(resolve, delay);
        });

        // Retry
        return attempt(attemptNumber + 1);
      }
    };

    return attempt(1);
  }, [maxRetries, retryDelay, exponentialBackoff, onRetry, onMaxRetriesReached]);

  const retry = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T> => {
    // Reset retry count and try again
    setState(prev => ({
      ...prev,
      retryCount: 0,
      canRetry: true,
      isRetrying: false
    }));
    
    return executeWithRetry(operation);
  }, [executeWithRetry]);

  return {
    ...state,
    executeWithRetry,
    retry,
    reset
  };
}

// Specialized hook for story operations
export function useStoryRetry(options: RetryOptions = {}) {
  const defaultOptions: RetryOptions = {
    maxRetries: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
    onRetry: (attempt, error) => {
      console.log(`Story operation retry attempt ${attempt}:`, error.message);
    },
    onMaxRetriesReached: (error) => {
      console.error('Story operation failed after maximum retries:', error.message);
    },
    ...options
  };

  return useRetry(defaultOptions);
}

// Hook for API operations with specific error handling
export function useApiRetry(options: RetryOptions = {}) {
  const defaultOptions: RetryOptions = {
    maxRetries: 2,
    retryDelay: 500,
    exponentialBackoff: true,
    onRetry: (attempt, error) => {
      console.log(`API retry attempt ${attempt}:`, error.message);
    },
    ...options
  };

  return useRetry(defaultOptions);
}