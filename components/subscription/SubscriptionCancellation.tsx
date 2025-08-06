"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { 
  Calendar, 
  CreditCard,
  ArrowLeft,
  MessageSquare,
  Shield,
  Clock,
  Zap
} from 'lucide-react';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import XCircle from 'lucide-react/dist/esm/icons/x-circle';
import { 
  SubscriptionTier, 
  SubscriptionStatus,
  UserSubscription,
  UsageMetrics
} from '@/lib/types';
import { 
  SUBSCRIPTION_PLANS 
} from '@/lib/subscription-utils';
import {
  calculateBillingCycle,
  formatSubscriptionStatus
} from '@/lib/subscription-utils';

interface CancellationReason {
  id: string;
  label: string;
  description: string;
}

const CANCELLATION_REASONS: CancellationReason[] = [
  {
    id: 'too_expensive',
    label: 'Too expensive',
    description: 'The subscription cost is higher than expected'
  },
  {
    id: 'not_using',
    label: 'Not using enough',
    description: 'I\'m not getting enough value from the features'
  },
  {
    id: 'missing_features',
    label: 'Missing features',
    description: 'The product doesn\'t have features I need'
  },
  {
    id: 'technical_issues',
    label: 'Technical issues',
    description: 'Experiencing bugs or performance problems'
  },
  {
    id: 'switching_service',
    label: 'Switching to another service',
    description: 'Found a better alternative'
  },
  {
    id: 'temporary_pause',
    label: 'Temporary pause',
    description: 'Taking a break but may return later'
  },
  {
    id: 'other',
    label: 'Other',
    description: 'Different reason not listed above'
  }
];

interface SubscriptionCancellationProps {
  subscription: UserSubscription & { usage: UsageMetrics };
  onCancel: (immediate: boolean, reason: string, feedback: string) => Promise<void>;
  onGoBack?: () => void;
  loading?: boolean;
  className?: string;
}

export function SubscriptionCancellation({
  subscription,
  onCancel,
  onGoBack,
  loading = false,
  className
}: SubscriptionCancellationProps) {
  const [step, setStep] = useState<'confirm' | 'details' | 'processing'>('confirm');
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [feedback, setFeedback] = useState('');
  const [immediateCancel, setImmediateCancel] = useState(false);
  const [confirmUnderstanding, setConfirmUnderstanding] = useState(false);

  const plan = SUBSCRIPTION_PLANS[subscription.tier];
  const billingCycle = calculateBillingCycle(
    new Date(subscription.currentPeriodStart),
    new Date(subscription.currentPeriodEnd)
  );

  const handleConfirmCancel = () => {
    setStep('details');
  };

  const handleSubmitCancellation = async () => {
    if (!selectedReason || !confirmUnderstanding) return;
    
    setStep('processing');
    
    try {
      await onCancel(immediateCancel, selectedReason, feedback);
    } catch (error) {
      setStep('details');
      // Error handling would be done by parent component
    }
  };

  const getImpactItems = () => {
    const items = [];
    
    items.push({
      icon: <Zap className="w-4 h-4" />,
      text: `Lose access to ${plan.limits.storiesPerMonth === -1 ? 'unlimited' : plan.limits.storiesPerMonth} stories per month`
    });

    if (plan.limits.prioritySupport) {
      items.push({
        icon: <Shield className="w-4 h-4" />,
        text: 'Lose priority customer support'
      });
    }

    if (plan.limits.advancedAnalytics) {
      items.push({
        icon: <CheckCircle className="w-4 h-4" />,
        text: 'Lose access to advanced analytics features'
      });
    }

    items.push({
      icon: <Calendar className="w-4 h-4" />,
      text: immediateCancel 
        ? 'Access ends immediately' 
        : `Access continues until ${billingCycle.end.toLocaleDateString()}`
    });

    return items;
  };

  if (step === 'processing') {
    return (
      <Card variant="glass" className={cn("w-full max-w-2xl mx-auto", className)}>
        <CardContent className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Processing Cancellation
          </h3>
          <p className="text-white/60">
            Please wait while we process your cancellation request...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (step === 'confirm') {
    return (
      <Card variant="glass" className={cn("w-full max-w-2xl mx-auto", className)}>
        <CardHeader>
          <div className="flex items-center gap-3">
            {onGoBack && (
              <Button
                onClick={onGoBack}
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <div>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                Cancel Subscription
              </CardTitle>
              <p className="text-white/60 mt-1">
                We're sorry to see you go. Let's review what this means.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Plan Info */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white">Current Plan</h3>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/20">
                  {plan.name}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-white">
                  ${plan.price}/{plan.interval}
                </div>
                <div className="text-sm text-white/60">
                  Next billing: {billingCycle.end.toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-white/60">Stories used:</span>
                <span className="text-white ml-2">
                  {subscription.usage?.storiesGenerated || 0} / {
                    (subscription.usage?.storiesLimit || 0) === Infinity 
                      ? 'Unlimited' 
                      : (subscription.usage?.storiesLimit || 0)
                  }
                </span>
              </div>
              <div>
                <span className="text-white/60">API calls:</span>
                <span className="text-white ml-2">
                  {subscription.usage?.apiCallsUsed || 0} / {
                    (subscription.usage?.apiCallsLimit || 0) === Infinity 
                      ? 'Unlimited' 
                      : (subscription.usage?.apiCallsLimit || 0)
                  }
                </span>
              </div>
            </div>
          </div>

          {/* What You'll Lose */}
          <div className="space-y-3">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-400" />
              What you'll lose access to:
            </h3>
            
            <div className="space-y-2">
              {getImpactItems().map((item, index) => (
                <div key={index} className="flex items-center gap-3 text-sm text-white/80">
                  <div className="text-red-400">
                    {item.icon}
                  </div>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cancellation Options */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Cancellation Options</h3>
            
            <div className="space-y-3">
              <div 
                className={cn(
                  "p-4 rounded-lg border cursor-pointer transition-colors",
                  !immediateCancel 
                    ? "bg-blue-500/10 border-blue-400/20" 
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                )}
                onClick={() => setImmediateCancel(false)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                    !immediateCancel ? "border-blue-400 bg-blue-400" : "border-white/30"
                  )}>
                    {!immediateCancel && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      Cancel at period end (Recommended)
                    </div>
                    <div className="text-sm text-white/60">
                      Keep access until {billingCycle.end.toLocaleDateString()}, no further charges
                    </div>
                  </div>
                </div>
              </div>

              <div 
                className={cn(
                  "p-4 rounded-lg border cursor-pointer transition-colors",
                  immediateCancel 
                    ? "bg-red-500/10 border-red-400/20" 
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                )}
                onClick={() => setImmediateCancel(true)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                    immediateCancel ? "border-red-400 bg-red-400" : "border-white/30"
                  )}>
                    {immediateCancel && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      Cancel immediately
                    </div>
                    <div className="text-sm text-white/60">
                      Lose access right away, no refund for remaining time
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <Button
              onClick={handleConfirmCancel}
              variant="destructive"
              className="flex-1"
            >
              Continue with Cancellation
            </Button>
            
            {onGoBack && (
              <Button
                onClick={onGoBack}
                variant="outline"
                className="flex-1"
              >
                Keep Subscription
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="glass" className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setStep('confirm')}
            variant="ghost"
            size="sm"
            className="text-white/60 hover:text-white p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Help us improve
            </CardTitle>
            <p className="text-white/60 mt-1">
              Your feedback helps us make CharismaAI better for everyone.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Reason Selection */}
        <div className="space-y-3">
          <h3 className="font-semibold text-white">
            What's the main reason for canceling? *
          </h3>
          
          <div className="space-y-2">
            {CANCELLATION_REASONS.map((reason) => (
              <div
                key={reason.id}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-colors",
                  selectedReason === reason.id
                    ? "bg-purple-500/10 border-purple-400/20"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                )}
                onClick={() => setSelectedReason(reason.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                    selectedReason === reason.id 
                      ? "border-purple-400 bg-purple-400" 
                      : "border-white/30"
                  )}>
                    {selectedReason === reason.id && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      {reason.label}
                    </div>
                    <div className="text-sm text-white/60">
                      {reason.description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Feedback */}
        <div className="space-y-3">
          <h3 className="font-semibold text-white">
            Additional feedback (optional)
          </h3>
          <Textarea
            placeholder="Tell us more about your experience or what we could do better..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 min-h-[100px]"
          />
        </div>

        {/* Confirmation Checkbox */}
        <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <Checkbox
            id="confirm-understanding"
            checked={confirmUnderstanding}
            onCheckedChange={(checked) => setConfirmUnderstanding(checked as boolean)}
            className="mt-1"
          />
          <label 
            htmlFor="confirm-understanding" 
            className="text-sm text-white cursor-pointer"
          >
            I understand that canceling my subscription will remove access to premium features
            {immediateCancel ? ' immediately' : ` on ${billingCycle.end.toLocaleDateString()}`}.
            {!immediateCancel && ' I will not be charged again.'}
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-white/10">
          <Button
            onClick={handleSubmitCancellation}
            disabled={!selectedReason || !confirmUnderstanding || loading}
            variant="destructive"
            className="flex-1"
            loading={loading}
          >
            {immediateCancel ? 'Cancel Now' : 'Cancel at Period End'}
          </Button>
          
          <Button
            onClick={() => setStep('confirm')}
            variant="outline"
            className="flex-1"
            disabled={loading}
          >
            Go Back
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}