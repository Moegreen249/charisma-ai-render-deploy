"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminJobsWebSocket } from "@/hooks/useWebSocket";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Pause,
  Square,
  RefreshCw,
  Search,
  Download,
  Trash2,
  Eye,
  Settings,
  Users,
  Clock,
  Bell,
  Activity,
  Server,
  Database,
  Zap,
  BookOpen,
  Sparkles,
  Brain,
  FileText,
} from "lucide-react";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import Filter from "lucide-react/dist/esm/icons/filter";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import { cn } from "@/lib/utils";

interface BackgroundJob {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  type: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  progress: number;
  currentStep: string | null;
  totalSteps: number;
  templateId: string | null;
  modelId: string | null;
  provider: string | null;
  fileName: string | null;
  result: any;
  error: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  retryCount: number;
  source: 'backgroundJob' | 'taskQueue'; // To identify which system the job comes from
  // Additional fields for task queue jobs
  priority?: string;
  estimatedTime?: number;
  actualTime?: number;
  maxRetries?: number;
  queuedAt?: Date;
}

interface SystemStatus {
  redis: { status: "online" | "offline" | "error"; latency?: number };
  database: { status: "online" | "offline" | "error"; connections?: number };
  aiProviders: {
    openai: { status: "online" | "offline" | "error"; responseTime?: number };
    google: { status: "online" | "offline" | "error"; responseTime?: number };
    anthropic: {
      status: "online" | "offline" | "error";
      responseTime?: number;
    };
  };
  jobProcessor: {
    status: "running" | "stopped" | "error";
    activeJobs?: number;
  };
}

interface ActiveUser {
  id: string;
  name: string | null;
  email: string | null;
  lastActive: Date;
  currentPage: string | null;
  sessionDuration: number;
  actions: number;
}

export default function BackgroundTasksAdmin() {
  const { data: session, status } = useSession();
  const [jobs, setJobs] = useState<BackgroundJob[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedJob, setSelectedJob] = useState<BackgroundJob | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [storyStats, setStoryStats] = useState<any>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Check authentication and role
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      redirect("/auth/signin");
    }

    if (session.user.role !== "ADMIN") {
      redirect("/");
    }

    loadData();
  }, [session, status]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadData();
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadData = useCallback(async () => {
    try {
      // Add timeout to prevent hanging requests
      const timeoutController = new AbortController();
      const timeoutId = setTimeout(() => timeoutController.abort(), 15000); // 15 second timeout

      const requests = [
        fetch("/api/admin/background-tasks", { signal: timeoutController.signal }),
        fetch("/api/admin/active-users", { signal: timeoutController.signal }),
        fetch("/api/admin/system-status", { signal: timeoutController.signal }),
        fetch("/api/admin/story-settings", { signal: timeoutController.signal }),
      ];

      const responses = await Promise.all(
        requests.map(request => 
          request.catch(error => {
            console.warn("Request failed:", error);
            return null;
          })
        )
      );

      clearTimeout(timeoutId);

      const [jobsResponse, usersResponse, statusResponse, storyResponse] = responses;

      // Handle jobs data
      if (jobsResponse?.ok) {
        try {
          const jobsData = await jobsResponse.json();
          setJobs(jobsData.jobs || []);
        } catch (parseError) {
          console.error("Failed to parse jobs data:", parseError);
          setJobs([]);
        }
      } else {
        console.warn("Jobs request failed or null");
        setJobs([]);
      }

      // Handle users data
      if (usersResponse?.ok) {
        try {
          const usersData = await usersResponse.json();
          setActiveUsers(usersData.users || []);
        } catch (parseError) {
          console.error("Failed to parse users data:", parseError);
          setActiveUsers([]);
        }
      } else {
        console.warn("Users request failed or null");
        setActiveUsers([]);
      }

      // Handle status data
      if (statusResponse?.ok) {
        try {
          const statusData = await statusResponse.json();
          setSystemStatus(statusData);
        } catch (parseError) {
          console.error("Failed to parse status data:", parseError);
          setSystemStatus(null);
        }
      } else {
        console.warn("Status request failed or null");
        setSystemStatus(null);
      }

      // Handle story stats data
      if (storyResponse?.ok) {
        try {
          const storyData = await storyResponse.json();
          setStoryStats(storyData.stats);
        } catch (parseError) {
          console.error("Failed to parse story data:", parseError);
          setStoryStats(null);
        }
      } else {
        console.warn("Story request failed or null");
        setStoryStats(null);
      }

      setError(null);
    } catch (err) {
      console.error("Failed to load background tasks data:", err);
      if (err instanceof Error && err.name === 'AbortError') {
        setError("Request timed out. The server may be experiencing high load.");
      } else {
        setError("Failed to load data. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleJobAction = async (jobId: string, action: string) => {
    try {
      setActionLoading(jobId);
      const response = await fetch(
        `/api/admin/background-tasks/${jobId}/${action}`,
        {
          method: "POST",
        },
      );

      if (response.ok) {
        const data = await response.json();

        if (action === "debug" && data.job?.jobDetails) {
          // Show debug information
          const details = data.job.jobDetails;
          const debugInfo = `
Job Debug Information:
===================
ID: ${details.id}
Status: ${details.status}
User: ${details.user?.name || details.user?.email || "Unknown"}
File: ${details.fileName}
Provider: ${details.provider}
Model: ${details.modelId}
Template: ${details.templateId}
Retry Count: ${details.retryCount}
Created: ${new Date(details.createdAt).toLocaleString()}
Started: ${details.startedAt ? new Date(details.startedAt).toLocaleString() : "Not started"}
Completed: ${details.completedAt ? new Date(details.completedAt).toLocaleString() : "Not completed"}
Current Step: ${details.currentStep || "None"}
Progress: ${details.progress}%
Error: ${details.error || "None"}
Can Retry: ${details.isRetryable ? "Yes" : "No"}
Can Cancel: ${details.canCancel ? "Yes" : "No"}

This information can help identify why the job failed.
Check your API keys, provider settings, and file format.
          `;
          alert(debugInfo);
        } else {
          await loadData(); // Refresh data for other actions
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || `Failed to ${action} job`);
      }
    } catch (err) {
      console.error(`Failed to ${action} job:`, err);
      setError(`Failed to ${action} job`);
    } finally {
      setActionLoading(null);
    }
  };

  // New bulk action function for unified system
  const handleBulkAction = async (jobIds: string[], action: string) => {
    try {
      setActionLoading('bulk');
      
      // Get the sources for each job
      const sources = jobIds.map(jobId => {
        const job = jobs.find(j => j.id === jobId);
        return job?.source || 'backgroundJob'; // fallback to backgroundJob if not found
      });

      const response = await fetch('/api/admin/background-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          jobIds,
          sources
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Bulk ${action} completed:`, data);
        await loadData(); // Refresh data
      } else {
        const errorData = await response.json();
        setError(errorData.error || `Failed to ${action} jobs`);
      }
    } catch (err) {
      console.error(`Failed to ${action} jobs:`, err);
      setError(`Failed to ${action} jobs`);
    } finally {
      setActionLoading(null);
    }
  };

  // Enhanced individual job action that works with unified system
  const handleSingleJobAction = async (job: BackgroundJob, action: string) => {
    await handleBulkAction([job.id], action);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500";
      case "PROCESSING":
        return "bg-blue-500";
      case "PENDING":
        return "bg-yellow-500";
      case "FAILED":
        return "bg-red-500";
      case "CANCELLED":
        return "bg-gray-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4" />;
      case "PROCESSING":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "FAILED":
        return <XCircle className="h-4 w-4" />;
      case "CANCELLED":
        return <Square className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getSystemStatusColor = (status: string) => {
    switch (status) {
      case "online":
      case "running":
        return "text-green-600";
      case "offline":
      case "stopped":
        return "text-red-600";
      case "error":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  const getJobTypeInfo = (type: string) => {
    switch (type) {
      case "ANALYSIS":
        return {
          label: "Analysis",
          icon: BarChart3,
          color: "text-blue-400",
          bgColor: "bg-blue-500/20",
          borderColor: "border-blue-500/30"
        };
      case "STORY_GENERATION":
        return {
          label: "Story",
          icon: BookOpen,
          color: "text-purple-400",
          bgColor: "bg-purple-500/20",
          borderColor: "border-purple-500/30"
        };
      case "EMAIL":
        return {
          label: "Email",
          icon: Bell,
          color: "text-green-400",
          bgColor: "bg-green-500/20",
          borderColor: "border-green-500/30"
        };
      default:
        return {
          label: type || "Unknown",
          icon: Activity,
          color: "text-gray-400",
          bgColor: "bg-gray-500/20",
          borderColor: "border-gray-500/30"
        };
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    const matchesType = typeFilter === "all" || job.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-white/70">Loading background tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6 relative overflow-hidden">
      {/* Neural background particles - background tasks theme */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 left-8 sm:left-20 w-2 h-2 bg-orange-400/20 rounded-full animate-pulse motion-reduce:animate-none"></div>
        <div className="absolute top-48 right-12 sm:right-32 w-1 h-1 bg-cyan-400/25 rounded-full animate-ping motion-reduce:animate-none"></div>
        <div className="absolute bottom-32 left-6 sm:left-16 w-1.5 h-1.5 bg-purple-400/20 rounded-full animate-pulse motion-reduce:animate-none" style={{animationDelay: '1.2s'}}></div>
        <div className="absolute bottom-12 right-20 w-1 h-1 bg-green-400/25 rounded-full animate-ping motion-reduce:animate-none" style={{animationDelay: '2.1s'}}></div>
        <div className="absolute top-1/3 left-32 w-2 h-2 bg-blue-300/15 rounded-full animate-pulse motion-reduce:animate-none" style={{animationDelay: '0.9s'}}></div>
      </div>
      
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Activity className="h-8 w-8 text-orange-400" />
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Background Tasks Management
                  </h1>
                  <p className="text-white/70">
                    Monitor and control all background processing tasks
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={cn(
                    "bg-white/10 border-white/20 text-white hover:bg-white/20",
                    autoRefresh && "bg-orange-500/20 border-orange-400/30 text-orange-300"
                  )}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${autoRefresh ? "animate-spin" : ""}`}
                  />
                  Auto-refresh {autoRefresh ? "ON" : "OFF"}
                </Button>
                <Button 
                  onClick={loadData} 
                  disabled={loading}
                  className="bg-gradient-to-r from-orange-500 to-purple-500 hover:from-orange-600 hover:to-purple-600 text-white h-12 touch-manipulation hover:scale-[1.02] transition-all duration-300"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="bg-red-500/20 border-red-500/30 text-white mb-6 backdrop-blur-sm">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* System Status Overview */}
          {systemStatus && (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Server className="h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="text-center">
                  <Database className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-sm font-medium text-white">Database</p>
                  <p
                    className={`text-xs ${getSystemStatusColor(
                      systemStatus.database.status,
                    )}`}
                  >
                    {systemStatus.database.status}
                  </p>
                </div>
                <div className="text-center">
                  <Zap className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-sm font-medium text-white">Redis</p>
                  <p
                    className={`text-xs ${getSystemStatusColor(
                      systemStatus.redis.status,
                    )}`}
                  >
                    {systemStatus.redis.status}
                  </p>
                </div>
                <div className="text-center">
                  <Activity className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-sm font-medium text-white">Job Processor</p>
                  <p
                    className={`text-xs ${getSystemStatusColor(
                      systemStatus.jobProcessor.status,
                    )}`}
                  >
                    {systemStatus.jobProcessor.status}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-6 h-6 mx-auto mb-2 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">AI</span>
                  </div>
                  <p className="text-sm font-medium text-white">OpenAI</p>
                  <p
                    className={`text-xs ${getSystemStatusColor(
                      systemStatus.aiProviders.openai.status,
                    )}`}
                  >
                    {systemStatus.aiProviders.openai.status}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-6 h-6 mx-auto mb-2 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">G</span>
                  </div>
                  <p className="text-sm font-medium text-white">Google AI</p>
                  <p
                    className={`text-xs ${getSystemStatusColor(
                      systemStatus.aiProviders.google.status,
                    )}`}
                  >
                    {systemStatus.aiProviders.google.status}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-6 h-6 mx-auto mb-2 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">A</span>
                  </div>
                  <p className="text-sm font-medium text-white">Anthropic</p>
                  <p
                    className={`text-xs ${getSystemStatusColor(
                      systemStatus.aiProviders.anthropic.status,
                    )}`}
                  >
                    {systemStatus.aiProviders.anthropic.status}
                  </p>
                </div>
              </div>
              </CardContent>
            </Card>
          )}

          {/* Story Generation Statistics */}
          {storyStats && (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <BookOpen className="h-5 w-5" />
                  Story Generation Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div className="text-center">
                    <Sparkles className="h-6 w-6 mx-auto mb-2 text-purple-400" />
                    <p className="text-sm font-medium text-white">Total Stories</p>
                    <p className="text-lg font-bold text-purple-400">
                      {storyStats.totalStories || 0}
                    </p>
                  </div>
                  <div className="text-center">
                    <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-400" />
                    <p className="text-sm font-medium text-white">Completed</p>
                    <p className="text-lg font-bold text-green-400">
                      {storyStats.completedStories || 0}
                    </p>
                  </div>
                  <div className="text-center">
                    <XCircle className="h-6 w-6 mx-auto mb-2 text-red-400" />
                    <p className="text-sm font-medium text-white">Failed</p>
                    <p className="text-lg font-bold text-red-400">
                      {storyStats.failedStories || 0}
                    </p>
                  </div>
                  <div className="text-center">
                    <Loader2 className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                    <p className="text-sm font-medium text-white">Generating</p>
                    <p className="text-lg font-bold text-blue-400">
                      {storyStats.generatingStories || 0}
                    </p>
                  </div>
                  <div className="text-center">
                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-yellow-400" />
                    <p className="text-sm font-medium text-white">Success Rate</p>
                    <p className="text-lg font-bold text-yellow-400">
                      {storyStats.successRate || 0}%
                    </p>
                  </div>
                  <div className="text-center">
                    <Users className="h-6 w-6 mx-auto mb-2 text-cyan-400" />
                    <p className="text-sm font-medium text-white">Pro Users</p>
                    <p className="text-lg font-bold text-cyan-400">
                      {storyStats.proUsers || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="tasks" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-sm border border-white/20">
              <TabsTrigger value="tasks" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">Background Tasks</TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">Active Users</TabsTrigger>
              <TabsTrigger value="monitoring" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">Real-time Monitoring</TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="space-y-6">
              {/* Controls */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group">
                <CardHeader>
                  <CardTitle className="text-white">Task Controls</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-64">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
                      <Input
                        placeholder="Search jobs by file name, user, or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                      <FileText className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="ANALYSIS">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          Analysis
                        </div>
                      </SelectItem>
                      <SelectItem value="STORY_GENERATION">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Story Generation
                        </div>
                      </SelectItem>
                      <SelectItem value="EMAIL">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4" />
                          Email
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PROCESSING">Processing</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="FAILED">Failed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                </CardContent>
              </Card>

              {/* Jobs Table */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group">
                <CardHeader>
                  <CardTitle className="text-white">Background Jobs ({filteredJobs.length})</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="space-y-4">
                  {filteredJobs.length === 0 ? (
                    <div className="text-center py-8 text-white/60">
                      No background jobs found.
                    </div>
                  ) : (
                    filteredJobs.map((job) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-white/20 rounded-lg p-4 space-y-3 bg-white/5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-2 h-2 rounded-full ${getStatusColor(job.status)}`}
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-white">
                                  {job.fileName || "Unknown File"}
                                </p>
                                {/* System source indicator */}
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "text-xs",
                                    job.source === 'taskQueue' 
                                      ? "bg-green-500/20 border-green-500/30 text-green-300" 
                                      : "bg-blue-500/20 border-blue-500/30 text-blue-300"
                                  )}
                                >
                                  {job.source === 'taskQueue' ? 'Task Queue' : 'Background Job'}
                                </Badge>
                                {(() => {
                                  const typeInfo = getJobTypeInfo(job.type);
                                  const TypeIcon = typeInfo.icon;
                                  return (
                                    <Badge 
                                      variant="outline" 
                                      className={cn(
                                        "flex items-center gap-1 text-xs",
                                        typeInfo.bgColor,
                                        typeInfo.borderColor,
                                        typeInfo.color
                                      )}
                                    >
                                      <TypeIcon className="h-3 w-3" />
                                      {typeInfo.label}
                                    </Badge>
                                  );
                                })()}
                              </div>
                              <p className="text-sm text-white/60">
                                {job.user.name || job.user.email} •{" "}
                                {job.id.slice(0, 8)}
                                {job.provider && job.modelId && (
                                  <span className="ml-2">
                                    • {job.provider}/{job.modelId}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              {getStatusIcon(job.status)}
                              {job.status}
                            </Badge>
                            <span className="text-sm text-white/60">
                              {job.progress}%
                            </span>
                          </div>
                        </div>

                        {job.status === "PROCESSING" && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>{job.currentStep}</span>
                              <span>{job.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <motion.div
                                className="bg-blue-600 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${job.progress}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm text-white/60">
                          <span>
                            Created: {new Date(job.createdAt).toLocaleString()}
                          </span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedJob(job)}
                              className="bg-white/10 border-white/20 text-white hover:bg-white/20 touch-manipulation hover:scale-105 transition-all duration-300"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            {job.type === "STORY_GENERATION" && job.status === "COMPLETED" && job.result?.storyId && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`/story/${job.result.storyId}`, '_blank')}
                                className="bg-purple-600/20 border-purple-500/30 text-purple-300 hover:bg-purple-600/30 touch-manipulation hover:scale-105 transition-all duration-300"
                              >
                                <BookOpen className="h-3 w-3 mr-1" />
                                View Story
                              </Button>
                            )}
                            {job.status === "PROCESSING" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleSingleJobAction(job, "cancel")
                                }
                                disabled={actionLoading === job.id}
                                className="bg-yellow-600/20 border-yellow-500/30 text-yellow-300 hover:bg-yellow-600/30 touch-manipulation hover:scale-105 transition-all duration-300"
                              >
                                <Square className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            )}
                            {job.status === "FAILED" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleSingleJobAction(job, "retry")
                                  }
                                  disabled={actionLoading === job.id}
                                  className="bg-green-600/20 border-green-500/30 text-green-300 hover:bg-green-600/30 touch-manipulation hover:scale-105 transition-all duration-300"
                                >
                                  <RefreshCw className="h-3 w-3 mr-1" />
                                  Retry
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleJobAction(job.id, "debug")
                                  }
                                  disabled={actionLoading === job.id}
                                  className="bg-blue-600/20 border-blue-500/30 text-blue-300 hover:bg-blue-600/30 touch-manipulation hover:scale-105 transition-all duration-300"
                                >
                                  <svg
                                    className="h-3 w-3 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  Debug
                                </Button>
                              </>
                            )}
                            {(job.status === "COMPLETED" ||
                              job.status === "FAILED" ||
                              job.status === "CANCELLED") && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleSingleJobAction(job, "delete")
                                }
                                disabled={actionLoading === job.id}
                                className="bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/30 touch-manipulation hover:scale-105 transition-all duration-300"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Users className="h-5 w-5" />
                    Active Users ({activeUsers.length})
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Users currently active on the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                <div className="space-y-4">
                  {activeUsers.length === 0 ? (
                    <div className="text-center py-8 text-white/60">
                      No active users found.
                    </div>
                  ) : (
                    activeUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 border border-white/20 rounded-lg bg-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <div>
                            <p className="font-medium text-white">
                              {user.name || "Anonymous"}
                            </p>
                            <p className="text-sm text-white/60">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-white/60">
                            {user.currentPage}
                          </p>
                          <p className="text-xs text-white/50">
                            {user.actions} actions •{" "}
                            {Math.round(user.sessionDuration / 60)}m session
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Activity className="h-5 w-5" />
                    Real-time System Monitoring
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <h3 className="font-medium text-white">Queue Status</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/70">Pending:</span>
                        <span className="text-white">
                          {jobs.filter((j) => j.status === "PENDING").length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Processing:</span>
                        <span className="text-white">
                          {jobs.filter((j) => j.status === "PROCESSING").length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Completed Today:</span>
                        <span className="text-white">
                          {
                            jobs.filter(
                              (j) =>
                                j.status === "COMPLETED" &&
                                new Date(
                                  j.completedAt || j.createdAt,
                                ).toDateString() === new Date().toDateString(),
                            ).length
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium text-white">Performance</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/70">Avg Duration:</span>
                        <span className="text-white">
                          {jobs.filter((j) => j.completedAt && j.startedAt)
                            .length > 0
                            ? Math.round(
                                jobs
                                  .filter((j) => j.completedAt && j.startedAt)
                                  .reduce(
                                    (acc, j) =>
                                      acc +
                                      (new Date(j.completedAt!).getTime() -
                                        new Date(j.startedAt!).getTime()),
                                    0,
                                  ) /
                                  jobs.filter(
                                    (j) => j.completedAt && j.startedAt,
                                  ).length /
                                  1000,
                              ) + "s"
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Success Rate:</span>
                        <span className="text-white">
                          {jobs.length > 0
                            ? Math.round(
                                (jobs.filter((j) => j.status === "COMPLETED")
                                  .length /
                                  jobs.length) *
                                  100,
                              ) + "%"
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium text-white">System Health</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/70">Active Users:</span>
                        <span className="text-white">{activeUsers.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">System Load:</span>
                        <span className="text-green-400">Normal</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Story Generation Metrics */}
                {storyStats && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Story Generation Metrics
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <h4 className="font-medium text-white text-sm">Generation Status</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-white/70">Active Generation:</span>
                            <span className="text-blue-400">
                              {jobs.filter((j) => j.type === "STORY_GENERATION" && j.status === "PROCESSING").length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">Stories Today:</span>
                            <span className="text-green-400">
                              {
                                jobs.filter(
                                  (j) =>
                                    j.type === "STORY_GENERATION" &&
                                    j.status === "COMPLETED" &&
                                    new Date(j.completedAt || j.createdAt).toDateString() === new Date().toDateString(),
                                ).length
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">Failed Today:</span>
                            <span className="text-red-400">
                              {
                                jobs.filter(
                                  (j) =>
                                    j.type === "STORY_GENERATION" &&
                                    j.status === "FAILED" &&
                                    new Date(j.updatedAt).toDateString() === new Date().toDateString(),
                                ).length
                              }
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-white text-sm">Generation Performance</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-white/70">Avg Duration:</span>
                            <span className="text-white">
                              {jobs.filter((j) => j.type === "STORY_GENERATION" && j.completedAt && j.startedAt).length > 0
                                ? Math.round(
                                    jobs
                                      .filter((j) => j.type === "STORY_GENERATION" && j.completedAt && j.startedAt)
                                      .reduce(
                                        (acc, j) =>
                                          acc +
                                          (new Date(j.completedAt!).getTime() -
                                            new Date(j.startedAt!).getTime()),
                                        0,
                                      ) /
                                      jobs.filter(
                                        (j) => j.type === "STORY_GENERATION" && j.completedAt && j.startedAt,
                                      ).length /
                                      1000,
                                  ) + "s"
                                : "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">Success Rate:</span>
                            <span className="text-white">
                              {storyStats.successRate || 0}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">Queue Length:</span>
                            <span className="text-yellow-400">
                              {jobs.filter((j) => j.type === "STORY_GENERATION" && j.status === "PENDING").length}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-white text-sm">User Analytics</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-white/70">Pro Users:</span>
                            <span className="text-purple-400">{storyStats.proUsers || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">Trial Users:</span>
                            <span className="text-cyan-400">{storyStats.activeTrialUsers || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">Total Stories:</span>
                            <span className="text-white">{storyStats.totalStories || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Job Details Modal */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedJob(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Job Details</h2>
                <Button variant="ghost" onClick={() => setSelectedJob(null)} className="text-white hover:bg-white/10">
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-white">ID:</span>
                    <p className="text-white/70">{selectedJob.id}</p>
                  </div>
                  <div>
                    <span className="font-medium text-white">Status:</span>
                    <p className="text-white/70">
                      {selectedJob.status}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-white">User:</span>
                    <p className="text-white/70">
                      {selectedJob.user.name || selectedJob.user.email}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-white">File:</span>
                    <p className="text-white/70">
                      {selectedJob.fileName}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-white">Provider:</span>
                    <p className="text-white/70">
                      {selectedJob.provider}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-white">Model:</span>
                    <p className="text-white/70">
                      {selectedJob.modelId}
                    </p>
                  </div>
                </div>

                {selectedJob.error && (
                  <div>
                    <span className="font-medium text-red-400">Error:</span>
                    <pre className="text-sm bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded mt-1 overflow-x-auto">
                      {selectedJob.error}
                    </pre>
                  </div>
                )}

                {selectedJob.result && (
                  <div>
                    <span className="font-medium text-white">Result:</span>
                    <pre className="text-sm bg-white/10 border border-white/20 text-white p-3 rounded mt-1 overflow-x-auto">
                      {JSON.stringify(selectedJob.result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
