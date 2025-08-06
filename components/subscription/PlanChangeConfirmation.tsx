"use client";

import React, { useState, useEffect } from 'react';
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
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { 
  ArrowRight, 
  Calendar, 
  CreditCard, 
  DollarSign, 
  Info,
  Clock
} from 'lucide-react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { 
  SubscriptionTier, 
  SubscriptionStatus,
  SubscriptionPlan,
  UserSubscription
} from '@/hooks/useSubscription';

interface PlanChangeConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  currentSubscription: UserSubscription | null;
  currentPlan: SubscriptionPlan;
  newPlan: SubscriptionPlan;
  isLoading?: boolean;
  daysRemaining?: number;
}

interface BillingImplication {
  type: 'immediate_charge' | 'prorated_credit' | 'next_billing' | 'immediate_change';
  amount?: number;
  description: string;
  effectiveDate: Date;
}

export function PlanChangeConfirmation({
  isOpen,
  onClose,
  onConfirm,
  currentSubscription,
  currentPlan,
  newPlan,
  isLoading = false,
  daysRemaining = 30
}: PlanChangeConfirmationProps) {
  const [billingImplications, setBillingImplications] = useState<BillingImplication[]>([]);
  const [isUpgrade, setIsUpgrade] = useState(false);
  const [isDowngrade, setIsDowngrade] = useState(false);

  useEffect(() => {
    if (!currentSubscription || !currentPlan || !newPlan) return;

    const implications: BillingImplication[] = [];
    const now = new Date();
    const periodEnd = new Date(currentSubscription.currentPeriodEnd);
    const isUpgradeChange = newPlan.price > currentPlan.price;
    const isDowngradeChange = newPlan.price < currentPlan.price;

    setIsUpgrade(isUpgradeChange);
    setIsDowngrade(isDowngradeChange);

    if (currentPlan.tier === SubscriptionTier.FREE) {
      // Upgrading from free
      implications.push({
        type: 'immediate_charge',
        amount: newPlan.price,
        description: `You'll be charged $${newPlan.price} immediately for your ${newPlan.name} plan.`,
        effectiveDate: now
      });
      
      implications.push({
        type: 'immediate_change',
        description: 'Your new plan features will be available immediately.',
        effectiveDate: now
      });
    } else if (newPlan.tier === SubscriptionTier.FREE) {
      // Downgrading to free
      implications.push({
        type: 'immediate_change',
        description: 'Your subscription will be canceled and you\'ll switch to the free plan immediately.',
        effectiveDate: now
      });
      
      if (daysRemaining > 0) {
        implications.push({
          type: 'prorated_credit',
          amount: calculateProratedAmount(currentPlan.price, 0, daysRemaining),
          description: `You'll receive a prorated credit of $${calculateProratedAmount(currentPlan.price, 0, daysRemaining).toFixed(2)} for the unused portion of your current billing period.`,
          effectiveDate: now
        });
      }
    } else if (isUpgradeChange) {
      // Upgrading to higher tier
      const proratedAmount = calculateProratedAmount(currentPlan.price, newPlan.price, daysRemaining);
      
      implications.push({
        type: 'immediate_charge',
        amount: proratedAmount,
        description: `You'll be charged $${proratedAmount.toFixed(2)} immediately for the prorated difference.`,
        effectiveDate: now
      });
      
      implications.push({
        type: 'immediate_change',
        description: 'Your new plan features will be available immediately.',
        effectiveDate: now
      });
      
      implications.push({
        type: 'next_billing',
        amount: newPlan.price,
        description: `Starting ${periodEnd.toLocaleDateString()}, you'll be billed $${newPlan.price} monthly for your ${newPlan.name} plan.`,
        effectiveDate: periodEnd
      });
    } else if (isDowngradeChange) {
      // Downgrading to lower tier
      implications.push({
        type: 'next_billing',
        amount: newPlan.price,
        description: `Your plan will change to ${newPlan.name} at the end of your current billing period (${periodEnd.toLocaleDateString()}).`,
        effectiveDate: periodEnd
      });
      
      implications.push({
        type: 'immediate_change',
        description: 'You\'ll continue to have access to your current plan features until the end of your billing period.',
        effectiveDate: periodEnd
      });
    }

    setBillingImplications(implications);
  }, [currentSubscription, currentPlan, newPlan, daysRemaining]);

  const calculateProratedAmount = (currentPrice: number, newPrice: number, daysLeft: number): number => {
    const dailyCurrentRate = currentPrice / 30;
    const dailyNewRate = newPrice / 30;
    const proratedDifference = (dailyNewRate - dailyCurrentRate) * daysLeft;
    return Math.max(0, proratedDifference);
  };

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

  const getChangeTypeIcon = () => {
    if (isUpgrade) return <ArrowRight className="w-4 h-4 text-green-400" />;
    if (isDowngrade) return <ArrowRight className="w-4 h-4 text-yellow-400" />;
    return <ArrowRight className="w-4 h-4 text-blue-400" />;
  };

  const getChangeTypeText = () => {
    if (isUpgrade) return 'Upgrade Plan';
    if (isDowngrade) return 'Downgrade Plan';
    return 'Change Plan';
  };

  const getImplicationIcon = (type: BillingImplication['type']) => {
    switch (type) {
      case 'immediate_charge':
        return <CreditCard className="w-4 h-4 text-red-400" />;
      case 'prorated_credit':
        return <DollarSign className="w-4 h-4 text-green-400" />;
      case 'next_billing':
        return <Calendar className="w-4 h-4 text-blue-400" />;
      case 'immediate_change':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      default:
        return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  if (!currentPlan || !newPlan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900/95 backdrop-blur-xl border border-white/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            {getChangeTypeIcon()}
            {getChangeTypeText()}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Review the changes and billing implications before confirming your plan change.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Comparison */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Plan Change Summary</h3>
            
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-3">
                <Badge className={cn("text-sm", getTierBadgeColor(currentPlan.tier))}>
                  {currentPlan.name}
                </Badge>
                <span className="text-white/70">
                  ${currentPlan.price === 0 ? 'Free' : `${currentPlan.price}/month`}
                </span>
              </div>
              
              <ArrowRight className="w-5 h-5 text-gray-400" />
              
              <div className="flex items-center gap-3">
                <Badge className={cn("text-sm", getTierBadgeColor(newPlan.tier))}>
                  {newPlan.name}
                </Badge>
                <span className="text-white/70">
                  ${newPlan.price === 0 ? 'Free' : `${newPlan.price}/month`}
                </span>
              </div>
            </div>
          </div>

          {/* Billing Implications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Billing & Timeline</h3>
            
            <div className="space-y-3">
              {billingImplications.map((implication, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getImplicationIcon(implication.type)}
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-white text-sm">
                      {implication.description}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>
                        Effective: {implication.effectiveDate.toLocaleDateString()} at{' '}
                        {implication.effectiveDate.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                  
                  {implication.amount !== undefined && (
                    <div className="text-right">
                      <span className={cn(
                        "text-sm font-medium",
                        implication.type === 'immediate_charge' && "text-red-400",
                        implication.type === 'prorated_credit' && "text-green-400",
                        implication.type === 'next_billing' && "text-blue-400"
                      )}>
                        {implication.type === 'prorated_credit' ? '+' : ''}
                        ${implication.amount.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Feature Changes Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Feature Changes</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white/80">You'll gain access to:</h4>
                <div className="space-y-1">
                  {newPlan.features
                    .filter(feature => 
                      feature.included && 
                      !currentPlan.features.some(cf => cf.name === feature.name && cf.included)
                    )
                    .slice(0, 3)
                    .map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-green-300">
                        <CheckCircle className="w-3 h-3" />
                        <span>{feature.name}</span>
                      </div>
                    ))}
                </div>
              </div>
              
              {isDowngrade && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-white/80">You'll lose access to:</h4>
                  <div className="space-y-1">
                    {currentPlan.features
                      .filter(feature => 
                        feature.included && 
                        !newPlan.features.some(nf => nf.name === feature.name && nf.included)
                      )
                      .slice(0, 3)
                      .map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-red-300">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{feature.name}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Important Notes */}
          {isDowngrade && (
            <Alert className="bg-yellow-500/10 border-yellow-500/20 text-yellow-200">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> When downgrading, you'll retain access to your current plan features 
                until the end of your billing period. After that, some features may become unavailable.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Separator className="bg-white/10" />

        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "min-w-[120px]",
              isUpgrade && "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700",
              isDowngrade && "bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700",
              !isUpgrade && !isDowngrade && "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            )}
            loading={isLoading}
          >
            {isLoading ? 'Processing...' : `Confirm ${getChangeTypeText()}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}