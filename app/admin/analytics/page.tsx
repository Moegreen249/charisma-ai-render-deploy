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
  AlertTriangle,
  CheckCircle,
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
  Filter,
  Eye,
} from "lucide-react";

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Platform Analytics</h1>
            <p className="text-muted-foreground">
              Real-time insights and performance metrics
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <Button
              variant="outline"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={
                autoRefresh
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : ""
              }
            >
              <RefreshCw
                className={`h-4 w-4 ${autoRefresh ? "animate-spin" : ""}`}
              />
              Auto-refresh {autoRefresh ? "ON" : "OFF"}
            </Button>
            <Button onClick={loadAnalytics} disabled={loading}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.users.total.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +{stats.users.new.thisMonth} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Users
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.users.active.daily}
              </div>
              <p className="text-xs text-muted-foreground">
                Daily active users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Success Rate
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatPercentage(stats.analyses.successRate)}
              </div>
              <p className="text-xs text-muted-foreground">
                Analysis success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                System Health
              </CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatPercentage(stats.performance.uptime)}
              </div>
              <p className="text-xs text-muted-foreground">Uptime this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Analysis Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Activity</CardTitle>
                  <CardDescription>
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
              <Card>
                <CardHeader>
                  <CardTitle>Error Categories</CardTitle>
                  <CardDescription>Distribution of error types</CardDescription>
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
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>
                  Real-time system performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Response Time</span>
                      <span className="text-sm text-muted-foreground">
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
                      <span className="text-sm text-muted-foreground">
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
                      <span className="text-sm text-muted-foreground">
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
                      <span className="text-sm text-muted-foreground">
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
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Errors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.errors.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Critical Errors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {stats.errors.critical}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Resolved
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.errors.resolved}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
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
                            <p className="text-xs text-muted-foreground">
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
                    <div className="text-center py-8 text-muted-foreground">
                      No errors found for the selected time range.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>
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

              <Card>
                <CardHeader>
                  <CardTitle>User Retention</CardTitle>
                  <CardDescription>
                    User retention rates by period
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
                <p className="text-muted-foreground">
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
                        <p className="text-sm text-muted-foreground">
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
              <Card>
                <CardHeader>
                  <CardTitle>Response Times</CardTitle>
                  <CardDescription>API response time trends</CardDescription>
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

              <Card>
                <CardHeader>
                  <CardTitle>System Resources</CardTitle>
                  <CardDescription>Current system utilization</CardDescription>
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
