import { useState, useEffect, useCallback } from 'react';

// Define types for background jobs (replacing old TaskStatus and TaskType enums)
export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type JobType = 'ANALYSIS' | 'STORY_GENERATION';

export interface TaskInfo {
  id: string;
  type: JobType | string;
  status: JobStatus | string;
  priority: string;
  progress: number;
  estimatedTime?: number;
  actualTime?: number;
  error?: string;
  result?: any;
  createdAt: string;
  queuedAt: string;
  startedAt?: string;
  completedAt?: string;
  currentStep?: string;
  totalSteps?: number;
  fileName?: string;
  storyId?: string;
  analysisId?: string;
  queuePosition?: {
    position: number;
    estimatedWaitTime: number;
  };
  retryInfo: {
    currentAttempt: number;
    maxAttempts: number;
    canRetry: boolean;
    isRetrying: boolean;
    nextRetryAt?: string;
  };
  canCancel: boolean;
  isComplete?: boolean;
  estimatedTimeRemaining?: number;
}

export interface UseTaskStatusOptions {
  pollInterval?: number;
  autoRefresh?: boolean;
}

export function useTaskStatus(taskId: string, options: UseTaskStatusOptions = {}) {
  const { pollInterval = 2000, autoRefresh = true } = options;
  
  const [task, setTask] = useState<TaskInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTask = useCallback(async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch task');
      }

      setTask(data.task);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  const retryTask = useCallback(async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to retry task');
      }

      // Refresh task status after retry
      await fetchTask();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retry task');
      return false;
    }
  }, [taskId, fetchTask]);

  const cancelTask = useCallback(async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel task');
      }

      // Refresh task status after cancellation
      await fetchTask();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel task');
      return false;
    }
  }, [taskId, fetchTask]);

  // Initial fetch
  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  // Auto-refresh for active tasks
  useEffect(() => {
    if (!autoRefresh || !task) return;

    const isActive = task.status === 'PENDING' || task.status === 'PROCESSING';
    if (!isActive) return;

    const interval = setInterval(fetchTask, pollInterval);
    return () => clearInterval(interval);
  }, [task, autoRefresh, pollInterval, fetchTask]);

  return {
    task,
    loading,
    error,
    refetch: fetchTask,
    retryTask,
    cancelTask,
  };
}

export interface UseTaskListOptions {
  status?: JobStatus[];
  type?: JobType[];
  limit?: number;
  autoRefresh?: boolean;
  pollInterval?: number;
}

export function useTaskList(options: UseTaskListOptions = {}) {
  const { 
    status, 
    type, 
    limit = 50, 
    autoRefresh = true, 
    pollInterval = 5000 
  } = options;
  
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1,
    hasMore: false,
  });

  const fetchTasks = useCallback(async (offset = 0) => {
    try {
      const params = new URLSearchParams();
      if (status?.length) params.set('status', status.join(','));
      if (type?.length) params.set('type', type.join(','));
      params.set('limit', limit.toString());
      params.set('offset', offset.toString());

      const response = await fetch(`/api/tasks?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tasks');
      }

      setTasks(data.tasks);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [status, type, limit]);

  const retryTask = useCallback(async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to retry task');
      }

      // Refresh task list after retry
      await fetchTasks();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retry task');
      return false;
    }
  }, [fetchTasks]);

  const cancelTask = useCallback(async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel task');
      }

      // Refresh task list after cancellation
      await fetchTasks();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel task');
      return false;
    }
  }, [fetchTasks]);

  // Initial fetch
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Auto-refresh for active tasks
  useEffect(() => {
    if (!autoRefresh) return;

    const hasActiveTasks = tasks.some(task => 
      task.status === 'PENDING' || task.status === 'PROCESSING'
    );

    if (!hasActiveTasks) return;

    const interval = setInterval(() => fetchTasks(), pollInterval);
    return () => clearInterval(interval);
  }, [tasks, autoRefresh, pollInterval, fetchTasks]);

  return {
    tasks,
    loading,
    error,
    pagination,
    refetch: fetchTasks,
    retryTask,
    cancelTask,
  };
}