'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  CreditCard, 
  Crown, 
  Shield, 
  Settings, 
  TrendingUp, 
  Users, 
  Zap
} from 'lucide-react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { themeConfig } from '@/lib/theme-config';
import { cn } from '@/lib/utils';
import { useSubscription } from '@/hooks/useSubscription';
import { 
  SubscriptionCard,
  PlanSelector,
  BillingHistory,
  SubscriptionCancellation
} from '@/components/subscription';



// Loading skeleton component
function SubscriptionPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="text-center space-y-4">
        <Skeleton className="h-6 w-32 mx-auto bg-white/10" />
        <Skeleton className="h-8 w-64 mx-auto bg-white/10" />
        <Skeleton className="h-4 w-96 mx-auto bg-white/10" />
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className={cn(
          themeConfig.colors.glass.background,
          themeConfig.colors.glass.border,
          "border"
        )}>
          <CardHeader>
            <Skeleton className="h-6 w-48 bg-white/10" />
            <Skeleton className="h-4 w-64 bg-white/10" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-16 w-full bg-white/10" />
            <Skeleton className="h-4 w-32 bg-white/10" />
            <Skeleton className="h-10 w-full bg-white/10" />
          </CardContent>
        </Card>

        <Card className={cn(
          themeConfig.colors.glass.background,
          themeConfig.colors.glass.border,
          "border"
        )}>
          <CardHeader>
            <Skeleton className="h-6 w-48 bg-white/10" />
            <Skeleton className="h-4 w-64 bg-white/10" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Skeleton className="h-4 w-full bg-white/10" />
              <Skeleton className="h-4 w-full bg-white/10" />
              <Skeleton className="h-4 w-full bg-white/10" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Error fallback component
function SubscriptionErrorFallback({ error, retry }: { error?: Error; retry: () => void }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <Card className={cn(
        "w-full max-w-md mx-auto",
        themeConfig.colors.glass.background,
        themeConfig.colors.glass.border,
        "border backdrop-blur-xl"
      )}>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <CardTitle className="text-white">Failed to Load Subscription</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-400 text-sm">
            {error?.message || 'Unable to load your subscription information. Please try again.'}
          </p>
          <Button
            onClick={retry}
            className={cn(
              "w-full",
              "bg-gradient-to-r",
              themeConfig.colors.gradients.button,
              "text-white font-medium",
              "hover:opacity-90 transition-all duration-300"
            )}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SubscriptionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showPlanSelector, setShowPlanSelector] = useState(false);
  const [showBillingHistory, setShowBillingHistory] = useState(false);
  const [showCancellation, setShowCancellation] = useState(false);
  
  // Use the subscription hook
  const {
    subscription,
    usage,
    isLoading,
    error,
    retry,
    changePlan,
    cancelSubscription,
    isUpgrading,
    isCanceling
  } = useSubscription();

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/subscription');
      return;
    }
  }, [status, router]);

  const handleShowPlanSelector = () => {
    setShowPlanSelector(true);
  };

  const handleClosePlanSelector = () => {
    setShowPlanSelector(false);
  };

  const handleShowBillingHistory = () => {
    setShowBillingHistory(true);
  };

  const handleCloseBillingHistory = () => {
    setShowBillingHistory(false);
  };

  const handleShowCancellation = () => {
    setShowCancellation(true);
  };

  const handleCloseCancellation = () => {
    setShowCancellation(false);
  };



  const handleCancelSubscription = async (immediate: boolean, reason: string, feedback: string) => {
    try {
      await cancelSubscription(immediate);
      setShowCancellation(false);
    } catch (error) {
      // Error handling is managed by the hook
      console.error('Cancellation failed:', error);
      throw error; // Re-throw to let the component handle it
    }
  };

  // Mock billing records for now - in real app this would come from API
  const mockBillingRecords = [
    {
      id: 'inv_1',
      date: new Date('2024-01-15'),
      description: 'CharismaAI Pro - Monthly Subscription',
      amount: 2999, // $29.99 in cents
      currency: 'usd',
      status: 'paid' as const,
      invoiceUrl: '#',
      paymentMethod: {
        type: 'card' as const,
        last4: '4242',
        brand: 'Visa'
      },
      period: {
        start: new Date('2024-01-15'),
        end: new Date('2024-02-15')
      }
    }
  ];

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <UnifiedLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  // Don't render anything while redirecting unauthenticated users
  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <UnifiedLayout>
      <ErrorBoundary fallback={SubscriptionErrorFallback}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <Badge className={cn("mb-4", themeConfig.colors.glass.background, themeConfig.colors.glass.border)}>
                <CreditCard className="w-4 h-4 mr-2" />
                Subscription Management
              </Badge>
              <h1 className={cn("text-3xl font-bold mb-2", themeConfig.typography.gradient)}>
                Manage Your Subscription
              </h1>
              <p className="text-gray-400 max-w-2xl mx-auto">
                View your current plan, monitor usage, and manage your subscription settings
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert className="mb-6 bg-red-500/10 border-red-500/20 text-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error.message}
                  <Button
                    variant="link"
                    size="sm"
                    onClick={retry}
                    className="ml-2 text-red-300 hover:text-red-200 p-0 h-auto"
                  >
                    Try again
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Loading State */}
            {isLoading && <SubscriptionPageSkeleton />}

            {/* Plan Selector Modal */}
            <Dialog open={showPlanSelector} onOpenChange={setShowPlanSelector}>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gray-900/95 backdrop-blur-xl border-white/20">
                <DialogHeader>
                  <DialogTitle className="text-white">Choose Your Plan</DialogTitle>
                </DialogHeader>
                <PlanSelector
                  currentSubscription={subscription?.subscription}
                  onCancel={handleClosePlanSelector}
                />
              </DialogContent>
            </Dialog>

            {/* Billing History Modal */}
            <Dialog open={showBillingHistory} onOpenChange={setShowBillingHistory}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900/95 backdrop-blur-xl border-white/20">
                <DialogHeader>
                  <DialogTitle className="text-white">Billing History</DialogTitle>
                </DialogHeader>
                <BillingHistory
                  records={mockBillingRecords}
                  onDownloadInvoice={(recordId) => {
                    console.log('Download invoice:', recordId);
                    // In real app, this would trigger invoice download
                  }}
                  onViewInvoice={(recordId) => {
                    console.log('View invoice:', recordId);
                    // In real app, this would open invoice in new tab
                  }}
                  loading={false}
                />
              </DialogContent>
            </Dialog>

            {/* Subscription Cancellation Modal */}
            <Dialog open={showCancellation} onOpenChange={setShowCancellation}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900/95 backdrop-blur-xl border-white/20">
                <DialogHeader>
                  <DialogTitle className="text-white">Cancel Subscription</DialogTitle>
                </DialogHeader>
                {subscription && usage && (
                  <SubscriptionCancellation
                    subscription={{
                      ...subscription.subscription,
                      usage: {
                        storiesGenerated: usage.usage?.stories?.used || 0,
                        storiesLimit: usage.usage?.stories?.unlimited ? Infinity : (usage.usage?.stories?.limit || 0),
                        apiCallsUsed: usage.usage?.apiCalls?.used || 0,
                        apiCallsLimit: usage.usage?.apiCalls?.unlimited ? Infinity : (usage.usage?.apiCalls?.limit || 0),
                        periodStart: usage.period?.start || new Date(),
                        periodEnd: usage.period?.end || new Date(),
                        filesProcessed: usage.usage?.files?.used || 0,
                        filesLimit: usage.usage?.files?.unlimited ? Infinity : (usage.usage?.files?.limit || 0),
                      }
                    }}
                    onCancel={handleCancelSubscription}
                    onGoBack={handleCloseCancellation}
                    loading={isCanceling}
                  />
                )}
              </DialogContent>
            </Dialog>

            {/* Subscription Content */}
            {!isLoading && !error && subscription && usage && (
              <div className="space-y-6">
                {/* Replace inline subscription overview with SubscriptionCard component */}
                <SubscriptionCard
                  subscription={{
                    ...subscription.subscription,
                    usage: {
                      storiesGenerated: usage.usage?.stories?.used || 0,
                      storiesLimit: usage.usage?.stories?.unlimited ? Infinity : (usage.usage?.stories?.limit || 0),
                      apiCallsUsed: usage.usage?.apiCalls?.used || 0,
                      apiCallsLimit: usage.usage?.apiCalls?.unlimited ? Infinity : (usage.usage?.apiCalls?.limit || 0),
                      periodStart: usage.period?.start || new Date(),
                      periodEnd: usage.period?.end || new Date(),
                      filesProcessed: usage.usage?.files?.used || 0,
                      filesLimit: usage.usage?.files?.unlimited ? Infinity : (usage.usage?.files?.limit || 0),
                    }
                  }}
                  onUpgrade={handleShowPlanSelector}
                  onManageBilling={handleShowBillingHistory}
                  onCancelSubscription={handleShowCancellation}
                  className="mx-auto"
                />

                {/* Quick Actions */}
                <Card className={cn(
                  themeConfig.colors.glass.background,
                  themeConfig.colors.glass.border,
                  themeConfig.colors.glass.shadow,
                  "border"
                )}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Zap className="h-5 w-5 text-yellow-400" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Common subscription management tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        variant="outline"
                        onClick={handleShowPlanSelector}
                        className="h-auto p-4 flex flex-col items-center gap-2 border-white/20 text-white hover:bg-white/10"
                      >
                        <Users className="w-6 h-6 text-blue-400" />
                        <div className="text-center">
                          <div className="font-medium">Compare Plans</div>
                          <div className="text-xs text-gray-400">See all available options</div>
                        </div>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={handleShowBillingHistory}
                        className="h-auto p-4 flex flex-col items-center gap-2 border-white/20 text-white hover:bg-white/10"
                      >
                        <Shield className="w-6 h-6 text-green-400" />
                        <div className="text-center">
                          <div className="font-medium">Billing History</div>
                          <div className="text-xs text-gray-400">View past invoices</div>
                        </div>
                      </Button>

                      <Button
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center gap-2 border-white/20 text-white hover:bg-white/10"
                      >
                        <Settings className="w-6 h-6 text-purple-400" />
                        <div className="text-center">
                          <div className="font-medium">Account Settings</div>
                          <div className="text-xs text-gray-400">Manage preferences</div>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && !subscription && (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Subscription Found</h3>
                <p className="text-gray-400 mb-6">
                  It looks like you don't have an active subscription yet.
                </p>
                <Button
                  onClick={handleShowPlanSelector}
                  className={cn(
                    "bg-gradient-to-r",
                    themeConfig.colors.gradients.button,
                    "text-white font-medium"
                  )}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Choose a Plan
                </Button>
              </div>
            )}
          </div>
        </div>
      </ErrorBoundary>
    </UnifiedLayout>
  );
}