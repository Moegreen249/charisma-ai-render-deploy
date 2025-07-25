"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  Clock,
  Loader2,
  Bell,
  Eye,
  Sparkles,
  ArrowRight,
  Home,
  History,
  Settings,
  RefreshCw,
} from "lucide-react";
import { useEnhancedLanguage } from "@/components/EnhancedLanguageProvider";

interface BackgroundProcessingViewProps {
  jobId?: string;
  fileName?: string;
  onComplete: (result: any) => void;
  onError: (error: string) => void;
}

interface JobStatus {
  id: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  progress: number;
  currentStep: string | null;
  totalSteps: number;
  result?: any;
  error?: string;
  estimatedTimeRemaining?: number;
  fileName?: string;
}

export default function BackgroundProcessingView({
  jobId,
  fileName,
  onComplete,
  onError,
}: BackgroundProcessingViewProps) {
  const { translations: t } = useEnhancedLanguage();
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [isPolling, setIsPolling] = useState(true);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [notificationSupported, setNotificationSupported] = useState(false);

  // Check notification support and request permission
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationSupported(true);

      if (Notification.permission === "granted") {
        setNotificationEnabled(true);
      } else if (Notification.permission === "default") {
        // Auto-request permission for better UX
        Notification.requestPermission().then((permission) => {
          setNotificationEnabled(permission === "granted");
        });
      }
    }
  }, []);

  // Poll job status
  useEffect(() => {
    if (!jobId || !isPolling) return;

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/background/analyze?jobId=${jobId}`);

        if (response.ok) {
          const data = await response.json();

          // Make sure we have job data
          if (data.success && data.job) {
            setJobStatus(data.job);

            // Check if job is complete
            if (data.job.status === "COMPLETED") {
              setIsPolling(false);

              // Send notification
              if (notificationEnabled && notificationSupported) {
                try {
                  new Notification("Analysis Complete!", {
                    body: `Your analysis for ${fileName || "conversation"} is ready to view.`,
                    icon: "/favicon.ico",
                    tag: "analysis-complete",
                  });
                } catch (notifError) {
                  console.warn("Failed to send notification:", notifError);
                }
              }

              // Call completion handler
              onComplete(data.job.result);
            } else if (data.job.status === "FAILED") {
              setIsPolling(false);

              if (notificationEnabled && notificationSupported) {
                try {
                  new Notification("Analysis Failed", {
                    body: `There was an error processing ${fileName || "your conversation"}.`,
                    icon: "/favicon.ico",
                    tag: "analysis-failed",
                  });
                } catch (notifError) {
                  console.warn("Failed to send notification:", notifError);
                }
              }

              onError(data.job.error || "Analysis failed");
            }
          }
        } else {
          console.error("Failed to fetch job status:", response.status);
        }
      } catch (error) {
        console.error("Error polling job status:", error);
      }
    };

    // Poll immediately, then every 3 seconds
    pollStatus();
    const interval = setInterval(pollStatus, 3000);

    return () => clearInterval(interval);
  }, [
    jobId,
    isPolling,
    notificationEnabled,
    notificationSupported,
    fileName,
    onComplete,
    onError,
  ]);

  const getStatusIcon = () => {
    if (!jobStatus) return <Clock className="h-6 w-6 text-gray-400" />;

    switch (jobStatus.status) {
      case "PENDING":
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case "PROCESSING":
        return <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />;
      case "COMPLETED":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "FAILED":
        return <CheckCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusMessage = () => {
    if (!jobStatus) return "Starting analysis...";

    switch (jobStatus.status) {
      case "PENDING":
        return "Your analysis is queued and will start shortly...";
      case "PROCESSING":
        return jobStatus.currentStep || "Processing your conversation...";
      case "COMPLETED":
        return "Analysis completed successfully!";
      case "FAILED":
        return "Analysis failed. Please try again.";
      default:
        return "Checking status...";
    }
  };

  const formatTimeRemaining = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* Main Status Card */}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="text-center">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="mx-auto mb-4"
            >
              <Sparkles className="h-12 w-12 text-primary" />
            </motion.div>
            <CardTitle className="text-2xl font-bold">
              Analysis in Progress
            </CardTitle>
            <CardDescription className="text-lg">
              {fileName && (
                <span className="block font-medium text-primary mb-2">
                  {fileName}
                </span>
              )}
              You're free to explore the platform while we work!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Section */}
            <div className="flex items-center justify-center space-x-3">
              {getStatusIcon()}
              <span className="text-lg font-medium">{getStatusMessage()}</span>
            </div>

            {/* Progress Bar */}
            {jobStatus && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    Step{" "}
                    {Math.ceil(
                      (jobStatus.progress / 100) * jobStatus.totalSteps,
                    )}{" "}
                    of {jobStatus.totalSteps}
                  </span>
                  <span>{jobStatus.progress}%</span>
                </div>
                <Progress value={jobStatus.progress} className="h-3" />
                {jobStatus.estimatedTimeRemaining &&
                  jobStatus.status === "PROCESSING" && (
                    <div className="text-center text-sm text-muted-foreground">
                      Estimated time remaining:{" "}
                      {formatTimeRemaining(jobStatus.estimatedTimeRemaining)}
                    </div>
                  )}
              </div>
            )}

            {/* Notification Settings */}
            {notificationSupported && (
              <Alert className="border-primary/20 bg-primary/10">
                <Bell className="h-4 w-4" />
                <AlertDescription>
                  {notificationEnabled ? (
                    <span className="text-green-700">
                      ✓ You'll receive a notification when your analysis is
                      complete.
                    </span>
                  ) : (
                    <>
                      <span className="text-orange-700">
                        Enable notifications to be alerted when your analysis is
                        ready.
                      </span>
                      <Button
                        variant="link"
                        className="ml-2 p-0 h-auto text-primary hover:text-primary/80"
                        onClick={() => {
                          Notification.requestPermission().then(
                            (permission) => {
                              setNotificationEnabled(permission === "granted");
                            },
                          );
                        }}
                      >
                        Enable Notifications
                      </Button>
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Navigation Suggestions */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              What would you like to do while you wait?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 flex-col space-y-2"
                onClick={() => (window.location.href = "/")}
              >
                <Home className="h-6 w-6" />
                <span>Upload Another File</span>
                <span className="text-xs text-muted-foreground">
                  Start a new analysis
                </span>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 flex-col space-y-2"
                onClick={() => (window.location.href = "/history")}
              >
                <History className="h-6 w-6" />
                <span>View History</span>
                <span className="text-xs text-muted-foreground">
                  Check past analyses
                </span>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 flex-col space-y-2"
                onClick={() => (window.location.href = "/settings")}
              >
                <Settings className="h-6 w-6" />
                <span>Settings</span>
                <span className="text-xs text-muted-foreground">
                  Configure preferences
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Manual Refresh */}
        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={() => {
              setIsPolling(false);
              setTimeout(() => setIsPolling(true), 100);
            }}
            className="text-muted-foreground"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Status
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
