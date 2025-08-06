"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Check, 
  Star, 
  Zap, 
  Shield, 
  Users, 
  ArrowRight,
  Crown,
  Sparkles
} from 'lucide-react';
import { 
  SubscriptionTier, 
  SubscriptionStatus,
  SubscriptionPlan,
  UserSubscription,
  UpgradeResponse,
  SubscriptionError,
  useSubscription
} from '@/hooks/useSubscription';
import { 
  SUBSCRIPTION_PLANS,
  compareSubscriptionTiers,
  getTierBadgeColor,
  calculateProratedAmount
} from '@/lib/subscription-utils';
import { PlanChangeConfirmation } from './PlanChangeConfirmation';
import { PlanChangeResult } from './PlanChangeResult';

interface PlanSelectorProps {
  currentSubscription?: UserSubscription;
  onCancel?: () => void;
  className?: string;
}

export function PlanSelector({
  currentSubscription,
  onCancel,
  className
}: PlanSelectorProps) {
  const { changePlan, isUpgrading, error } = useSubscription();
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [planChangeResult, setPlanChangeResult] = useState<UpgradeResponse | null>(null);
  const [planChangeError, setPlanChangeError] = useState<SubscriptionError | null>(null);

  const currentTier = currentSubscription?.tier || SubscriptionTier.FREE;
  const currentStatus = currentSubscription?.status || SubscriptionStatus.ACTIVE;
  const daysRemaining = currentSubscription 
    ? Math.max(0, Math.ceil((new Date(currentSubscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 30;

  const plans = Object.values(SUBSCRIPTION_PLANS);
  const isCurrentlyActive = currentStatus === SubscriptionStatus.ACTIVE;

  const handleSelectPlan = (tier: SubscriptionTier) => {
    if (tier === currentTier && isCurrentlyActive) return;
    
    setSelectedTier(tier);
    setShowConfirmation(true);
  };

  const handleConfirmPlanChange = async () => {
    if (!selectedTier) return;

    try {
      const result = await changePlan(selectedTier);
      setPlanChangeResult(result);
      setPlanChangeError(null);
      setShowConfirmation(false);
      setShowResult(true);
    } catch (err) {
      setPlanChangeError(err as SubscriptionError);
      setPlanChangeResult(null);
      setShowConfirmation(false);
      setShowResult(true);
    }
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    setSelectedTier(null);
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setPlanChangeResult(null);
    setPlanChangeError(null);
    setSelectedTier(null);
  };

  const handleRetryPlanChange = () => {
    setShowResult(false);
    if (selectedTier) {
      setShowConfirmation(true);
    }
  };

  const getPlanIcon = (tier: SubscriptionTier) => {
    switch (tier) {
      case SubscriptionTier.FREE:
        return <Zap className="w-6 h-6" />;
      case SubscriptionTier.PRO:
        return <Star className="w-6 h-6" />;
      case SubscriptionTier.ENTERPRISE:
        return <Crown className="w-6 h-6" />;
      default:
        return <Zap className="w-6 h-6" />;
    }
  };

  const getUpgradeText = (tier: SubscriptionTier) => {
    if (tier === currentTier && isCurrentlyActive) {
      return 'Current Plan';
    }

    const comparison = compareSubscriptionTiers(currentTier, tier);
    
    if (comparison.isUpgrade) {
      return 'Upgrade';
    } else if (comparison.isDowngrade) {
      return 'Downgrade';
    } else {
      return 'Select Plan';
    }
  };

  const getProrationInfo = (tier: SubscriptionTier) => {
    if (tier === currentTier || currentTier === SubscriptionTier.FREE) {
      return null;
    }

    const currentPlan = SUBSCRIPTION_PLANS[currentTier];
    const newPlan = SUBSCRIPTION_PLANS[tier];
    const proratedAmount = calculateProratedAmount(
      currentPlan.price,
      newPlan.price,
      daysRemaining
    );

    if (proratedAmount > 0) {
      return `+$${proratedAmount.toFixed(2)} prorated`;
    } else if (proratedAmount < 0) {
      return `$${Math.abs(proratedAmount).toFixed(2)} credit`;
    }
    
    return null;
  };

  return (
    <div className={cn("w-full max-w-6xl mx-auto", className)}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          Choose Your Plan
        </h2>
        <p className="text-white/70 text-lg max-w-2xl mx-auto">
          Select the perfect plan for your needs. Upgrade or downgrade anytime.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-1">
          <button
            onClick={() => setBillingInterval('month')}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-all",
              billingInterval === 'month'
                ? "bg-purple-600 text-white shadow-lg"
                : "text-white/70 hover:text-white"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval('year')}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-all relative",
              billingInterval === 'year'
                ? "bg-purple-600 text-white shadow-lg"
                : "text-white/70 hover:text-white"
            )}
          >
            Yearly
            <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1 py-0">
              Save 20%
            </Badge>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => {
          const isCurrentPlan = plan.tier === currentTier && isCurrentlyActive;
          const comparison = compareSubscriptionTiers(currentTier, plan.tier);
          const tierColor = getTierBadgeColor(plan.tier);
          const prorationInfo = getProrationInfo(plan.tier);
          const isPopular = plan.tier === SubscriptionTier.PRO;

          return (
            <Card
              key={plan.tier}
              variant={isCurrentPlan ? "gradient" : "glass"}
              className={cn(
                "relative transition-all duration-300",
                isPopular && "ring-2 ring-purple-500/50",
                !isCurrentPlan && "hover:scale-105 cursor-pointer"
              )}
              onClick={() => !isCurrentPlan && setSelectedTier(plan.tier)}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-green-500 text-white px-3 py-1">
                    <Check className="w-3 h-3 mr-1" />
                    Current
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  <div className={cn(
                    "p-3 rounded-full",
                    tierColor === 'gray' && "bg-gray-500/20",
                    tierColor === 'blue' && "bg-blue-500/20",
                    tierColor === 'purple' && "bg-purple-500/20"
                  )}>
                    {getPlanIcon(plan.tier)}
                  </div>
                </div>
                
                <CardTitle className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </CardTitle>
                
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-1">
                    {plan.price === 0 ? (
                      'Free'
                    ) : (
                      <>
                        <span className="text-2xl">$</span>
                        {billingInterval === 'year' 
                          ? Math.round(plan.price * 12 * 0.8) 
                          : plan.price
                        }
                      </>
                    )}
                  </div>
                  
                  {plan.price > 0 && (
                    <div className="text-white/60 text-sm">
                      per {billingInterval}
                      {billingInterval === 'year' && (
                        <span className="text-green-400 ml-1">(20% off)</span>
                      )}
                    </div>
                  )}

                  {prorationInfo && (
                    <div className="text-xs text-purple-300 mt-1">
                      {prorationInfo}
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features List */}
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-3"
                    >
                      <div className={cn(
                        "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5",
                        feature.included 
                          ? "bg-green-500/20 text-green-400" 
                          : "bg-gray-500/20 text-gray-500"
                      )}>
                        {feature.included ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <div className="w-2 h-2 bg-gray-500 rounded-full" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className={cn(
                          "text-sm font-medium",
                          feature.included ? "text-white" : "text-gray-400"
                        )}>
                          {feature.name}
                        </div>
                        <div className={cn(
                          "text-xs mt-1",
                          feature.included ? "text-white/60" : "text-gray-500"
                        )}>
                          {feature.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  <Button
                    onClick={() => handleSelectPlan(plan.tier)}
                    disabled={isCurrentPlan || isUpgrading}
                    variant={isCurrentPlan ? "outline" : "primary"}
                    className="w-full"
                    loading={isUpgrading && selectedTier === plan.tier}
                  >
                    {isCurrentPlan ? (
                      "Current Plan"
                    ) : (
                      <>
                        {getUpgradeText(plan.tier)}
                        {!isCurrentPlan && <ArrowRight className="w-4 h-4 ml-2" />}
                      </>
                    )}
                  </Button>
                </div>

                {/* Feature Changes Preview */}
                {selectedTier === plan.tier && plan.tier !== currentTier && (
                  <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                    <h4 className="text-sm font-medium text-white mb-2">
                      Changes from your current plan:
                    </h4>
                    <div className="space-y-1">
                      {comparison.featureChanges.slice(0, 3).map((change, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            change.changeType === 'added' && "bg-green-400",
                            change.changeType === 'increased' && "bg-blue-400",
                            change.changeType === 'removed' && "bg-red-400",
                            change.changeType === 'decreased' && "bg-yellow-400"
                          )} />
                          <span className="text-white/70">
                            {change.feature}: {String(change.newValue)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Cancel Button */}
      {onCancel && (
        <div className="text-center">
          <Button
            onClick={onCancel}
            variant="ghost"
            className="text-white/60 hover:text-white"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Plan Change Confirmation Dialog */}
      {showConfirmation && selectedTier && (
        <PlanChangeConfirmation
          isOpen={showConfirmation}
          onClose={handleCloseConfirmation}
          onConfirm={handleConfirmPlanChange}
          currentSubscription={currentSubscription}
          currentPlan={SUBSCRIPTION_PLANS[currentTier]}
          newPlan={SUBSCRIPTION_PLANS[selectedTier]}
          isLoading={isUpgrading}
          daysRemaining={daysRemaining}
        />
      )}

      {/* Plan Change Result Dialog */}
      {showResult && (
        <PlanChangeResult
          isOpen={showResult}
          onClose={handleCloseResult}
          onRetry={planChangeError ? handleRetryPlanChange : undefined}
          success={!!planChangeResult}
          result={planChangeResult || undefined}
          error={planChangeError || undefined}
          newPlan={selectedTier ? SUBSCRIPTION_PLANS[selectedTier] : undefined}
          previousPlan={SUBSCRIPTION_PLANS[currentTier]}
        />
      )}
    </div>
  );
}