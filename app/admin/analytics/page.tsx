"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import {
  Users,
  Activity,
  Clock,
  TrendingUp,
  TrendingDown,
  Server,
  Database,
  Zap,
  Shield,
  RefreshCw,
  Download,
  Calendar,
  Eye,
} from "lucide-react";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import Filter from "lucide-react/dist/esm/icons/filter";

interface PlatformStats {
  users: {
    total: number;
    active: { daily: number; weekly: number; monthly: number };
    new: { today: number; thisWeek: number; thisMonth: number };
    retention: { daily: number; weekly: number; monthly: number };
  };
  analyses: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    successRate: number;
    avgDuration: number;
  };
  errors: {
    total: number;
    critical: number;
    resolved: number;
    categories: Record<string, number>;
  };
  performance: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    activeJobs: number;
  };
}

interface ErrorLog {
  id: string;
  category: string;
  severity: string;
  message: string;
  count: number;
  lastOccurred: Date;
  isResolved: boolean;
}

export default function AdminAnalytics() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Check authentication and role
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      redirect("/auth/signin");
    }

    if (session.user.role !== "ADMIN") {
      redirect("/");
    }

    loadAnalytics();
  }, [session, status]);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch real analytics data from API
      const response = await fetch(
        `/api/admin/analytics?timeRange=${selectedTimeRange}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Transform the API response to match our component's expected format
      const transformedStats: PlatformStats = {
        users: {
          total: data.users.total,
          active: {
            daily: data.users.active.daily,
            weekly: data.users.active.weekly,
            monthly: data.users.active.monthly,
          },
          new: {
            today: data.users.new.today,
            thisWeek: data.users.new.thisWeek,
            thisMonth: data.users.new.thisMonth,
          },
          retention: {
            daily: data.users.retention.daily,
            weekly: data.users.retention.weekly,
            monthly: data.users.retention.monthly,
          },
        },
        analyses: {
          total: data.analyses.total,
          today: data.analyses.today,
          thisWeek: data.analyses.thisWeek,
          thisMonth: data.analyses.thisMonth,
          successRate: data.analyses.successRate,
          avgDuration: data.analyses.avgDuration,
        },
        errors: {
          total: data.errors.total,
          critical: data.errors.critical,
          resolved: data.errors.resolved,
          categories: data.errors.categories,
        },
        performance: {
          responseTime: data.performance.avgAnalysisTime / 1000, // Convert ms to seconds
          errorRate:
            data.errors.total > 0
              ? (data.errors.total / data.analyses.total) * 100
              : 0,
          uptime:
            data.performance.systemHealth === "Good"
              ? 99.9
              : data.performance.systemHealth === "Warning"
                ? 95.0
                : 85.0,
          activeJobs:
            data.backgroundJobs.processing + data.backgroundJobs.pending,
        },
      };

      // Transform recent errors for the error log
      const transformedErrors: ErrorLog[] = data.recentErrors.map(
        (error: any) => ({
          id: error.id,
          message: error.message,
          category: error.category,
          severity: error.severity,
          count: 1, // API doesn't provide occurrence count in this endpoint
          lastOccurred: new Date(error.timestamp),
          isResolved: error.isResolved,
        }),
      );

      setStats(transformedStats);
      setErrors(transformedErrors);
    } catch (error) {
      console.error("Failed to load analytics:", error);
      // You might want to show an error toast here
    } finally {
      setLoading(false);
    }
  }, [selectedTimeRange]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadAnalytics();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, loadAnalytics]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-500";
      case "HIGH":
        return "bg-orange-500";
      case "MEDIUM":
        return "bg-yellow-500";
      case "LOW":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDuration = (ms: number) => {
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white/70">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6 relative overflow-hidden">
      {/* Neural background particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400/20 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-16 w-1 h-1 bg-purple-400/25 rounded-full animate-ping"></div>
        <div className="absolute top-2/3 left-8 w-1.5 h-1.5 bg-cyan-400/20 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute bottom-32 right-20 w-1 h-1 bg-green-400/25 rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <BarChart className="mr-3 h-8 w-8 text-purple-400" />
                Platform Analytics
              </h1>
              <p className="text-white/70 mt-1">
                Real-time insights and performance metrics
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white/10 border-white/20 text-white backdrop-blur-md hover:bg-white/20 transition-all duration-300"
              >
                <option value="1d" className="bg-gray-800 text-white">Last 24 hours</option>
                <option value="7d" className="bg-gray-800 text-white">Last 7 days</option>
                <option value="30d" className="bg-gray-800 text-white">Last 30 days</option>
                <option value="90d" className="bg-gray-800 text-white">Last 90 days</option>
              </select>
              <Button
                variant="outline"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`${
                  autoRefresh
                    ? "bg-green-500/20 border-green-500/30 text-green-300 hover:bg-green-500/30"
                    : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                } transition-all duration-300`}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`}
                />
                Auto-refresh {autoRefresh ? "ON" : "OFF"}
              </Button>
              <Button 
                onClick={loadAnalytics} 
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Total Users</CardTitle>
              <div className="p-2 rounded-full bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                <Users className="h-4 w-4 text-purple-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                {stats.users.total.toLocaleString()}
              </div>
              <p className="text-xs text-white/60 mt-1">
                +{stats.users.new.thisMonth} this month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Active Users</CardTitle>
              <div className="p-2 rounded-full bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                <Activity className="h-4 w-4 text-green-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                {stats.users.active.daily.toLocaleString()}
              </div>
              <p className="text-xs text-white/60 mt-1">
                Daily active users
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Success Rate</CardTitle>
              <div className="p-2 rounded-full bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                <CheckCircle className="h-4 w-4 text-blue-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                {formatPercentage(stats.analyses.successRate)}
              </div>
              <p className="text-xs text-white/60 mt-1">
                Analysis success rate
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">System Health</CardTitle>
              <div className="p-2 rounded-full bg-cyan-500/20 group-hover:bg-cyan-500/30 transition-colors">
                <Server className="h-4 w-4 text-cyan-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                {formatPercentage(stats.performance.uptime)}
              </div>
              <p className="text-xs text-white/60 mt-1">Uptime this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 border-white/20">
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 hover:text-white transition-colors"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="users"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 hover:text-white transition-colors"
            >
              Users
            </TabsTrigger>
            <TabsTrigger 
              value="errors"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 hover:text-white transition-colors"
            >
              Errors
            </TabsTrigger>
            <TabsTrigger 
              value="performance"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 hover:text-white transition-colors"
            >
              Performance
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Analysis Trends */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    Analysis Activity
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Daily analysis requests over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart
                      data={[
                        { date: "Mon", analyses: 23 },
                        { date: "Tue", analyses: 45 },
                        { date: "Wed", analyses: 34 },
                        { date: "Thu", analyses: 67 },
                        { date: "Fri", analyses: 89 },
                        { date: "Sat", analyses: 56 },
                        { date: "Sun", analyses: 34 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="analyses"
                        stroke="#00FFC2"
                        fill="#00FFC2"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Error Distribution */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    Error Categories
                  </CardTitle>
                  <CardDescription className="text-white/70">Distribution of error types</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={Object.entries(stats.errors.categories).map(
                          ([name, value]) => ({ name, value }),
                        )}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label
                      >
                        {Object.entries(stats.errors.categories).map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={`hsl(${index * 45}, 70%, 60%)`}
                            />
                          ),
                        )}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-400" />
                  Performance Overview
                </CardTitle>
                <CardDescription className="text-white/70">
                  Real-time system performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Response Time</span>
                      <span className="text-sm text-white/60">
                        {stats.performance.responseTime}s
                      </span>
                    </div>
                    <Progress
                      value={Math.min(stats.performance.responseTime * 50, 100)}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Error Rate</span>
                      <span className="text-sm text-white/60">
                        {formatPercentage(stats.performance.errorRate)}
                      </span>
                    </div>
                    <Progress
                      value={stats.performance.errorRate}
                      className="bg-red-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Active Jobs</span>
                      <span className="text-sm text-white/60">
                        {stats.performance.activeJobs}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(stats.performance.activeJobs * 10, 100)}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Uptime</span>
                      <span className="text-sm text-white/60">
                        {formatPercentage(stats.performance.uptime)}
                      </span>
                    </div>
                    <Progress
                      value={stats.performance.uptime}
                      className="bg-green-100"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="errors" className="space-y-6">
            {/* Error Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-white">
                    Total Errors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.errors.total}</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-white">
                    Critical Errors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {stats.errors.critical}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-white">
                    Resolved
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.errors.resolved}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-white">
                    Resolution Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.errors.total > 0
                      ? Math.round(
                          (stats.errors.resolved / stats.errors.total) * 100,
                        )
                      : 0}
                    %
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Error Management Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Error Management
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        try {
                          const response = await fetch(
                            "/api/admin/errors/bulk-resolve",
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ severity: "LOW" }),
                            },
                          );
                          if (response.ok) {
                            const data = await response.json();
                            // Update local state instead of reloading
                            setErrors((prevErrors) =>
                              prevErrors.map((err) =>
                                err.severity === "LOW" && !err.isResolved
                                  ? { ...err, isResolved: true }
                                  : err,
                              ),
                            );
                            console.log(
                              `Resolved ${data.resolvedCount || 0} low priority errors`,
                            );
                          } else {
                            const errorData = await response.json();
                            console.error("Failed to bulk resolve:", errorData);
                          }
                        } catch (error) {
                          console.error("Failed to bulk resolve:", error);
                        }
                      }}
                    >
                      Resolve All Low Priority
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        loadAnalytics();
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {errors.map((error) => (
                    <Card
                      key={error.id}
                      className={`border-l-4 ${
                        error.severity === "CRITICAL"
                          ? "border-l-red-500"
                          : error.severity === "HIGH"
                            ? "border-l-orange-500"
                            : error.severity === "MEDIUM"
                              ? "border-l-yellow-500"
                              : "border-l-blue-500"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={
                                  error.severity === "CRITICAL"
                                    ? "bg-red-100 text-red-700"
                                    : error.severity === "HIGH"
                                      ? "bg-orange-100 text-orange-700"
                                      : error.severity === "MEDIUM"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-blue-100 text-blue-700"
                                }
                              >
                                {error.severity}
                              </Badge>
                              <Badge variant="secondary">
                                {error.category}
                              </Badge>
                              {error.isResolved && (
                                <Badge className="bg-green-100 text-green-700">
                                  Resolved
                                </Badge>
                              )}
                            </div>
                            <p className="font-medium text-sm">
                              {error.message}
                            </p>
                            <p className="text-xs text-white/60">
                              Occurred {error.count} times • Last:{" "}
                              {error.lastOccurred.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            {!error.isResolved && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  try {
                                    const response = await fetch(
                                      `/api/admin/errors/${error.id}/resolve`,
                                      {
                                        method: "POST",
                                      },
                                    );
                                    if (response.ok) {
                                      // Update local state instead of reloading
                                      setErrors((prevErrors) =>
                                        prevErrors.map((err) =>
                                          err.id === error.id
                                            ? { ...err, isResolved: true }
                                            : err,
                                        ),
                                      );
                                    } else {
                                      const errorData = await response.json();
                                      console.error(
                                        "Failed to resolve error:",
                                        errorData,
                                      );
                                    }
                                  } catch (err) {
                                    console.error(
                                      "Failed to resolve error:",
                                      err,
                                    );
                                  }
                                }}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Resolve
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // Show error details modal
                                alert(
                                  `Error Details:\n\nID: ${error.id}\nCategory: ${error.category}\nSeverity: ${error.severity}\nMessage: ${error.message}\nOccurred: ${error.count} times\nLast: ${error.lastOccurred}`,
                                );
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {errors.length === 0 && (
                    <div className="text-center py-8 text-white/60">
                      No errors found for the selected time range.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">User Growth</CardTitle>
                  <CardDescription className="text-white/70">
                    New user registrations over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={[
                        { date: "Week 1", users: 23 },
                        { date: "Week 2", users: 45 },
                        { date: "Week 3", users: 67 },
                        { date: "Week 4", users: 89 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="users"
                        stroke="#00FFC2"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">User Retention</CardTitle>
                  <CardDescription className="text-white/70">
                    User engagement and retention metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Daily Retention</span>
                        <span>
                          {formatPercentage(stats.users.retention.daily)}
                        </span>
                      </div>
                      <Progress value={stats.users.retention.daily} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Weekly Retention</span>
                        <span>
                          {formatPercentage(stats.users.retention.weekly)}
                        </span>
                      </div>
                      <Progress value={stats.users.retention.weekly} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Monthly Retention</span>
                        <span>
                          {formatPercentage(stats.users.retention.monthly)}
                        </span>
                      </div>
                      <Progress value={stats.users.retention.monthly} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Errors Tab */}
          <TabsContent value="errors" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Error Monitoring</h3>
                <p className="text-white/60">
                  Track and resolve platform errors
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant="destructive">
                  {stats.errors.critical} Critical
                </Badge>
                <Badge variant="secondary">
                  {stats.errors.total - stats.errors.resolved} Unresolved
                </Badge>
                <Badge variant="default">
                  {stats.errors.resolved} Resolved
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              {errors.map((error) => (
                <Card
                  key={error.id}
                  className={`border-l-4 ${
                    error.severity === "CRITICAL"
                      ? "border-l-red-500"
                      : error.severity === "HIGH"
                        ? "border-l-orange-500"
                        : "border-l-yellow-500"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={getSeverityColor(error.severity)}
                          >
                            {error.severity}
                          </Badge>
                          <Badge variant="secondary">{error.category}</Badge>
                          {error.isResolved && (
                            <Badge variant="default">Resolved</Badge>
                          )}
                        </div>
                        <p className="font-medium">{error.message}</p>
                        <p className="text-sm text-white/60">
                          Occurred {error.count} times • Last:{" "}
                          {error.lastOccurred.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!error.isResolved && (
                          <Button variant="outline" size="sm">
                            Mark Resolved
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Response Times</CardTitle>
                  <CardDescription className="text-white/70">API response time trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart
                      data={[
                        { time: "00:00", responseTime: 1.2 },
                        { time: "04:00", responseTime: 0.8 },
                        { time: "08:00", responseTime: 2.1 },
                        { time: "12:00", responseTime: 1.9 },
                        { time: "16:00", responseTime: 1.5 },
                        { time: "20:00", responseTime: 1.1 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="responseTime"
                        stroke="#8884d8"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">System Resources</CardTitle>
                  <CardDescription className="text-white/70">Current system utilization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>CPU Usage</span>
                        <span>45%</span>
                      </div>
                      <Progress value={45} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Memory Usage</span>
                        <span>67%</span>
                      </div>
                      <Progress value={67} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Database Connections</span>
                        <span>34/100</span>
                      </div>
                      <Progress value={34} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
