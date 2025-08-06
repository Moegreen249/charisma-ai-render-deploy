"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Calendar, CreditCard, FileText, Zap, Clock } from "lucide-react";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import { 
  SubscriptionTier, 
  SubscriptionStatus, 
  UserSubscription,
  UsageMetrics,
  SubscriptionPlan
} from '@/lib/types';
import { 
  SUBSCRIPTION_PLANS 
} from '@/lib/subscription-utils';
import {
  calculateUsagePercentage,
  formatUsageText,
  formatSubscriptionStatus,
  getSubscriptionStatusColor,
  getTierBadgeColor,
  getRenewalReminderText,
  calculateBillingCycle
} from '@/lib/subscription-utils';

interface SubscriptionCardProps {
  subscription: UserSubscription & { usage: UsageMetrics };
  onUpgrade?: () => void;
  onManageBilling?: () => void;
  onCancelSubscription?: () => void;
  className?: string;
}

export function SubscriptionCard({
  subscription,
  onUpgrade,
  onManageBilling,
  onCancelSubscription,
  className
}: SubscriptionCardProps) {
  const plan = SUBSCRIPTION_PLANS[subscription.tier];
  const billingCycle = calculateBillingCycle(
    new Date(subscription.currentPeriodStart),
    new Date(subscription.currentPeriodEnd)
  );

  const statusColor = getSubscriptionStatusColor(subscription.status);
  const tierColor = getTierBadgeColor(subscription.tier);

  const storiesUsagePercentage = calculateUsagePercentage(
    subscription.usage?.storiesGenerated || 0,
    subscription.usage?.storiesLimit || 0
  );

  const apiUsagePercentage = calculateUsagePercentage(
    subscription.usage?.apiCallsUsed || 0,
    subscription.usage?.apiCallsLimit || 0
  );

  const isExpiringSoon = billingCycle.daysRemaining <= 7 && billingCycle.daysRemaining > 0;
  const isExpired = billingCycle.isExpired;

  return (
    <Card 
      variant="glass" 
      className={cn("w-full max-w-2xl", className)}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-xl font-bold text-white">
              Current Plan
            </CardTitle>
            <Badge 
              className={cn(
                "text-xs font-medium",
                tierColor === 'gray' && "bg-gray-500/20 text-gray-300 border-gray-400/20",
                tierColor === 'blue' && "bg-blue-500/20 text-blue-300 border-blue-400/20",
                tierColor === 'purple' && "bg-purple-500/20 text-purple-300 border-purple-400/20"
              )}
            >
              {plan.name}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              className={cn(
                "text-xs",
                statusColor === 'green' && "bg-green-500/20 text-green-300 border-green-400/20",
                statusColor === 'yellow' && "bg-yellow-500/20 text-yellow-300 border-yellow-400/20",
                statusColor === 'red' && "bg-red-500/20 text-red-300 border-red-400/20",
                statusColor === 'gray' && "bg-gray-500/20 text-gray-300 border-gray-400/20"
              )}
            >
              {subscription.status === SubscriptionStatus.ACTIVE && <CheckCircle className="w-3 h-3 mr-1" />}
              {subscription.status === SubscriptionStatus.PAST_DUE && <AlertTriangle className="w-3 h-3 mr-1" />}
              {subscription.status === SubscriptionStatus.CANCELED && <Clock className="w-3 h-3 mr-1" />}
              {formatSubscriptionStatus(subscription.status)}
            </Badge>
          </div>
        </div>

        {/* Billing Information */}
        <div className="flex items-center gap-4 text-sm text-white/70 mt-2">
          <div className="flex items-center gap-1">
            <CreditCard className="w-4 h-4" />
            <span>
              {plan.price === 0 ? 'Free' : `$${plan.price}/${plan.interval}`}
            </span>
          </div>
          
          {!isExpired && (
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>
                {getRenewalReminderText(billingCycle.daysRemaining)}
              </span>
            </div>
          )}
        </div>

        {/* Expiration Warning */}
        {(isExpiringSoon || isExpired) && (
          <div className={cn(
            "flex items-center gap-2 p-3 rounded-lg mt-3",
            isExpired 
              ? "bg-red-500/10 border border-red-500/20 text-red-300"
              : "bg-yellow-500/10 border border-yellow-500/20 text-yellow-300"
          )}>
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">
              {isExpired 
                ? "Your subscription has expired. Renew to continue using premium features."
                : `Your subscription expires in ${billingCycle.daysRemaining} day${billingCycle.daysRemaining === 1 ? '' : 's'}.`
              }
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Usage Metrics */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Usage This Month
          </h3>

          {/* Stories Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-white/80">
                <FileText className="w-4 h-4" />
                <span>Stories Generated</span>
              </div>
              <span className="text-white font-medium">
                {formatUsageText(
                  subscription.usage?.storiesGenerated || 0,
                  subscription.usage?.storiesLimit || 0
                )}
              </span>
            </div>
            
            {(subscription.usage?.storiesLimit || 0) !== Infinity && (
              <Progress 
                value={storiesUsagePercentage} 
                className={cn(
                  "h-2",
                  storiesUsagePercentage >= 90 && "bg-red-500/20",
                  storiesUsagePercentage >= 80 && storiesUsagePercentage < 90 && "bg-yellow-500/20",
                  storiesUsagePercentage < 80 && "bg-green-500/20"
                )}
              />
            )}
          </div>

          {/* API Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-white/80">
                <Zap className="w-4 h-4" />
                <span>API Calls</span>
              </div>
              <span className="text-white font-medium">
                {formatUsageText(
                  subscription.usage?.apiCallsUsed || 0,
                  subscription.usage?.apiCallsLimit || 0
                )}
              </span>
            </div>
            
            {(subscription.usage?.apiCallsLimit || 0) !== Infinity && (
              <Progress 
                value={apiUsagePercentage} 
                className={cn(
                  "h-2",
                  apiUsagePercentage >= 90 && "bg-red-500/20",
                  apiUsagePercentage >= 80 && apiUsagePercentage < 90 && "bg-yellow-500/20",
                  apiUsagePercentage < 80 && "bg-green-500/20"
                )}
              />
            )}
          </div>
        </div>

        {/* Plan Features */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Plan Features</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {plan.features.map((feature, index) => (
              <div 
                key={index}
                className={cn(
                  "flex items-center gap-2 text-sm p-2 rounded-lg",
                  feature.included 
                    ? "text-green-300 bg-green-500/10" 
                    : "text-gray-400 bg-gray-500/10"
                )}
              >
                {feature.included ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-gray-500" />
                )}
                <span>
                  {feature.name}
                  {feature.limit && feature.included && (
                    <span className="text-white/60 ml-1">
                      ({feature.limit === -1 ? 'Unlimited' : feature.limit})
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
          {subscription.tier === SubscriptionTier.FREE && onUpgrade && (
            <Button 
              onClick={onUpgrade}
              variant="primary"
              className="flex-1"
            >
              Upgrade Plan
            </Button>
          )}
          
          {subscription.tier !== SubscriptionTier.FREE && onUpgrade && (
            <Button 
              onClick={onUpgrade}
              variant="secondary"
              className="flex-1"
            >
              Change Plan
            </Button>
          )}

          {subscription.tier !== SubscriptionTier.FREE && onManageBilling && (
            <Button 
              onClick={onManageBilling}
              variant="outline"
              className="flex-1"
            >
              Manage Billing
            </Button>
          )}

          {subscription.tier !== SubscriptionTier.FREE && 
           subscription.status === SubscriptionStatus.ACTIVE && 
           !subscription.cancelAtPeriodEnd && 
           onCancelSubscription && (
            <Button 
              onClick={onCancelSubscription}
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              Cancel Subscription
            </Button>
          )}

          {subscription.cancelAtPeriodEnd && (
            <div className="text-center text-sm text-yellow-300 bg-yellow-500/10 p-2 rounded-lg">
              Subscription will cancel on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}