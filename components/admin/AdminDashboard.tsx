"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { SkeletonStats, SkeletonCard } from "@/components/ui/skeleton";
import { Activity, Clock, TrendingUp, Server, Database, Zap, Shield, RefreshCw, Settings, CreditCard, FileText } from "lucide-react";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import { UsersIcon, BrainIcon } from "@/components/icons";
import { SystemMetrics } from "./SystemMetrics";
import { ModelConfigPanel } from "./ModelConfigPanel";
import { UserManagementPanel } from "./UserManagementPanel";
import { AIConfigPanel } from "./AIConfigPanel";
import type { SystemMetrics as SystemMetricsType, UserStatistics } from "@/lib/admin-service";

interface AdminDashboardProps {
  initialData?: {
    systemMetrics: SystemMetricsType;
    userStats: UserStatistics;
  };
}

interface DashboardTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType<any>;
}

export function AdminDashboard({ initialData }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [systemMetrics, setSystemMetrics] = useState<SystemMetricsType | null>(
    initialData?.systemMetrics || null
  );
  const [userStats, setUserStats] = useState<UserStatistics | null>(
    initialData?.userStats || null
  );
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const tabs: DashboardTab[] = [
    {
      id: "overview",
      label: "System Overview",
      icon: BarChart3,
      component: () => <SystemOverview />
    },
    {
      id: "metrics",
      label: "System Metrics",
      icon: Activity,
      component: SystemMetrics
    },
    {
      id: "models",
      label: "AI Models",
      icon: Zap,
      component: ModelConfigPanel
    },
    {
      id: "ai-config",
      label: "AI Configuration",
      icon: BrainIcon,
      component: AIConfigPanel
    },
    {
      id: "users",
      label: "User Management",
      icon: UsersIcon,
      component: UserManagementPanel
    }
  ];

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [metricsResponse, userStatsResponse] = await Promise.all([
        fetch('/api/admin/metrics'),
        fetch('/api/admin/users/stats')
      ]);

      if (!metricsResponse.ok || !userStatsResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const [metricsData, userStatsData] = await Promise.all([
        metricsResponse.json(),
        userStatsResponse.json()
      ]);

      setSystemMetrics(metricsData);
      setUserStats(userStatsData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData) {
      fetchDashboardData();
    }
  }, [initialData]);

  const refreshData = () => {
    fetchDashboardData();
  };

  // System Overview Component
  function SystemOverview() {
    if (loading) {
      return (
        <div className="space-y-6">
          <SkeletonStats count={4} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonCard className="h-[300px]" />
            <SkeletonCard className="h-[300px]" />
          </div>
          <SkeletonStats count={4} />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total Users */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Total Users</CardTitle>
              <div className="p-2 rounded-full bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                <UsersIcon className="h-4 w-4 text-purple-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                {userStats?.totalUsers?.toLocaleString() || '0'}
              </div>
              <div className="flex items-center text-xs text-green-300 mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{userStats?.newUsersThisWeek || 0} this week
              </div>
            </CardContent>
          </Card>

          {/* Active Subscriptions */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Active Subscriptions</CardTitle>
              <div className="p-2 rounded-full bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                <CreditCard className="h-4 w-4 text-green-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                {systemMetrics?.activeSubscriptions?.toLocaleString() || '0'}
              </div>
              <div className="text-xs text-white/60 mt-1">
                Pro: {userStats?.subscriptionBreakdown?.PRO || 0} | Enterprise: {userStats?.subscriptionBreakdown?.ENTERPRISE || 0}
              </div>
            </CardContent>
          </Card>

          {/* Total Stories */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Stories Generated</CardTitle>
              <div className="p-2 rounded-full bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                <FileText className="h-4 w-4 text-blue-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                {systemMetrics?.totalStoriesGenerated?.toLocaleString() || '0'}
              </div>
              <div className="text-xs text-white/60 mt-1">
                Success rate: {systemMetrics?.apiUsage?.successRate?.toFixed(1) || 0}%
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">System Health</CardTitle>
              <div className={`p-2 rounded-full transition-colors ${
                systemMetrics?.systemHealth === 'healthy' 
                  ? 'bg-green-500/20 group-hover:bg-green-500/30' 
                  : systemMetrics?.systemHealth === 'warning'
                  ? 'bg-yellow-500/20 group-hover:bg-yellow-500/30'
                  : 'bg-red-500/20 group-hover:bg-red-500/30'
              }`}>
                {systemMetrics?.systemHealth === 'healthy' ? (
                  <CheckCircle className="h-4 w-4 text-green-300" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-300" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-300 capitalize">
                {systemMetrics?.systemHealth || 'Unknown'}
              </div>
              <div className="text-xs text-white/60 mt-1">
                {systemMetrics?.errorStats?.totalErrors || 0} errors today
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] transition-all duration-300 hover:scale-105 group">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white/90 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Database
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Healthy
                </Badge>
                <div className="text-xs text-white/60">99.9% uptime</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] transition-all duration-300 hover:scale-105 group">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white/90 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                API Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Optimal
                </Badge>
                <div className="text-xs text-white/60">
                  {systemMetrics?.apiUsage?.averageResponseTime?.toFixed(0) || 0}ms
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] transition-all duration-300 hover:scale-105 group">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white/90 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Secure
                </Badge>
                <div className="text-xs text-white/60">
                  {systemMetrics?.errorStats?.criticalErrors || 0} threats
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] transition-all duration-300 hover:scale-105 group">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white/90 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Background Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  <Activity className="w-3 h-3 mr-1" />
                  Active
                </Badge>
                <div className="text-xs text-white/60">
                  {systemMetrics?.taskQueueStats?.totalRunning || 0} running
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {tabs.slice(1).map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-auto py-4 flex flex-col gap-2 transition-all duration-300 hover:scale-105"
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-sm">{tab.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || SystemOverview;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6 relative overflow-hidden">
      {/* Neural background particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 left-8 sm:left-20 w-2 h-2 bg-purple-400/20 rounded-full animate-pulse motion-reduce:animate-none"></div>
        <div className="absolute top-48 right-12 sm:right-32 w-1 h-1 bg-cyan-400/25 rounded-full animate-ping motion-reduce:animate-none"></div>
        <div className="absolute top-2/3 left-6 sm:left-16 w-1.5 h-1.5 bg-blue-400/20 rounded-full animate-pulse motion-reduce:animate-none" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute bottom-40 right-8 sm:right-20 w-1 h-1 bg-green-400/25 rounded-full animate-ping motion-reduce:animate-none" style={{animationDelay: '2.5s'}}></div>
      </div>
      
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-white/70">
              Monitor platform performance and manage system resources
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={refreshData}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <div className="text-sm text-white/60">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {error && (
          <Alert className="bg-red-500/20 border-red-500/30 text-white">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "primary" : "outline"}
                className={`flex items-center gap-2 transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Active Tab Content */}
        <div className="min-h-[400px]">
          <ActiveComponent 
            systemMetrics={systemMetrics}
            userStats={userStats}
            loading={loading}
            onRefresh={refreshData}
          />
        </div>
      </div>
    </div>
  );
}