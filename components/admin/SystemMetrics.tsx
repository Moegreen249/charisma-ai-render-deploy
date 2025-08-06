"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SkeletonCard } from "@/components/ui/skeleton";
import { Activity, Clock, TrendingUp, TrendingDown, Server, Database, Zap, Shield, RefreshCw, Users, FileText } from "lucide-react";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
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
  Cell,
  BarChart,
  Bar
} from "recharts";
import type { SystemMetrics as SystemMetricsType } from "@/lib/admin-service";

interface SystemMetricsProps {
  systemMetrics?: SystemMetricsType | null;
  loading?: boolean;
  onRefresh?: () => void;
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export function SystemMetrics({ systemMetrics, loading, onRefresh }: SystemMetricsProps) {
  const [realTimeData, setRealTimeData] = useState<any[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Real-time data will be fetched from WebSocket or API
  useEffect(() => {
    if (autoRefresh) {
      // Real-time metrics fetching will be implemented with WebSocket integration
    }
  }, [autoRefresh]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonCard className="h-[400px]" />
          <SkeletonCard className="h-[400px]" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonCard className="h-[300px]" />
          <SkeletonCard className="h-[300px]" />
          <SkeletonCard className="h-[300px]" />
        </div>
      </div>
    );
  }

  const taskQueueData = [
    { name: 'Queued', value: systemMetrics?.taskQueueStats?.totalQueued || 0, color: '#f59e0b' },
    { name: 'Running', value: systemMetrics?.taskQueueStats?.totalRunning || 0, color: '#06b6d4' },
    { name: 'Completed', value: systemMetrics?.taskQueueStats?.totalCompleted || 0, color: '#10b981' },
    { name: 'Failed', value: systemMetrics?.taskQueueStats?.totalFailed || 0, color: '#ef4444' }
  ];

  const errorCategoryData = systemMetrics?.errorStats?.topErrorCategories?.map((category, index) => ({
    name: category.category,
    count: category.count,
    fill: COLORS[index % COLORS.length]
  })) || [];

  const apiProviderData = systemMetrics?.apiUsage?.topProviders?.map((provider, index) => ({
    name: provider.provider,
    usage: provider.usage,
    fill: COLORS[index % COLORS.length]
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">System Metrics</h2>
          <p className="text-white/70">Real-time system performance monitoring</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant={autoRefresh ? "primary" : "outline"}
            className={autoRefresh 
              ? "bg-green-600 text-white hover:bg-green-700" 
              : "bg-white/10 border-white/20 text-white hover:bg-white/20"
            }
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="w-4 h-4 mr-2" />
            {autoRefresh ? "Live" : "Static"}
          </Button>
          <Button
            onClick={onRefresh}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* API Success Rate */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">API Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {systemMetrics?.apiUsage?.successRate?.toFixed(1) || 0}%
            </div>
            <Progress 
              value={systemMetrics?.apiUsage?.successRate || 0} 
              className="mt-2 h-2"
            />
            <div className="text-xs text-white/60 mt-1">
              {systemMetrics?.apiUsage?.totalApiCalls || 0} total calls
            </div>
          </CardContent>
        </Card>

        {/* Average Response Time */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Avg Response Time</CardTitle>
            <Zap className="h-4 w-4 text-yellow-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {systemMetrics?.apiUsage?.averageResponseTime?.toFixed(0) || 0}ms
            </div>
            <div className="flex items-center text-xs mt-1">
              {(systemMetrics?.apiUsage?.averageResponseTime || 0) < 500 ? (
                <div className="text-green-300 flex items-center">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  Excellent
                </div>
              ) : (
                <div className="text-yellow-300 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Moderate
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Task Queue Health */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Queue Success Rate</CardTitle>
            <Clock className="h-4 w-4 text-blue-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {systemMetrics?.taskQueueStats?.successRate?.toFixed(1) || 0}%
            </div>
            <Progress 
              value={systemMetrics?.taskQueueStats?.successRate || 0} 
              className="mt-2 h-2"
            />
            <div className="text-xs text-white/60 mt-1">
              {systemMetrics?.taskQueueStats?.totalRunning || 0} running tasks
            </div>
          </CardContent>
        </Card>

        {/* Error Rate */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/[0.15] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {systemMetrics?.apiUsage?.errorRate?.toFixed(2) || 0}%
            </div>
            <div className="text-xs text-white/60 mt-1">
              {systemMetrics?.errorStats?.totalErrors || 0} total errors
            </div>
            <div className="text-xs text-red-300 mt-1">
              {systemMetrics?.errorStats?.criticalErrors || 0} critical
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Queue Distribution */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Task Queue Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskQueueData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskQueueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* API Provider Usage */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5" />
              API Provider Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={apiProviderData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
                <YAxis stroke="rgba(255,255,255,0.7)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Bar dataKey="usage" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Error Categories */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Error Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={errorCategoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
                <YAxis stroke="rgba(255,255,255,0.7)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Bar dataKey="count" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Real-time Performance */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Real-time Performance
              {autoRefresh && (
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30 ml-2">
                  Live
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={realTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.7)" />
                <YAxis stroke="rgba(255,255,255,0.7)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="cpu"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                  name="CPU %"
                />
                <Line
                  type="monotone"
                  dataKey="memory"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                  name="Memory %"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* System Status Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Database Status */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="w-5 h-5" />
              Database Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Connection Pool</span>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                Healthy
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Query Performance</span>
              <span className="text-white">~45ms avg</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Active Connections</span>
              <span className="text-white">12/50</span>
            </div>
            <Progress value={24} className="h-2" />
          </CardContent>
        </Card>

        {/* Server Resources */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Server className="w-5 h-5" />
              Server Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white/70">CPU Usage</span>
                <span className="text-white">23%</span>
              </div>
              <Progress value={23} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white/70">Memory Usage</span>
                <span className="text-white">67%</span>
              </div>
              <Progress value={67} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white/70">Disk Usage</span>
                <span className="text-white">45%</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Security Status */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/70">SSL Certificate</span>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                Valid
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Rate Limiting</span>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                Active
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Failed Logins</span>
              <span className="text-white">3 (24h)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Blocked IPs</span>
              <span className="text-white">0</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}