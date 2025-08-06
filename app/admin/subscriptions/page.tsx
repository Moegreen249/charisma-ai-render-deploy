'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { CreditCard, Users, TrendingUp, DollarSign, Search, RefreshCw, Plus, Ban, Clock, Crown, Zap, Building } from "lucide-react";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import Edit from "lucide-react/dist/esm/icons/edit";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserSubscription {
  id: string;
  userId: string;
  tier: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  usage?: {
    storiesGenerated: number;
    storiesLimit: number;
    apiCallsUsed: number;
    apiCallsLimit: number;
  };
}

export default function AdminSubscriptionsPage() {
  const { data: session, status } = useSession();
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Check authentication and role
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      redirect("/auth/signin");
    }

    if (session.user.role !== "ADMIN") {
      redirect("/");
    }
  }, [session, status]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/subscriptions');
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.subscriptions || []);
        setFilteredSubscriptions(data.subscriptions || []);
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch subscriptions' });
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      setMessage({ type: 'error', text: 'Failed to fetch subscriptions' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchSubscriptions();
    }
  }, [session]);

  // Filter and search functionality
  useEffect(() => {
    let filtered = subscriptions || [];

    // Filter by tier
    if (tierFilter !== 'all') {
      filtered = filtered.filter(sub => sub.tier === tierFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSubscriptions(filtered);
  }, [subscriptions, tierFilter, statusFilter, searchTerm]);

  const handleSubscriptionAction = async (subscriptionId: string, action: 'cancel' | 'reactivate' | 'upgrade' | 'downgrade', newTier?: string) => {
    setActionLoading(subscriptionId);
    try {
      const response = await fetch(`/api/admin/subscriptions/${subscriptionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          newTier,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        fetchSubscriptions(); // Refresh the list
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update subscription' });
    } finally {
      setActionLoading(null);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'FREE': return <Users className="w-4 h-4" />;
      case 'PRO': return <Crown className="w-4 h-4" />;
      case 'ENTERPRISE': return <Building className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'FREE': return 'bg-gray-500';
      case 'PRO': return 'bg-blue-500';
      case 'ENTERPRISE': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="w-3 h-3" />;
      case 'CANCELED': return <XCircle className="w-3 h-3" />;
      case 'PAST_DUE': return <Clock className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500';
      case 'CANCELED': return 'bg-red-500';
      case 'PAST_DUE': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  // Calculate stats
  const totalSubscriptions = subscriptions.length;
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'ACTIVE').length;
  const canceledSubscriptions = subscriptions.filter(sub => sub.status === 'CANCELED').length;
  const totalRevenue = subscriptions.filter(sub => sub.status === 'ACTIVE').length * 29; // Rough calculation

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4 text-center">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-28 left-16 w-2 h-2 bg-blue-400/20 rounded-full animate-pulse"></div>
        <div className="absolute top-44 right-20 w-1 h-1 bg-purple-400/25 rounded-full animate-ping"></div>
        <div className="absolute top-2/3 left-12 w-1.5 h-1.5 bg-cyan-400/20 rounded-full animate-pulse" style={{animationDelay: '1.8s'}}></div>
        <div className="absolute bottom-36 right-28 w-1 h-1 bg-green-400/25 rounded-full animate-ping" style={{animationDelay: '2.2s'}}></div>
      </div>
      
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Subscription Management
            </h1>
            <p className="text-white/70">
              Manage user subscriptions, billing, and usage metrics
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={fetchSubscriptions}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {message && (
          <Alert className={`${message.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-white' : 'bg-green-500/20 border-green-500/30 text-white'}`}>
            <AlertDescription>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Total Subscriptions</CardTitle>
              <div className="p-2 rounded-full bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                <CreditCard className="h-4 w-4 text-blue-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-300">{totalSubscriptions}</div>
              <p className="text-xs text-white/60 mt-1">All subscriptions</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Active</CardTitle>
              <div className="p-2 rounded-full bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                <CheckCircle className="h-4 w-4 text-green-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-300 group-hover:scale-110 transition-transform duration-300">{activeSubscriptions}</div>
              <p className="text-xs text-white/60 mt-1">Active subscriptions</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Canceled</CardTitle>
              <div className="p-2 rounded-full bg-red-500/20 group-hover:bg-red-500/30 transition-colors">
                <XCircle className="h-4 w-4 text-red-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-300 group-hover:scale-110 transition-transform duration-300">{canceledSubscriptions}</div>
              <p className="text-xs text-white/60 mt-1">Canceled subscriptions</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Monthly Revenue</CardTitle>
              <div className="p-2 rounded-full bg-yellow-500/20 group-hover:bg-yellow-500/30 transition-colors">
                <DollarSign className="h-4 w-4 text-yellow-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-300 group-hover:scale-110 transition-transform duration-300">${totalRevenue}</div>
              <p className="text-xs text-white/60 mt-1">Estimated revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                <Input
                  placeholder="Search by user name, email, or subscription ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
              </div>
              <div className="flex gap-2">
                <Select value={tierFilter} onValueChange={setTierFilter}>
                  <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="FREE">Free</SelectItem>
                    <SelectItem value="PRO">Pro</SelectItem>
                    <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="CANCELED">Canceled</SelectItem>
                    <SelectItem value="PAST_DUE">Past Due</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscriptions List */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Subscriptions ({filteredSubscriptions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredSubscriptions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white/70">No subscriptions found</p>
                </div>
              ) : (
                filteredSubscriptions.map((subscription) => (
                  <Card key={subscription.id} className="bg-white/10 backdrop-blur-md border-white/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">
                              {subscription.user.name || 'No name'}
                            </h3>
                            <Badge className={`${getTierColor(subscription.tier)} text-white`}>
                              {getTierIcon(subscription.tier)}
                              <span className="ml-1">{subscription.tier}</span>
                            </Badge>
                            <Badge className={`${getStatusColor(subscription.status)} text-white`}>
                              {getStatusIcon(subscription.status)}
                              <span className="ml-1">{subscription.status}</span>
                            </Badge>
                          </div>
                          <p className="text-white/70 text-sm">{subscription.user.email}</p>
                          <div className="text-sm text-white/60 mt-2">
                            <p>Started: {new Date(subscription.currentPeriodStart).toLocaleDateString()}</p>
                            <p>Ends: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</p>
                            {subscription.usage && (
                              <p>Usage: {subscription.usage.storiesGenerated}/{subscription.usage.storiesLimit} stories</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {subscription.status === 'ACTIVE' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleSubscriptionAction(subscription.id, 'cancel')}
                              disabled={actionLoading === subscription.id}
                            >
                              {actionLoading === subscription.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Ban className="w-4 h-4 mr-1" />
                                  Cancel
                                </>
                              )}
                            </Button>
                          )}
                          {subscription.status === 'CANCELED' && (
                            <Button
                              size="sm"
                              onClick={() => handleSubscriptionAction(subscription.id, 'reactivate')}
                              disabled={actionLoading === subscription.id}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {actionLoading === subscription.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Zap className="w-4 h-4 mr-1" />
                                  Reactivate
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}