"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  AlertTriangle,
  Play,
  Pause,
  Square,
  RefreshCw,
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  Settings,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Bell,
  Activity,
  Server,
  Database,
  Zap,
} from "lucide-react";

interface BackgroundJob {
  id: string;
  userId: string;
  user: {
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
      const [jobsResponse, usersResponse, statusResponse] = await Promise.all([
        fetch("/api/admin/background-tasks"),
        fetch("/api/admin/active-users"),
        fetch("/api/admin/system-status"),
      ]);

      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        setJobs(jobsData.jobs || []);
      }

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setActiveUsers(usersData.users || []);
      }

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setSystemStatus(statusData);
      }

      setError(null);
    } catch (err) {
      console.error("Failed to load background tasks data:", err);
      setError("Failed to load data. Please try again.");
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

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || job.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading background tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Activity className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-card-foreground">
                  Background Tasks Management
                </h1>
                <p className="text-muted-foreground">
                  Monitor and control all background processing tasks
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
              <Button onClick={loadData} disabled={loading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* System Status Overview */}
        {systemStatus && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="text-center">
                  <Database className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-sm font-medium">Database</p>
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
                  <p className="text-sm font-medium">Redis</p>
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
                  <p className="text-sm font-medium">Job Processor</p>
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
                  <p className="text-sm font-medium">OpenAI</p>
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
                  <p className="text-sm font-medium">Google AI</p>
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
                  <p className="text-sm font-medium">Anthropic</p>
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

        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tasks">Background Tasks</TabsTrigger>
            <TabsTrigger value="users">Active Users</TabsTrigger>
            <TabsTrigger value="monitoring">Real-time Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-6">
            {/* Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Task Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-64">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search jobs by file name, user, or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
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
            <Card>
              <CardHeader>
                <CardTitle>Background Jobs ({filteredJobs.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredJobs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No background jobs found.
                    </div>
                  ) : (
                    filteredJobs.map((job) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-2 h-2 rounded-full ${getStatusColor(job.status)}`}
                            />
                            <div>
                              <p className="font-medium">
                                {job.fileName || "Unknown File"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {job.user.name || job.user.email} •{" "}
                                {job.id.slice(0, 8)}
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
                            <span className="text-sm text-muted-foreground">
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

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>
                            Created: {new Date(job.createdAt).toLocaleString()}
                          </span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedJob(job)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            {job.status === "PROCESSING" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleJobAction(job.id, "cancel")
                                }
                                disabled={actionLoading === job.id}
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
                                    handleJobAction(job.id, "retry")
                                  }
                                  disabled={actionLoading === job.id}
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
                                  className="text-blue-600 hover:text-blue-700"
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
                                  handleJobAction(job.id, "delete")
                                }
                                disabled={actionLoading === job.id}
                                className="text-red-600 hover:text-red-700"
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Active Users ({activeUsers.length})
                </CardTitle>
                <CardDescription>
                  Users currently active on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeUsers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No active users found.
                    </div>
                  ) : (
                    activeUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <div>
                            <p className="font-medium">
                              {user.name || "Anonymous"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-muted-foreground">
                            {user.currentPage}
                          </p>
                          <p className="text-xs text-muted-foreground">
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Real-time System Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <h3 className="font-medium">Queue Status</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Pending:</span>
                        <span>
                          {jobs.filter((j) => j.status === "PENDING").length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Processing:</span>
                        <span>
                          {jobs.filter((j) => j.status === "PROCESSING").length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completed Today:</span>
                        <span>
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
                    <h3 className="font-medium">Performance</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Avg Duration:</span>
                        <span>
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
                        <span>Success Rate:</span>
                        <span>
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
                    <h3 className="font-medium">System Health</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Active Users:</span>
                        <span>{activeUsers.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>System Load:</span>
                        <span className="text-green-600">Normal</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Job Details Modal */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedJob(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Job Details</h2>
                <Button variant="ghost" onClick={() => setSelectedJob(null)}>
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">ID:</span>
                    <p className="text-muted-foreground">{selectedJob.id}</p>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <p className="text-muted-foreground">
                      {selectedJob.status}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">User:</span>
                    <p className="text-muted-foreground">
                      {selectedJob.user.name || selectedJob.user.email}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">File:</span>
                    <p className="text-muted-foreground">
                      {selectedJob.fileName}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Provider:</span>
                    <p className="text-muted-foreground">
                      {selectedJob.provider}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Model:</span>
                    <p className="text-muted-foreground">
                      {selectedJob.modelId}
                    </p>
                  </div>
                </div>

                {selectedJob.error && (
                  <div>
                    <span className="font-medium text-red-600">Error:</span>
                    <pre className="text-sm bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded mt-1 overflow-x-auto">
                      {selectedJob.error}
                    </pre>
                  </div>
                )}

                {selectedJob.result && (
                  <div>
                    <span className="font-medium">Result:</span>
                    <pre className="text-sm bg-muted border p-3 rounded mt-1 overflow-x-auto">
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
