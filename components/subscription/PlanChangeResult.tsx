"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { 
  ArrowRight, 
  Calendar,
  CreditCard,
  RefreshCw,
  X
} from 'lucide-react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { 
  SubscriptionTier,
  SubscriptionPlan,
  UpgradeResponse,
  SubscriptionError
} from '@/hooks/useSubscription';

interface PlanChangeResultProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry?: () => void;
  success?: boolean;
  result?: UpgradeResponse;
  error?: SubscriptionError;
  newPlan?: SubscriptionPlan;
  previousPlan?: SubscriptionPlan;
}

export function PlanChangeResult({
  isOpen,
  onClose,
  onRetry,
  success = false,
  result,
  error,
  newPlan,
  previousPlan
}: PlanChangeResultProps) {
  const getTierBadgeColor = (tier: SubscriptionTier) => {
    switch (tier) {
      case SubscriptionTier.FREE:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/20';
      case SubscriptionTier.PRO:
        return 'bg-blue-500/20 text-blue-300 border-blue-400/20';
      case SubscriptionTier.ENTERPRISE:
        return 'bg-purple-500/20 text-purple-300 border-purple-400/20';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/20';
    }
  };

  const getChangeTypeText = () => {
    if (!result?.previousPlan || !result?.newPlan) return 'Plan Change';
    
    if (result.newPlan.price > result.previousPlan.price) {
      return 'Plan Upgraded';
    } else if (result.newPlan.price < result.previousPlan.price) {
      return 'Plan Downgraded';
    }
    return 'Plan Changed';
  };

  const isRetryable = error?.details?.retryable || error?.code === 'NETWORK_ERROR';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-gray-900/95 backdrop-blur-xl border border-white/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            {success ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-400" />
                {getChangeTypeText()} Successfully
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Plan Change Failed
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {success 
              ? 'Your subscription plan has been updated.'
              : 'There was an issue processing your plan change.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {success && result ? (
            <>
              {/* Success Content */}
              <div className="space-y-4">
                {/* Plan Change Summary */}
                <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-3">
                    <Badge className={cn("text-sm", getTierBadgeColor(result.previousPlan.tier))}>
                      {result.previousPlan.name}
                    </Badge>
                  </div>
                  
                  <ArrowRight className="w-5 h-5 text-green-400" />
                  
                  <div className="flex items-center gap-3">
                    <Badge className={cn("text-sm", getTierBadgeColor(result.newPlan.tier))}>
                      {result.newPlan.name}
                    </Badge>
                  </div>
                </div>

                {/* Success Message */}
                <Alert className="bg-green-500/10 border-green-500/20 text-green-200">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    {result.message || `Successfully changed to ${result.newPlan.name} plan.`}
                  </AlertDescription>
                </Alert>

                {/* Subscription Details */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">Updated Subscription</h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-400">
                      <span>Plan:</span>
                      <span className="text-white">{result.newPlan.name}</span>
                    </div>
                    
                    <div className="flex justify-between text-gray-400">
                      <span>Status:</span>
                      <span className="text-green-400 capitalize">
                        {result.subscription.status.toLowerCase()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-gray-400">
                      <span>Current Period:</span>
                      <span className="text-white">
                        {new Date(result.subscription.currentPeriodStart).toLocaleDateString()} - {' '}
                        {new Date(result.subscription.currentPeriodEnd).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-gray-400">
                      <span>Monthly Price:</span>
                      <span className="text-white">
                        ${result.newPlan.price === 0 ? 'Free' : `${result.newPlan.price}/month`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="text-white font-medium mb-1">What's Next?</h4>
                      <p className="text-blue-200 text-sm">
                        Your new plan features are now active. You can start using them immediately.
                        Your next billing date is {new Date(result.subscription.currentPeriodEnd).toLocaleDateString()}.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Error Content */}
              <div className="space-y-4">
                {/* Error Message */}
                <Alert className="bg-red-500/10 border-red-500/20 text-red-200">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Error:</strong> {error?.message || 'An unexpected error occurred while processing your plan change.'}
                  </AlertDescription>
                </Alert>

                {/* Error Details */}
                {error?.details && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white">Error Details</h3>
                    
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="space-y-2 text-sm">
                        {error.code && (
                          <div className="flex justify-between text-gray-400">
                            <span>Error Code:</span>
                            <span className="text-red-400 font-mono">{error.code}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between text-gray-400">
                          <span>Retryable:</span>
                          <span className={cn(
                            "font-medium",
                            isRetryable ? "text-green-400" : "text-red-400"
                          )}>
                            {isRetryable ? 'Yes' : 'No'}
                          </span>
                        </div>
                        
                        {error.details.nextAction && (
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <p className="text-white text-sm">
                              <strong>Recommended Action:</strong> {error.details.nextAction}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Troubleshooting */}
                <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div>
                      <h4 className="text-white font-medium mb-1">Troubleshooting</h4>
                      <ul className="text-yellow-200 text-sm space-y-1">
                        <li>• Check your internet connection and try again</li>
                        <li>• Ensure your payment method is valid and up to date</li>
                        <li>• Contact support if the problem persists</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex gap-3">
          {!success && isRetryable && onRetry && (
            <Button
              variant="outline"
              onClick={onRetry}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
          
          <Button
            onClick={onClose}
            variant={success ? "primary" : "outline"}
            className={cn(
              success && "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700",
              !success && "border-white/20 text-white hover:bg-white/10"
            )}
          >
            {success ? 'Continue' : 'Close'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}