import { ErrorCategory } from './enhanced-error-handler';

export interface StoryErrorInfo {
  userMessage: string;
  technicalMessage: string;
  recoveryActions: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRetryable: boolean;
  estimatedRecoveryTime?: string;
}

/**
 * Generate user-friendly error messages for story generation issues
 */
export function generateStoryErrorMessage(
  error: Error,
  category: ErrorCategory,
  context: {
    storyId?: string;
    userId?: string;
    attempt?: number;
    totalAttempts?: number;
    aiProvider?: string;
    model?: string;
  }
): StoryErrorInfo {
  const errorMessage = error.message.toLowerCase();
  const { attempt = 1, totalAttempts = 3, aiProvider = 'AI service', model = 'unknown' } = context;

  // AI Service specific errors
  if (category === ErrorCategory.AI_SERVICE) {
    if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
      return {
        userMessage: `We've temporarily reached our ${aiProvider} usage limit. Your story will be generated automatically once the limit resets.`,
        technicalMessage: error.message,
        recoveryActions: [
          'Your story is queued and will be processed automatically',
          'Try again in a few minutes if you need immediate results',
          'Consider upgrading to Pro for higher limits'
        ],
        severity: 'medium',
        isRetryable: true,
        estimatedRecoveryTime: '5-15 minutes'
      };
    }

    if (errorMessage.includes('timeout')) {
      return {
        userMessage: `The AI service took longer than expected to respond. We're automatically retrying your story generation.`,
        technicalMessage: error.message,
        recoveryActions: [
          'The system will automatically retry',
          'This usually resolves within a few attempts',
          'No action needed from you'
        ],
        severity: 'medium',
        isRetryable: true,
        estimatedRecoveryTime: '1-3 minutes'
      };
    }

    if (errorMessage.includes('service unavailable') || errorMessage.includes('temporary')) {
      return {
        userMessage: `${aiProvider} is temporarily experiencing issues. We're automatically retrying your request.`,
        technicalMessage: error.message,
        recoveryActions: [
          'The system will automatically switch to backup providers if available',
          'Your story will be generated once service is restored',
          'Check our status page for updates'
        ],
        severity: 'high',
        isRetryable: true,
        estimatedRecoveryTime: '5-10 minutes'
      };
    }

    return {
      userMessage: `We encountered an issue with the AI service while generating your story. The system is automatically retrying.`,
      technicalMessage: error.message,
      recoveryActions: [
        'The system will automatically retry with different parameters',
        'If this persists, try regenerating the story',
        'Contact support if the issue continues'
      ],
      severity: 'medium',
      isRetryable: true,
      estimatedRecoveryTime: '2-5 minutes'
    };
  }

  // Story generation specific errors
  if (category === ErrorCategory.STORY_GENERATION) {
    if (errorMessage.includes('parsing') || errorMessage.includes('malformed')) {
      return {
        userMessage: `The AI generated content but we had trouble formatting it properly. We're trying again with improved settings.`,
        technicalMessage: error.message,
        recoveryActions: [
          'The system will automatically retry with simplified prompts',
          'Your story content is preserved and will be recovered',
          'This usually succeeds on the next attempt'
        ],
        severity: 'medium',
        isRetryable: true,
        estimatedRecoveryTime: '1-2 minutes'
      };
    }

    if (errorMessage.includes('disabled')) {
      return {
        userMessage: `Story generation is currently disabled by administrators. Please try again later.`,
        technicalMessage: error.message,
        recoveryActions: [
          'Check back in a few minutes',
          'Contact support for more information',
          'Your analysis data is safely preserved'
        ],
        severity: 'high',
        isRetryable: false
      };
    }

    return {
      userMessage: `We encountered an issue while creating your story. The system is working to resolve this automatically.`,
      technicalMessage: error.message,
      recoveryActions: [
        'The system will automatically retry',
        'Your analysis data is safe',
        'Try regenerating if the issue persists'
      ],
      severity: 'medium',
      isRetryable: true,
      estimatedRecoveryTime: '2-5 minutes'
    };
  }

  // Database errors
  if (category === ErrorCategory.DATABASE) {
    return {
      userMessage: `We're experiencing temporary database connectivity issues. Your story generation will resume automatically.`,
      technicalMessage: error.message,
      recoveryActions: [
        'The system will automatically retry once connectivity is restored',
        'Your data is safe and preserved',
        'No action needed from you'
      ],
      severity: 'high',
      isRetryable: true,
      estimatedRecoveryTime: '2-5 minutes'
    };
  }

  // Network errors
  if (category === ErrorCategory.NETWORK) {
    return {
      userMessage: `We're experiencing network connectivity issues. The system will automatically retry your story generation.`,
      technicalMessage: error.message,
      recoveryActions: [
        'The system will automatically retry',
        'Check your internet connection',
        'This usually resolves quickly'
      ],
      severity: 'medium',
      isRetryable: true,
      estimatedRecoveryTime: '1-3 minutes'
    };
  }

  // Authentication errors
  if (category === ErrorCategory.AUTHENTICATION) {
    return {
      userMessage: `There was an authentication issue. Please sign in again and try generating your story.`,
      technicalMessage: error.message,
      recoveryActions: [
        'Sign out and sign back in',
        'Clear your browser cache if the issue persists',
        'Contact support if you continue having problems'
      ],
      severity: 'medium',
      isRetryable: false
    };
  }

  // Validation errors
  if (category === ErrorCategory.VALIDATION) {
    if (errorMessage.includes('not found')) {
      return {
        userMessage: `The analysis data for this story could not be found. Please try generating a story from a different analysis.`,
        technicalMessage: error.message,
        recoveryActions: [
          'Go back to your analysis list',
          'Select a different analysis to create a story from',
          'Contact support if you believe this is an error'
        ],
        severity: 'medium',
        isRetryable: false
      };
    }

    return {
      userMessage: `There was an issue with the story generation request. Please check your input and try again.`,
      technicalMessage: error.message,
      recoveryActions: [
        'Verify your analysis data is complete',
        'Try refreshing the page and generating again',
        'Contact support if the issue persists'
      ],
      severity: 'low',
      isRetryable: false
    };
  }

  // Default fallback
  return {
    userMessage: attempt < totalAttempts 
      ? `We encountered an unexpected issue while generating your story. The system is automatically retrying (attempt ${attempt} of ${totalAttempts}).`
      : `We encountered an unexpected issue and have exhausted all retry attempts. Please try generating your story again.`,
    technicalMessage: error.message,
    recoveryActions: attempt < totalAttempts 
      ? [
          'The system will automatically retry',
          'No action needed from you',
          'Contact support if this continues'
        ]
      : [
          'Try generating the story again',
          'Check our status page for any ongoing issues',
          'Contact support with the error details if this persists'
        ],
    severity: 'medium',
    isRetryable: attempt < totalAttempts,
    estimatedRecoveryTime: attempt < totalAttempts ? '2-5 minutes' : undefined
  };
}

/**
 * Generate contextual help messages based on story generation status
 */
export function generateStoryStatusMessage(
  status: 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED',
  context: {
    attempt?: number;
    totalAttempts?: number;
    queuePosition?: number;
    estimatedWaitTime?: number;
    processingTime?: number;
    errorMessage?: string;
  }
): {
  message: string;
  helpText: string;
  actions: string[];
} {
  const { 
    attempt = 1, 
    totalAttempts = 3, 
    queuePosition, 
    estimatedWaitTime, 
    processingTime,
    errorMessage 
  } = context;

  switch (status) {
    case 'PENDING':
      return {
        message: 'Your story generation request has been received and is waiting to be processed.',
        helpText: queuePosition 
          ? `You are position ${queuePosition} in the queue with an estimated wait time of ${Math.ceil((estimatedWaitTime || 0) / 60)} minutes.`
          : 'Your request will be processed shortly.',
        actions: [
          'You can safely close this page - we\'ll preserve your progress',
          'Check back in a few minutes to see your story',
          'You\'ll be notified when generation is complete'
        ]
      };

    case 'GENERATING':
      const attemptText = attempt > 1 ? ` (attempt ${attempt} of ${totalAttempts})` : '';
      return {
        message: `Your story is being generated${attemptText}. This usually takes 1-3 minutes.`,
        helpText: 'Our AI is analyzing your data and crafting a personalized narrative story.',
        actions: [
          'Please wait while we generate your story',
          'The page will update automatically when complete',
          'You can safely navigate away and return later'
        ]
      };

    case 'COMPLETED':
      const timeText = processingTime ? ` in ${Math.ceil(processingTime / 1000)} seconds` : '';
      const retryText = attempt > 1 ? ` after ${attempt} attempts` : '';
      return {
        message: `Your story has been generated successfully${timeText}${retryText}!`,
        helpText: 'Your personalized narrative story is ready to read and share.',
        actions: [
          'Read your complete story below',
          'Share your story with others',
          'Generate a new story from different analysis data'
        ]
      };

    case 'FAILED':
      const finalAttempt = attempt >= totalAttempts;
      return {
        message: finalAttempt 
          ? `Story generation failed after ${totalAttempts} attempts. ${errorMessage || 'Please try again.'}`
          : `Story generation failed on attempt ${attempt} of ${totalAttempts}. The system will automatically retry.`,
        helpText: finalAttempt
          ? 'We were unable to generate your story despite multiple attempts. This is usually temporary.'
          : 'Don\'t worry - the system will automatically try again with different parameters.',
        actions: finalAttempt
          ? [
              'Click "Retry" to attempt story generation again',
              'Check our status page for any ongoing issues',
              'Contact support if this problem persists'
            ]
          : [
              'The system will automatically retry shortly',
              'No action needed from you',
              'You can manually retry if you prefer'
            ]
      };

    default:
      return {
        message: 'Story generation status unknown.',
        helpText: 'Please refresh the page to get the latest status.',
        actions: [
          'Refresh the page',
          'Contact support if issues persist'
        ]
      };
  }
}

/**
 * Generate recovery suggestions based on error patterns
 */
export function generateRecoverySuggestions(
  errorHistory: Array<{ error: string; timestamp: Date; category: ErrorCategory }>
): {
  suggestions: string[];
  priority: 'low' | 'medium' | 'high';
  escalate: boolean;
} {
  if (errorHistory.length === 0) {
    return {
      suggestions: ['No previous errors detected'],
      priority: 'low',
      escalate: false
    };
  }

  const recentErrors = errorHistory.filter(
    e => Date.now() - e.timestamp.getTime() < 30 * 60 * 1000 // Last 30 minutes
  );

  const errorCategories = new Set(recentErrors.map(e => e.category));
  const errorMessages = recentErrors.map(e => e.error.toLowerCase());

  // Multiple different error types - system issue
  if (errorCategories.size > 2) {
    return {
      suggestions: [
        'Multiple system components are experiencing issues',
        'This appears to be a broader system problem',
        'Our team has been automatically notified',
        'Please try again in 10-15 minutes',
        'Contact support if issues persist beyond 30 minutes'
      ],
      priority: 'high',
      escalate: true
    };
  }

  // Repeated AI service errors
  if (errorCategories.has(ErrorCategory.AI_SERVICE) && recentErrors.length > 2) {
    const hasRateLimit = errorMessages.some(msg => msg.includes('rate limit') || msg.includes('quota'));
    const hasTimeout = errorMessages.some(msg => msg.includes('timeout'));

    if (hasRateLimit) {
      return {
        suggestions: [
          'AI service usage limits are being reached frequently',
          'Consider upgrading to Pro for higher limits',
          'Try generating stories during off-peak hours',
          'Stories will be generated automatically once limits reset'
        ],
        priority: 'medium',
        escalate: false
      };
    }

    if (hasTimeout) {
      return {
        suggestions: [
          'AI service is responding slowly',
          'This is usually temporary and resolves quickly',
          'The system will automatically retry with optimized settings',
          'Consider simplifying your analysis data if this persists'
        ],
        priority: 'medium',
        escalate: false
      };
    }
  }

  // Database connectivity issues
  if (errorCategories.has(ErrorCategory.DATABASE) && recentErrors.length > 1) {
    return {
      suggestions: [
        'Database connectivity is experiencing intermittent issues',
        'Your data is safe and preserved',
        'The system will automatically retry once connectivity is restored',
        'This typically resolves within 5-10 minutes'
      ],
      priority: 'high',
      escalate: true
    };
  }

  // Parsing errors
  if (errorCategories.has(ErrorCategory.STORY_GENERATION)) {
    const hasParsingErrors = errorMessages.some(msg => 
      msg.includes('parsing') || msg.includes('malformed') || msg.includes('json')
    );

    if (hasParsingErrors) {
      return {
        suggestions: [
          'AI responses are having formatting issues',
          'The system will automatically use simplified prompts',
          'This usually resolves on the next attempt',
          'Your story content is being preserved during recovery'
        ],
        priority: 'medium',
        escalate: false
      };
    }
  }

  // Default suggestions
  return {
    suggestions: [
      'Intermittent issues detected with story generation',
      'The system is automatically handling recovery',
      'Most issues resolve within a few minutes',
      'Try again if problems persist beyond 10 minutes'
    ],
    priority: 'medium',
    escalate: recentErrors.length > 3
  };
}