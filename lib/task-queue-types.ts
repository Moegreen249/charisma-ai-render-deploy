import { TaskType, TaskPriority, TaskStatus } from '@prisma/client';

export interface TaskPayload {
  type: TaskType;
  data: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface TaskResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface QueuePosition {
  position: number;
  estimatedWaitTime: number; // in seconds
}

export interface TaskMetrics {
  totalQueued: number;
  totalRunning: number;
  totalCompleted: number;
  totalFailed: number;
  averageWaitTime: number;
  averageProcessingTime: number;
  successRate: number;
}

export interface TaskQueueConfig {
  maxConcurrentTasks: number;
  priorityWeights: Record<TaskPriority, number>;
  retryDelays: number[]; // exponential backoff delays in seconds
  timeoutSettings: Record<TaskType, number>; // timeout in seconds
  estimatedProcessingTimes: Record<TaskType, number>; // average processing time in seconds
}

export interface TaskDisplayInfo {
  id: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  estimatedTime?: number;
  actualTime?: number;
  queuePosition?: number;
  estimatedWaitTime?: number;
  canCancel: boolean;
  canRetry: boolean;
  error?: string;
  result?: any;
  createdAt: Date;
  queuedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  retryCount: number;
  maxRetries: number;
}

export interface TaskFilters {
  status?: TaskStatus[];
  type?: TaskType[];
  priority?: TaskPriority[];
  limit?: number;
  offset?: number;
}

export interface TaskListResponse {
  tasks: TaskDisplayInfo[];
  total: number;
  hasMore: boolean;
}

// Task processor interface for implementing specific task handlers
export interface TaskProcessor {
  type: TaskType;
  process(taskId: string, payload: Record<string, any>): Promise<TaskResult>;
  estimateTime(payload: Record<string, any>): number;
  validatePayload(payload: Record<string, any>): boolean;
}

// Real-time update events
export interface TaskUpdateEvent {
  taskId: string;
  userId: string;
  type: 'status' | 'progress' | 'completed' | 'failed' | 'cancelled';
  data: {
    status?: TaskStatus;
    progress?: number;
    result?: any;
    error?: string;
    queuePosition?: number;
    estimatedWaitTime?: number;
    currentStep?: string;
    estimatedTimeRemaining?: number;
  };
  timestamp: Date;
}

// WebSocket message types for real-time updates
export interface TaskWebSocketMessage {
  type: 'task_update' | 'queue_metrics' | 'task_list';
  data: TaskUpdateEvent | TaskMetrics | TaskListResponse;
}

export const TASK_PRIORITIES: Record<TaskPriority, { label: string; weight: number; color: string }> = {
  [TaskPriority.LOW]: { label: 'Low', weight: 1, color: 'gray' },
  [TaskPriority.NORMAL]: { label: 'Normal', weight: 2, color: 'blue' },
  [TaskPriority.HIGH]: { label: 'High', weight: 3, color: 'orange' },
  [TaskPriority.URGENT]: { label: 'Urgent', weight: 4, color: 'red' },
};

export const TASK_STATUSES: Record<TaskStatus, { label: string; color: string; icon: string }> = {
  [TaskStatus.QUEUED]: { label: 'Queued', color: 'gray', icon: '⏳' },
  [TaskStatus.RUNNING]: { label: 'Running', color: 'blue', icon: '⚡' },
  [TaskStatus.COMPLETED]: { label: 'Completed', color: 'green', icon: '✅' },
  [TaskStatus.FAILED]: { label: 'Failed', color: 'red', icon: '❌' },
  [TaskStatus.CANCELED]: { label: 'Cancelled', color: 'orange', icon: '🚫' },
};

export const TASK_TYPES: Record<TaskType, { label: string; description: string; icon: string }> = {
  [TaskType.STORY_GENERATION]: { 
    label: 'Story Generation', 
    description: 'Generate AI-powered stories from analysis results',
    icon: '📖' 
  },
  [TaskType.ANALYSIS]: { 
    label: 'Analysis', 
    description: 'Analyze uploaded content for insights',
    icon: '🔍' 
  },
  [TaskType.EXPORT]: { 
    label: 'Export', 
    description: 'Export data in various formats',
    icon: '📤' 
  },
};

// Utility functions
export function getTaskDisplayInfo(task: any): TaskDisplayInfo {
  return {
    id: task.id,
    type: task.type,
    status: task.status,
    priority: task.priority,
    progress: task.progress,
    estimatedTime: task.estimatedTime,
    actualTime: task.actualTime,
    canCancel: task.status === TaskStatus.QUEUED || task.status === TaskStatus.RUNNING,
    canRetry: (task.status === TaskStatus.FAILED || task.status === TaskStatus.CANCELED) && task.retryCount < task.maxRetries,
    error: task.error,
    result: task.result,
    createdAt: task.createdAt,
    queuedAt: task.queuedAt,
    startedAt: task.startedAt,
    completedAt: task.completedAt,
    retryCount: task.retryCount,
    maxRetries: task.maxRetries,
  };
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
}

export function getTaskStatusColor(status: TaskStatus): string {
  return TASK_STATUSES[status]?.color || 'gray';
}

export function getTaskPriorityColor(priority: TaskPriority): string {
  return TASK_PRIORITIES[priority]?.color || 'gray';
}

export function isTaskActive(status: TaskStatus): boolean {
  return status === TaskStatus.QUEUED || status === TaskStatus.RUNNING;
}

export function isTaskCompleted(status: TaskStatus): boolean {
  return status === TaskStatus.COMPLETED || status === TaskStatus.FAILED || status === TaskStatus.CANCELED;
}