"use client";

import React from 'react';
import { useTaskStatus } from '@/hooks/useTaskStatus';
import { useTaskWebSocket } from '@/hooks/useWebSocket';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  Play, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskStatusIndicatorProps {
  taskId: string;
  onComplete?: (result: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function TaskStatusIndicator({ 
  taskId, 
  onComplete, 
  onError, 
  className 
}: TaskStatusIndicatorProps) {
  const { task, loading, error, retryTask, cancelTask } = useTaskStatus(taskId);
  const { 
    isConnected: wsConnected, 
    progress: wsProgress, 
    currentStep: wsCurrentStep,
    currentStatus: wsStatus 
  } = useTaskWebSocket(taskId);

  // Use WebSocket data when available, fallback to polling data
  const currentProgress = wsConnected && typeof wsProgress === 'number' ? wsProgress : task?.progress || 0;
  const currentStep = wsConnected && wsCurrentStep ? wsCurrentStep : null;
  const liveStatus = wsConnected && wsStatus ? wsStatus : task?.status;

  // Handle completion callback
  React.useEffect(() => {
    if (task?.status === 'COMPLETED' && onComplete) {
      onComplete(task.result);
    }
  }, [task?.status, task?.result, onComplete]);

  // Handle error callback
  React.useEffect(() => {
    if (task?.status === 'FAILED' && onError) {
      onError(task.error || 'Task failed');
    }
  }, [task?.status, task?.error, onError]);

  if (loading) {
    return (
      <div className={cn("flex items-center gap-2 p-4 rounded-lg bg-gray-50 dark:bg-gray-800", className)}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-gray-600 dark:text-gray-400">Loading task status...</span>
      </div>
    );
  }

  if (error || !task) {
    return (
      <Alert className={cn("border-red-200 bg-red-50 dark:bg-red-900/20", className)}>
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800 dark:text-red-200">
          {error || 'Task not found'}
        </AlertDescription>
      </Alert>
    );
  }

  const getStatusIcon = () => {
    switch (task.status) {
      case 'QUEUED':
        return <Clock className="w-4 h-4" />;
      case 'RUNNING':
        return <Play className="w-4 h-4" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4" />;
      case 'CANCELED':
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    switch (task.status) {
      case 'QUEUED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'RUNNING':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-200';
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-200';
      case 'CANCELED':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const getQueuePositionText = () => {
    if (!task.queuePosition) return null;
    const { position, estimatedWaitTime } = task.queuePosition;
    return `Position ${position} in queue • ~${formatDuration(estimatedWaitTime)} wait`;
  };

  const getRetryText = () => {
    if (task.retryInfo.isRetrying) {
      const nextRetry = task.retryInfo.nextRetryAt ? new Date(task.retryInfo.nextRetryAt) : null;
      const now = new Date();
      if (nextRetry && nextRetry > now) {
        const waitTime = Math.ceil((nextRetry.getTime() - now.getTime()) / 1000);
        return `Retrying in ${formatDuration(waitTime)}`;
      }
      return 'Retry scheduled';
    }
    return `Attempt ${task.retryInfo.currentAttempt} of ${task.retryInfo.maxAttempts}`;
  };

  return (
    <div className={cn("space-y-3 p-4 rounded-lg border bg-white dark:bg-gray-800", className)}>
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className={cn("flex items-center gap-1", getStatusColor())}>
            {getStatusIcon()}
            <span className="capitalize">{task.status.toLowerCase()}</span>
          </Badge>
          
          {task.retryInfo.currentAttempt > 1 && (
            <Badge variant="outline" className="text-xs">
              {getRetryText()}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {task.retryInfo.canRetry && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => retryTask()}
              className="flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Retry
            </Button>
          )}
          
          {task.canCancel && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => cancelTask()}
              className="flex items-center gap-1 text-red-600 hover:text-red-700"
            >
              <X className="w-3 h-3" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {(liveStatus === 'RUNNING' || liveStatus === 'QUEUED') && (
        <div className="space-y-1">
          <Progress value={currentProgress} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{currentProgress}% complete</span>
            {task.estimatedTime && (
              <span>~{formatDuration(task.estimatedTime)} estimated</span>
            )}
          </div>
          {/* Show current step if available from WebSocket */}
          {currentStep && (
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              {currentStep}
            </div>
          )}
          {/* WebSocket connection indicator */}
          {wsConnected && (
            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Live updates
            </div>
          )}
        </div>
      )}

      {/* Queue Position */}
      {task.status === 'QUEUED' && task.queuePosition && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {getQueuePositionText()}
        </div>
      )}

      {/* Retry Information */}
      {task.retryInfo.isRetrying && (
        <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
          <RotateCcw className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            Task is being retried due to a previous failure. {getRetryText()}.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {task.status === 'FAILED' && task.error && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <div className="space-y-1">
              <div className="font-medium">Task failed:</div>
              <div className="text-sm">{task.error}</div>
              {task.retryInfo.canRetry && (
                <div className="text-sm">
                  You can retry this task ({task.retryInfo.currentAttempt} of {task.retryInfo.maxAttempts} attempts used).
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {task.status === 'COMPLETED' && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            <div className="space-y-1">
              <div className="font-medium">Task completed successfully!</div>
              {task.actualTime && (
                <div className="text-sm">
                  Completed in {formatDuration(task.actualTime)}
                  {task.retryInfo.currentAttempt > 1 && 
                    ` (after ${task.retryInfo.currentAttempt} attempts)`
                  }
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Task Details */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <div>Task ID: {task.id}</div>
        <div>Created: {new Date(task.createdAt).toLocaleString()}</div>
        {task.completedAt && (
          <div>Completed: {new Date(task.completedAt).toLocaleString()}</div>
        )}
      </div>
    </div>
  );
}

export default TaskStatusIndicator;