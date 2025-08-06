"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreditCard, Calendar, TrendingUp, Users, Download, RefreshCw, Trash2, Clock, DollarSign, Activity, FileText, Zap,  } from "lucide-react";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import Edit from "lucide-react/dist/esm/icons/edit";
import { motion } from "framer-motion";
import { SubscriptionTier, SubscriptionStatus } from "@/lib/types";

interface UserSubscriptionData {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
  subscription: {
    id: string;
    tier: SubscriptionTier;
    status: SubscriptionStatus;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    usage: any;
  } | null;
  usage: {
    current: any;
    historical: any;
    breakdown: any;
    limits: any;
  } | null;
  billingHistory: any[];
  activity: {
    storiesCount: number;
    analysesCount: number;
    jobsCount: number;
  };
}

interface UserSubscriptionPanelProps {
  userId: string;
  userName: string;
  onClose: () => void;
}

export function UserSubscriptionPanel({ 
  userId, 
  userName, 
  onClose 
}: UserSubscriptionPanelProps) {
  const [data, setData] = useState<UserSubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Form state for editing subscription
  const [editForm, setEditForm] = useState({
    tier: SubscriptionTier.FREE,
    status: SubscriptionStatus.ACTIVE,
    stripeCustomerId: '',
    stripeSubscriptionId: '',
    currentPeriodStart: '',
    currentPeriodEnd: '',
    cancelAtPeriodEnd: false,
  });

  const showMessage = (type: 'success' | 'error', text: string) => {
    if (type === 'success') {
      setSuccess(text);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(text);
      setTimeout(() => setError(null), 3000);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [subscriptionRes, usageRes] = await Promise.all([
        fetch(`/api/admin/users/${userId}/subscription`),
        fetch(`/api/admin/users/${userId}/usage`)
      ]);

      if (!subscriptionRes.ok || !usageRes.ok) {
        throw new Error('Failed to load subscription data');
      }

      const [subscriptionData, usageData] = await Promise.all([
        subscriptionRes.json(),
        usageRes.json()
      ]);

      const combinedData = {
        ...subscriptionData,
        usage: usageData.usage,
      };

      setData(combinedData);

      // Initialize edit form
      if (combinedData.subscription) {
        setEditForm({
          tier: combinedData.subscription.tier,
          status: combinedData.subscription.status,
          stripeCustomerId: combinedData.subscription.stripeCustomerId || '',
          stripeSubscriptionId: combinedData.subscription.stripeSubscriptionId || '',
          currentPeriodStart: combinedData.subscription.currentPeriodStart.split('T')[0],
          currentPeriodEnd: combinedData.subscription.currentPeriodEnd.split('T')[0],
          cancelAtPeriodEnd: combinedData.subscription.cancelAtPeriodEnd,
        });
      }

    } catch (err) {
      console.error('Error loading subscription data:', err);
      setError('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const updateSubscription = async () => {
    try {
      setSaving(true);
      
      const response = await fetch(`/api/admin/users/${userId}/subscription`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }

      showMessage('success', 'Subscription updated successfully');
      setEditMode(false);
      await loadData();

    } catch (err) {
      console.error('Error updating subscription:', err);
      showMessage('error', 'Failed to update subscription');
    } finally {
      setSaving(false);
    }
  };

  const cancelSubscription = async (immediate: boolean) => {
    try {
      setSaving(true);
      
      const response = await fetch(
        `/api/admin/users/${userId}/subscription?immediate=${immediate}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      showMessage('success', immediate 
        ? 'Subscription canceled immediately' 
        : 'Subscription set to cancel at period end'
      );
      setShowCancelDialog(false);
      await loadData();

    } catch (err) {
      console.error('Error canceling subscription:', err);
      showMessage('error', 'Failed to cancel subscription');
    } finally {
      setSaving(false);
    }
  };

  const resetUsage = async (resetType: 'current_period' | 'all') => {
    if (!confirm(`Are you sure you want to reset ${resetType === 'all' ? 'all' : 'current period'} usage?`)) {
      return;
    }

    try {
      setSaving(true);
      
      const response = await fetch(`/api/admin/users/${userId}/usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resetType }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset usage');
      }

      showMessage('success', 'Usage metrics reset successfully');
      await loadData();

    } catch (err) {
      console.error('Error resetting usage:', err);
      showMessage('error', 'Failed to reset usage');
    } finally {
      setSaving(false);
    }
  };

  const getTierBadgeColor = (tier: SubscriptionTier) => {
    switch (tier) {
      case SubscriptionTier.ENTERPRISE:
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case SubscriptionTier.PRO:
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case SubscriptionTier.FREE:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusBadgeColor = (status: SubscriptionStatus) => {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case SubscriptionStatus.CANCELED:
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case SubscriptionStatus.PAST_DUE:
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Subscription Management
          </h2>
          <p className="text-white/70">
            Managing subscription for {userName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={loadData}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Close
          </Button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <Alert className="bg-red-500/20 border-red-500/30 text-white">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-500/20 border-green-500/30 text-white">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              Current Plan
            </CardTitle>
            <CreditCard className="h-4 w-4 text-purple-300" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge className={getTierBadgeColor(data?.subscription?.tier || SubscriptionTier.FREE)}>
                {data?.subscription?.tier || 'FREE'}
              </Badge>
              {data?.subscription && (
                <Badge className={getStatusBadgeColor(data.subscription.status)}>
                  {data.subscription.status}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              Current Period
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-300" />
          </CardHeader>
          <CardContent>
            <div className="text-sm text-white/70">
              {data?.subscription ? (
                <>
                  <div>Start: {new Date(data.subscription.currentPeriodStart).toLocaleDateString()}</div>
                  <div>End: {new Date(data.subscription.currentPeriodEnd).toLocaleDateString()}</div>
                </>
              ) : (
                <div>No active subscription</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              Total Activity
            </CardTitle>
            <Activity className="h-4 w-4 text-green-300" />
          </CardHeader>
          <CardContent>
            <div className="text-sm text-white/70">
              <div>{data?.activity.storiesCount || 0} Stories</div>
              <div>{data?.activity.analysesCount || 0} Analyses</div>
              <div>{data?.activity.jobsCount || 0} Jobs</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="subscription" className="space-y-6">
        <TabsList className="bg-white/10 backdrop-blur-sm border border-white/20">
          <TabsTrigger 
            value="subscription" 
            className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Subscription
          </TabsTrigger>
          <TabsTrigger 
            value="usage" 
            className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Usage
          </TabsTrigger>
          <TabsTrigger 
            value="billing" 
            className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
          >
            <FileText className="w-4 h-4 mr-2" />
            Billing
          </TabsTrigger>
        </TabsList>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Subscription Details</CardTitle>
                <div className="flex items-center gap-2">
                  {!editMode && (
                    <Button
                      onClick={() => setEditMode(true)}
                      size="sm"
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  {data?.subscription && (
                    <Button
                      onClick={() => setShowCancelDialog(true)}
                      size="sm"
                      variant="outline"
                      className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {editMode ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Subscription Tier</Label>
                      <Select
                        value={editForm.tier}
                        onValueChange={(value) => setEditForm({ ...editForm, tier: value as any })}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={SubscriptionTier.FREE}>Free</SelectItem>
                          <SelectItem value={SubscriptionTier.PRO}>Pro</SelectItem>
                          <SelectItem value={SubscriptionTier.ENTERPRISE}>Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Status</Label>
                      <Select
                        value={editForm.status}
                        onValueChange={(value) => setEditForm({ ...editForm, status: value as any })}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={SubscriptionStatus.ACTIVE}>Active</SelectItem>
                          <SelectItem value={SubscriptionStatus.CANCELED}>Canceled</SelectItem>
                          <SelectItem value={SubscriptionStatus.PAST_DUE}>Past Due</SelectItem>
                          <SelectItem value={SubscriptionStatus.UNPAID}>Unpaid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Period Start</Label>
                      <Input
                        type="date"
                        value={editForm.currentPeriodStart}
                        onChange={(e) => setEditForm({ ...editForm, currentPeriodStart: e.target.value })}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Period End</Label>
                      <Input
                        type="date"
                        value={editForm.currentPeriodEnd}
                        onChange={(e) => setEditForm({ ...editForm, currentPeriodEnd: e.target.value })}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Stripe Customer ID</Label>
                      <Input
                        value={editForm.stripeCustomerId}
                        onChange={(e) => setEditForm({ ...editForm, stripeCustomerId: e.target.value })}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="cus_..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Stripe Subscription ID</Label>
                      <Input
                        value={editForm.stripeSubscriptionId}
                        onChange={(e) => setEditForm({ ...editForm, stripeSubscriptionId: e.target.value })}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="sub_..."
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <Button
                      onClick={updateSubscription}
                      disabled={saving}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                      Save Changes
                    </Button>
                    <Button
                      onClick={() => setEditMode(false)}
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {data?.subscription ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-white/60">Tier</div>
                        <Badge className={getTierBadgeColor(data.subscription.tier)}>
                          {data.subscription.tier}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-white/60">Status</div>
                        <Badge className={getStatusBadgeColor(data.subscription.status)}>
                          {data.subscription.status}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-white/60">Period Start</div>
                        <div className="text-white">
                          {new Date(data.subscription.currentPeriodStart).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-white/60">Period End</div>
                        <div className="text-white">
                          {new Date(data.subscription.currentPeriodEnd).toLocaleDateString()}
                        </div>
                      </div>
                      {data.subscription.stripeCustomerId && (
                        <div>
                          <div className="text-white/60">Stripe Customer</div>
                          <div className="text-white font-mono text-xs">
                            {data.subscription.stripeCustomerId}
                          </div>
                        </div>
                      )}
                      {data.subscription.stripeSubscriptionId && (
                        <div>
                          <div className="text-white/60">Stripe Subscription</div>
                          <div className="text-white font-mono text-xs">
                            {data.subscription.stripeSubscriptionId}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-white/60 mb-4">No active subscription</div>
                      <Button
                        onClick={() => setEditMode(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Create Subscription
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Usage */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Current Usage</CardTitle>
                  <Button
                    onClick={() => resetUsage('current_period')}
                    size="sm"
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {data?.usage?.current ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Stories Generated</span>
                      <span className="text-white">
                        {data.usage.current.storiesGenerated} / {data.usage.current.storiesLimit === -1 ? '∞' : data.usage.current.storiesLimit}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">API Calls Used</span>
                      <span className="text-white">
                        {data.usage.current.apiCallsUsed} / {data.usage.current.apiCallsLimit.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Files Processed</span>
                      <span className="text-white">
                        {data.usage.current.filesProcessed} / {data.usage.current.filesLimit}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-white/60 text-center py-4">
                    No usage data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subscription Limits */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Plan Limits</CardTitle>
              </CardHeader>
              <CardContent>
                {data?.usage?.limits ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Stories per Month</span>
                      <span className="text-white">
                        {data.usage.limits.storiesPerMonth === -1 ? 'Unlimited' : data.usage.limits.storiesPerMonth}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">API Calls per Month</span>
                      <span className="text-white">
                        {data.usage.limits.apiCallsPerMonth.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Max File Size</span>
                      <span className="text-white">
                        {data.usage.limits.maxFileSize} MB
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Priority Support</span>
                      <span className="text-white">
                        {data.usage.limits.prioritySupport ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-white/60 text-center py-4">
                    No limit data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Billing History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-white/60 text-center py-8">
                Billing history integration coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="bg-gray-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription className="text-white/70">
              Choose how to cancel the subscription for {userName}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Button
              onClick={() => cancelSubscription(false)}
              disabled={saving}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              <Clock className="w-4 h-4 mr-2" />
              Cancel at Period End
            </Button>
            <Button
              onClick={() => cancelSubscription(true)}
              disabled={saving}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancel Immediately
            </Button>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowCancelDialog(false)}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Keep Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}