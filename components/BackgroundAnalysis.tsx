"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useSession } from "next-auth/react";
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
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Play,
  Pause,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  FileText,
  RefreshCw,
  History,
  Loader2,
} from "lucide-react";
import { useEnhancedLanguage } from "@/components/EnhancedLanguageProvider";

interface BackgroundJob {
  id: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  progress: number;
  currentStep: string;
  totalSteps: number;
  error?: string;
  result?: any;
  fileName: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  estimatedTimeRemaining?: number;
  isComplete?: boolean;
}

interface BackgroundAnalysisProps {
  onAnalysisComplete?: (result: any) => void;
  onError?: (error: string) => void;
}

interface BackgroundAnalysisRef {
  startAnalysis: (data: {
    templateId: string;
    modelId: string;
    provider: string;
    fileName: string;
    fileContent: string;
  }) => Promise<void>;
}

const BackgroundAnalysis = forwardRef<
  BackgroundAnalysisRef,
  BackgroundAnalysisProps
>(({ onAnalysisComplete, onError }, ref) => {
  const { data: session } = useSession();
  const { translations: t } = useEnhancedLanguage();
  const [currentJob, setCurrentJob] = useState<BackgroundJob | null>(null);
  const [recentJobs, setRecentJobs] = useState<BackgroundJob[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Poll for job updates
  const pollJobStatus = useCallback(
    async (jobId: string) => {
      try {
        const response = await fetch(`/api/background/analyze?jobId=${jobId}`);
        const data = await response.json();

        if (data.success && data.job) {
          const job = data.job;
          setCurrentJob(job);

          // Stop polling if job is complete
          if (
            job.status === "COMPLETED" ||
            job.status === "FAILED" ||
            job.status === "CANCELLED"
          ) {
            setIsPolling(false);

            if (job.status === "COMPLETED" && job.result) {
              onAnalysisComplete?.(job.result);
            } else if (job.status === "FAILED" && job.error) {
              onError?.(job.error);
            }
          }
        }
      } catch (error) {
        console.error("Failed to poll job status:", error);
        setIsPolling(false);
      }
    },
    [onAnalysisComplete, onError],
  );

  // Start background analysis
  const startBackgroundAnalysis = async (analysisData: {
    templateId: string;
    modelId: string;
    provider: string;
    fileName: string;
    fileContent: string;
  }) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/background/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analysisData),
      });

      const data = await response.json();

      if (data.success && data.jobId) {
        setCurrentJob({
          id: data.jobId,
          status: "PENDING",
          progress: 0,
          currentStep: "Queued for processing",
          totalSteps: 4,
          fileName: analysisData.fileName,
          createdAt: new Date(),
        });

        setIsPolling(true);
        // Start polling immediately
        pollJobStatus(data.jobId);
      } else {
        onError?.(data.error || "Failed to start background analysis");
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel current job
  const cancelJob = async () => {
    if (!currentJob) return;

    try {
      const response = await fetch(
        `/api/background/analyze?jobId=${currentJob.id}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (data.success) {
        setCurrentJob({ ...currentJob, status: "CANCELLED" });
        setIsPolling(false);
      }
    } catch (error) {
      console.error("Failed to cancel job:", error);
    }
  };

  // Load recent jobs
  const loadRecentJobs = async () => {
    try {
      const response = await fetch("/api/background/analyze?limit=5");
      const data = await response.json();

      if (data.success) {
        setRecentJobs(data.jobs || []);
      }
    } catch (error) {
      console.error("Failed to load recent jobs:", error);
    }
  };

  // Setup polling interval
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (
      isPolling &&
      currentJob &&
      currentJob.status !== "COMPLETED" &&
      currentJob.status !== "FAILED" &&
      currentJob.status !== "CANCELLED"
    ) {
      interval = setInterval(() => {
        pollJobStatus(currentJob.id);
      }, 2000); // Poll every 2 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPolling, currentJob, pollJobStatus]);

  // Load recent jobs on mount
  useEffect(() => {
    if (session?.user?.id) {
      loadRecentJobs();
    }
  }, [session?.user?.id]);

  // Get status icon and color
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "PENDING":
        return { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-100" };
      case "PROCESSING":
        return { icon: Loader2, color: "text-blue-500", bg: "bg-blue-100" };
      case "COMPLETED":
        return {
          icon: CheckCircle,
          color: "text-green-500",
          bg: "bg-green-100",
        };
      case "FAILED":
        return { icon: AlertCircle, color: "text-red-500", bg: "bg-red-100" };
      case "CANCELLED":
        return { icon: X, color: "text-gray-500", bg: "bg-gray-100" };
      default:
        return { icon: Clock, color: "text-gray-500", bg: "bg-gray-100" };
    }
  };

  // Format time remaining
  const formatTimeRemaining = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.ceil(seconds / 60);
    return `${minutes}m`;
  };

  if (!session?.user?.id) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Current Job Status */}
      <AnimatePresence>
        {currentJob && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const {
                        icon: StatusIcon,
                        color,
                        bg,
                      } = getStatusDisplay(currentJob.status);
                      return (
                        <div className={`p-2 rounded-full ${bg}`}>
                          <StatusIcon
                            className={`h-4 w-4 ${color} ${currentJob.status === "PROCESSING" ? "animate-spin" : ""}`}
                          />
                        </div>
                      );
                    })()}
                    <div>
                      <CardTitle className="text-lg">
                        {"Background Analysis"}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <FileText className="h-3 w-3" />
                        {currentJob.fileName}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        currentJob.status === "COMPLETED"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {currentJob.status}
                    </Badge>
                    {(currentJob.status === "PENDING" ||
                      currentJob.status === "PROCESSING") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={cancelJob}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {currentJob.currentStep}
                      </span>
                      <span className="text-muted-foreground">
                        {currentJob.progress}%
                      </span>
                    </div>
                    <Progress value={currentJob.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        Step{" "}
                        {Math.ceil(
                          (currentJob.progress / 100) * currentJob.totalSteps,
                        )}{" "}
                        of {currentJob.totalSteps}
                      </span>
                      {currentJob.estimatedTimeRemaining &&
                        currentJob.status === "PROCESSING" && (
                          <span>
                            ~
                            {formatTimeRemaining(
                              currentJob.estimatedTimeRemaining,
                            )}{" "}
                            remaining
                          </span>
                        )}
                    </div>
                  </div>

                  {/* Error Display */}
                  {currentJob.status === "FAILED" && currentJob.error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{currentJob.error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Completion Message */}
                  {currentJob.status === "COMPLETED" && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        {
                          "Analysis completed successfully! Check your history to view results."
                        }
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Real-time Updates Indicator */}
                  {isPolling && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      Live updates enabled
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Jobs History Toggle */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHistory(!showHistory)}
          className="gap-2"
        >
          <History className="h-4 w-4" />
          Recent Jobs ({recentJobs.length})
        </Button>
        {recentJobs.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={loadRecentJobs}
            className="gap-2"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </Button>
        )}
      </div>

      {/* Recent Jobs List */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            {recentJobs.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No recent analysis jobs found.</p>
                </CardContent>
              </Card>
            ) : (
              recentJobs.map((job) => {
                const {
                  icon: StatusIcon,
                  color,
                  bg,
                } = getStatusDisplay(job.status);
                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-full ${bg}`}>
                              <StatusIcon className={`h-3 w-3 ${color}`} />
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {job.fileName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(job.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {job.status}
                            </Badge>
                            {job.status === "COMPLETED" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onAnalysisComplete?.(job.result)}
                                className="text-xs"
                              >
                                View Results
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coming Soon Features */}
      <Card className="border-dashed border-2">
        <CardContent className="p-6 text-center">
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Sparkles className="h-5 w-5" />
              <span className="font-medium">Coming Soon</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="space-y-1">
                <p className="font-medium">🔄 Bulk Analysis</p>
                <p>Process multiple conversations at once</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium">📊 Analysis Comparison</p>
                <p>Compare results across conversations</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium">📈 Historical Trends</p>
                <p>Track communication patterns over time</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium">🤖 Smart Recommendations</p>
                <p>AI-powered insights and suggestions</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  useImperativeHandle(
    ref,
    () => ({
      startAnalysis: startBackgroundAnalysis,
    }),
    [startBackgroundAnalysis],
  );
});

BackgroundAnalysis.displayName = "BackgroundAnalysis";

export default BackgroundAnalysis;

// Export a hook for easier usage
export function useBackgroundAnalysis() {
  const [analysisRef, setAnalysisRef] = useState<any>(null);

  const startAnalysis = useCallback(
    (data: {
      templateId: string;
      modelId: string;
      provider: string;
      fileName: string;
      fileContent: string;
    }) => {
      if (analysisRef?.startAnalysis) {
        return analysisRef.startAnalysis(data);
      }
      throw new Error("Background analysis component not ready");
    },
    [analysisRef],
  );

  return {
    BackgroundAnalysisComponent: (props: BackgroundAnalysisProps) => (
      <BackgroundAnalysis ref={setAnalysisRef} {...props} />
    ),
    startAnalysis,
  };
}
