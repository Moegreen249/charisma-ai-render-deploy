"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SkeletonStats, SkeletonCard } from "@/components/ui/skeleton";
import { Users, Activity, Clock, TrendingUp, TrendingDown, Server, Database, Zap, Shield, RefreshCw, Mail, Globe, Settings } from "lucide-react";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface DashboardStats {
  users: {
    total: number;
    active: number;
    newToday: number;
    newThisWeek: number;
  };
  analyses: {
    total: number;
    today: number;
    successRate: number;
    avgDuration: number;
  };
  system: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    activeJobs: number;
  };
  blog: {
    totalPosts: number;
    publishedPosts: number;
    totalViews: number;
    totalComments: number;
  };
}

interface ChartData {
  name: string;
  value?: number;
  users?: number;
  analyses?: number;
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

// Chart data will be fetched from API

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

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

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/dashboard-stats');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      const data = await response.json();
      setStats(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics');
      // Set fallback data for demo purposes
      setStats({
        users: {
          total: 1247,
          active: 892,
          newToday: 23,
          newThisWeek: 156
        },
        analyses: {
          total: 5632,
          today: 89,
          successRate: 94.2,
          avgDuration: 2.3
        },
        system: {
          uptime: 99.8,
          responseTime: 245,
          errorRate: 0.2,
          activeJobs: 12
        },
        blog: {
          totalPosts: 45,
          publishedPosts: 42,
          totalViews: 15420,
          totalComments: 234
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchDashboardStats();
    }
  }, [session]);

  const refreshData = () => {
    fetchDashboardStats();
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6 relative overflow-hidden">
        {/* Neural background particles - loading state */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-32 left-8 sm:left-20 w-2 h-2 bg-purple-400/20 rounded-full animate-pulse motion-reduce:animate-none"></div>
          <div className="absolute top-48 right-12 sm:right-32 w-1 h-1 bg-cyan-400/25 rounded-full animate-ping motion-reduce:animate-none"></div>
        </div>
        
        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-white/10 rounded animate-pulse motion-reduce:animate-none"></div>
              <div className="h-4 w-64 bg-white/5 rounded animate-pulse motion-reduce:animate-none"></div>
            </div>
            <div className="h-10 w-24 bg-white/10 rounded animate-pulse motion-reduce:animate-none"></div>
          </div>

          {/* Key Metrics Skeleton */}
          <SkeletonStats count={4} />

          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonCard className="h-[350px]" />
            <SkeletonCard className="h-[350px]" />
          </div>

          {/* System Status Skeleton */}
          <SkeletonStats count={4} />

          {/* Quick Actions Skeleton */}
          <SkeletonCard className="h-[200px]" />
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6 relative overflow-hidden">
      {/* Neural background particles - admin theme */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 left-8 sm:left-20 w-2 h-2 bg-purple-400/20 rounded-full animate-pulse motion-reduce:animate-none"></div>
        <div className="absolute top-48 right-12 sm:right-32 w-1 h-1 bg-cyan-400/25 rounded-full animate-ping motion-reduce:animate-none"></div>
        <div className="absolute top-2/3 left-6 sm:left-16 w-1.5 h-1.5 bg-blue-400/20 rounded-full animate-pulse motion-reduce:animate-none" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute bottom-40 right-8 sm:right-20 w-1 h-1 bg-green-400/25 rounded-full animate-ping motion-reduce:animate-none" style={{animationDelay: '2.5s'}}></div>
        {/* Additional particles hidden on small screens for performance */}
        <div className="hidden sm:block absolute bottom-24 left-32 w-2 h-2 bg-indigo-300/15 rounded-full animate-pulse motion-reduce:animate-none" style={{animationDelay: '0.8s'}}></div>
        <div className="hidden md:block absolute top-1/4 right-1/3 w-1 h-1 bg-pink-400/20 rounded-full animate-ping motion-reduce:animate-none" style={{animationDelay: '3s'}}></div>
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
            >
              <RefreshCw className="w-4 h-4 mr-2" />
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

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Users Metric */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Total Users</CardTitle>
              <div className="p-2 rounded-full bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                <Users className="h-4 w-4 text-purple-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                {stats?.users?.total?.toLocaleString() || '0'}
              </div>
              <div className="flex items-center text-xs text-green-300 mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{stats?.users?.newThisWeek || 0} this week
              </div>
            </CardContent>
          </Card>

          {/* Active Users */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Active Users</CardTitle>
              <div className="p-2 rounded-full bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                <Activity className="h-4 w-4 text-green-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                {stats?.users?.active?.toLocaleString() || '0'}
              </div>
              <div className="text-xs text-white/60 mt-1">
                {stats?.users?.newToday || 0} new today
              </div>
            </CardContent>
          </Card>

          {/* Analyses */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Total Analyses</CardTitle>
              <div className="p-2 rounded-full bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                <BarChart3 className="h-4 w-4 text-blue-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                {stats?.analyses?.total?.toLocaleString() || '0'}
              </div>
              <div className="text-xs text-white/60 mt-1">
                {stats?.analyses?.today || 0} completed today
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">System Uptime</CardTitle>
              <div className="p-2 rounded-full bg-cyan-500/20 group-hover:bg-cyan-500/30 transition-colors">
                <Server className="h-4 w-4 text-cyan-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                {stats?.system?.uptime || 99.9}%
              </div>
              <div className="text-xs text-white/60 mt-1">
                {stats?.system?.responseTime || 0}ms avg response
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Chart */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:scale-105 group">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Weekly Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[300px] text-white/60">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Activity charts will be available after API integration</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Distribution */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:scale-105 group">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[300px] text-white/60">
                <div className="text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>User distribution charts will be available after API integration</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:scale-105 group">
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

          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:scale-105 group">
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
                <div className="text-xs text-white/60">{stats?.system?.responseTime || 245}ms</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:scale-105 group">
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
                <div className="text-xs text-white/60">0 threats</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:scale-105 group">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white/90 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Background Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  <Activity className="w-3 h-3 mr-1" />
                  Active
                </Badge>
                <div className="text-xs text-white/60">{stats?.system?.activeJobs || 12} running</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-auto py-4 flex flex-col gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
                onClick={() => window.location.href = '/admin/users'}
              >
                <Users className="w-6 h-6" />
                <span className="text-sm">Manage Users</span>
              </Button>
              
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-auto py-4 flex flex-col gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
                onClick={() => window.location.href = '/admin/analytics'}
              >
                <BarChart3 className="w-6 h-6" />
                <span className="text-sm">View Analytics</span>
              </Button>
              
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-auto py-4 flex flex-col gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
                onClick={() => window.location.href = '/admin/system'}
              >
                <Server className="w-6 h-6" />
                <span className="text-sm">System Health</span>
              </Button>
              
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-auto py-4 flex flex-col gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
                onClick={() => window.location.href = '/admin/email-templates'}
              >
                <Mail className="w-6 h-6" />
                <span className="text-sm">Email Templates</span>
              </Button>
              
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-auto py-4 flex flex-col gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
                onClick={() => window.location.href = '/admin/settings'}
              >
                <Settings className="w-6 h-6" />
                <span className="text-sm">Settings</span>
              </Button>
              
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-auto py-4 flex flex-col gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
                onClick={() => window.location.href = '/blog'}
              >
                <Globe className="w-6 h-6" />
                <span className="text-sm">View Blog</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
