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
import { X, Clock, Sparkles, FileText, RefreshCw, History,  } from "lucide-react";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import { useEnhancedLanguage } from "@/components/EnhancedLanguageProvider";
import { themeConfig } from "@/lib/theme-config";
import { cn } from "@/lib/utils";

interface BackgroundJob {
  id: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  progress: number;
  currentStep: string;
  totalSteps: number;
  error?: string;
  result?: AnalysisResult;
  fileName: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  estimatedTimeRemaining?: number;
  isComplete?: boolean;
}

interface AnalysisResult {
  templateId?: string;
  analysisData?: unknown;
  result?: unknown;
  [key: string]: unknown;
}

interface BackgroundAnalysisProps {
  onAnalysisComplete?: (result: AnalysisResult) => void;
  onError?: (error: string) => void;
}

interface AnalysisData {
  templateId: string;
  modelId: string;
  provider: string;
  fileName: string;
  fileContent: string;
}

interface BackgroundAnalysisRef {
  startAnalysis: (data: AnalysisData) => Promise<void>;
}

const BackgroundAnalysis = forwardRef<
  BackgroundAnalysisRef,
  BackgroundAnalysisProps
>(({ onAnalysisComplete, onError }, ref) => {
  const { data: session } = useSession();
  useEnhancedLanguage();
  const [currentJob, setCurrentJob] = useState<BackgroundJob | null>(null);
  const [recentJobs, setRecentJobs] = useState<BackgroundJob[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

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
  const startBackgroundAnalysis = useCallback(
    async (analysisData: AnalysisData) => {
      try {
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
        // Analysis completed
      }
    },
    [pollJobStatus, onError],
  );

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

  // Expose startAnalysis method via ref
  useImperativeHandle(
    ref,
    () => ({
      startAnalysis: startBackgroundAnalysis,
    }),
    [startBackgroundAnalysis],
  );

  // Get status icon and color
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "PENDING":
        return { icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/20 border-yellow-500/30" };
      case "PROCESSING":
        return { icon: Loader2, color: "text-blue-400", bg: "bg-blue-500/20 border-blue-500/30" };
      case "COMPLETED":
        return {
          icon: CheckCircle,
          color: "text-green-400",
          bg: "bg-green-500/20 border-green-500/30",
        };
      case "FAILED":
        return { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/20 border-red-500/30" };
      case "CANCELLED":
        return { icon: X, color: "text-gray-400", bg: "bg-gray-500/20 border-gray-500/30" };
      default:
        return { icon: Clock, color: "text-gray-400", bg: "bg-gray-500/20 border-gray-500/30" };
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
            <Card className={cn(
              "border-l-4 border-l-purple-500",
              themeConfig.colors.glass.background,
              themeConfig.colors.glass.border,
              themeConfig.colors.glass.shadow,
              "border"
            )}>
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
                        <div className={cn("p-2 rounded-full border", bg)}>
                          <StatusIcon
                            className={`h-4 w-4 ${color} ${currentJob.status === "PROCESSING" ? "animate-spin" : ""}`}
                          />
                        </div>
                      );
                    })()}
                    <div>
                      <CardTitle className="text-lg text-white">
                        {"Background Analysis"}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 text-gray-400">
                        <FileText className="h-3 w-3" />
                        {currentJob.fileName}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={cn(
                        currentJob.status === "COMPLETED"
                          ? "bg-green-600/20 border-green-500/30 text-green-200"
                          : "bg-blue-600/20 border-blue-500/30 text-blue-200"
                      )}
                    >
                      {currentJob.status}
                    </Badge>
                    {(currentJob.status === "PENDING" ||
                      currentJob.status === "PROCESSING") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={cancelJob}
                        className={cn(
                          "bg-white/10 border-white/20 text-red-400",
                          "hover:bg-red-500/10 hover:border-red-500/30",
                          themeConfig.animation.transition
                        )}
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
                      <span className="text-gray-400">
                        {currentJob.currentStep}
                      </span>
                      <span className="text-gray-400">
                        {currentJob.progress}%
                      </span>
                    </div>
                    <Progress value={currentJob.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-400">
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
                    <Alert className="bg-red-500/10 border-red-500/20 text-red-300">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{currentJob.error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Completion Message */}
                  {currentJob.status === "COMPLETED" && (
                    <Alert className="bg-green-500/10 border-green-500/20 text-green-300">
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
                    <div className="flex items-center gap-2 text-xs text-gray-400">
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
          className={cn(
            "gap-2",
            "bg-white/10 border-white/20 text-white",
            "hover:bg-white/20 hover:border-white/30",
            themeConfig.animation.transition
          )}
        >
          <History className="h-4 w-4" />
          Recent Jobs ({recentJobs.length})
        </Button>
        {recentJobs.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={loadRecentJobs}
            className={cn(
              "gap-2",
              "text-gray-400 hover:text-white hover:bg-white/10",
              themeConfig.animation.transition
            )}
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
              <Card className={cn(
                themeConfig.colors.glass.background,
                themeConfig.colors.glass.border,
                themeConfig.colors.glass.shadow,
                "border"
              )}>
                <CardContent className="p-6 text-center text-gray-400">
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
                    <Card className={cn(
                      "hover:shadow-md transition-shadow",
                      themeConfig.colors.glass.background,
                      themeConfig.colors.glass.border,
                      themeConfig.colors.glass.shadow,
                      "border"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn("p-1.5 rounded-full border", bg)}>
                              <StatusIcon className={`h-3 w-3 ${color}`} />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-white">
                                {job.fileName}
                              </p>
                              <p className="text-xs text-gray-400">
                                {new Date(job.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs border-white/20 text-white bg-white/5">
                              {job.status}
                            </Badge>
                            {job.status === "COMPLETED" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  job.result && onAnalysisComplete?.(job.result)
                                }
                                className={cn(
                                  "text-xs",
                                  "text-gray-400 hover:text-white hover:bg-white/10",
                                  themeConfig.animation.transition
                                )}
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


    </div>
  );
});

BackgroundAnalysis.displayName = "BackgroundAnalysis";

export default BackgroundAnalysis;

// Export a hook for easier usage
export function useBackgroundAnalysis() {
  const [analysisRef, setAnalysisRef] = useState<BackgroundAnalysisRef | null>(
    null,
  );

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
