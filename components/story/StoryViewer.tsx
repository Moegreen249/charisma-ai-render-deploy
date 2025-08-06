"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StoryComponentErrorBoundary } from "./StoryErrorBoundary";
import { useApiRetry } from "@/lib/hooks/useRetry";
import { useStoryWebSocket } from "@/hooks/useWebSocket";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Clock, Calendar, Lightbulb, Crown, Download, FileText } from "lucide-react";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import { format } from "date-fns";
import Link from "next/link";
import { themeConfig } from "@/lib/theme-config";
import { cn } from "@/lib/utils";
import StoryTimeline from "./StoryTimeline";

interface Story {
  id: string;
  title: string;
  content: any;
  status: string;
  generatedAt: string | Date;
  aiProvider: string;
  modelId: string;
  processingTime?: number;
  promptVersion: string;
  errorMessage?: string;
  analysis: {
    fileName: string;
    provider: string;
    modelId: string;
    analysisDate: string | Date;
    templateId: string;
  };
}

interface StoryViewerProps {
  story: Story;
}

export default function StoryViewer({ story: initialStory }: StoryViewerProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [story, setStory] = useState(initialStory);

  // Use WebSocket for real-time story updates
  const { 
    isConnected, 
    connectionError, 
    storyUpdates, 
    currentStatus 
  } = useStoryWebSocket(story.id);

  // Update story state when WebSocket provides updates
  useEffect(() => {
    if (currentStatus && currentStatus !== story.status) {
      setStory(prev => ({ ...prev, status: currentStatus }));
    }
  }, [currentStatus, story.status]);

  // Handle story completion - refresh page to get the completed content
  useEffect(() => {
    if (currentStatus === 'COMPLETED' && story.status !== 'COMPLETED') {
      // Refresh the page to get the completed story content
      window.location.reload();
    }
  }, [currentStatus, story.status]);

  // Use retry hook for download operations
  const downloadRetry = useApiRetry({
    maxRetries: 2,
    onRetry: (attempt, error) => {
      console.log(`Retrying download (attempt ${attempt}):`, error.message);
    },
    onMaxRetriesReached: (error) => {
      alert(`Download failed after multiple attempts: ${error.message}`);
    }
  });

  const handleDownload = async () => {
    if (story.status !== 'COMPLETED' || !story.content) {
      alert('Story is not completed yet or content is not available');
      return;
    }

    const downloadOperation = async () => {
      setIsDownloading(true);
      
      const response = await fetch(`/api/stories/${story.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'download' }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to generate download`);
      }

      const data = await response.json();
      
      // Create blob and download
      const blob = new Blob([data.markdown], { type: 'text/markdown' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return data;
    };

    try {
      await downloadRetry.executeWithRetry(downloadOperation);
    } catch (error) {
      console.error('Download failed:', error);
      // Error is already handled by the retry hook's onMaxRetriesReached
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { 
          color: 'bg-green-500/20 text-green-300 border-green-500/30',
          text: 'Completed'
        };
      case 'GENERATING':
        return { 
          color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          text: 'Generating...'
        };
      case 'FAILED':
        return { 
          color: 'bg-red-500/20 text-red-300 border-red-500/30',
          text: 'Failed'
        };
      default:
        return { 
          color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
          text: 'Pending'
        };
    }
  };

  const statusInfo = getStatusInfo(story.status);

  return (
    <div className="container mx-auto px-4 py-8 relative overflow-hidden">
      {/* Neural background particles - story theme */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 left-20 w-2 h-2 bg-blue-400/20 rounded-full animate-pulse"></div>
        <div className="absolute top-48 right-32 w-1 h-1 bg-purple-400/25 rounded-full animate-ping"></div>
        <div className="absolute top-1/2 left-16 w-1.5 h-1.5 bg-cyan-400/20 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-40 right-20 w-1 h-1 bg-green-400/25 rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-24 left-32 w-2 h-2 bg-purple-300/15 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
      </div>
      
      <div className={cn(themeConfig.layout.maxWidth, "mx-auto relative z-10")}>
        {/* Page Header */}
        <div className="text-center mb-8">
          <Badge className={cn("mb-4", themeConfig.colors.glass.background, themeConfig.colors.glass.border)}>
            <BookOpen className="w-4 h-4 mr-2" />
            <Crown className="w-3 h-3 mr-1 text-yellow-400" />
            AI Story
          </Badge>
          <h1 className={cn("text-3xl font-bold mb-2", themeConfig.typography.gradient)}>
            {story.title}
          </h1>
          <p className="text-gray-400 mb-4">
            Generated from analysis of {story.analysis.fileName}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
            <Link href="/stories" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "inline-flex items-center justify-center gap-2 w-full sm:w-auto",
                  "bg-white/5 border-white/20 text-white",
                  "hover:bg-white/10 hover:border-white/30",
                  "touch-manipulation min-h-[44px]", // Better touch target
                  themeConfig.animation.transition
                )}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Stories
              </Button>
            </Link>
            <Badge className={cn("border px-3 py-1", statusInfo.color)}>
              {story.status === 'GENERATING' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
              {statusInfo.text}
            </Badge>
            {story.status === 'COMPLETED' && (
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                size="sm"
                className={cn(
                  "inline-flex items-center justify-center gap-2 w-full sm:w-auto",
                  "bg-purple-600 hover:bg-purple-700 text-white",
                  "touch-manipulation min-h-[44px]", // Better touch target
                  themeConfig.animation.transition
                )}
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {isDownloading ? 'Generating...' : 'Download as Markdown'}
                </span>
                <span className="sm:hidden">
                  {isDownloading ? 'Generating...' : 'Download'}
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Story Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card className={cn(
            themeConfig.colors.glass.background,
            themeConfig.colors.glass.border,
            themeConfig.colors.glass.shadow,
            "border",
            themeConfig.animation.transition,
            themeConfig.animation.hover,
            "hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10",
            "backdrop-blur-xl group"
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Generated</CardTitle>
              <div className="p-2 rounded-full bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                <Calendar className="h-4 w-4 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-white">
                {format(new Date(story.generatedAt), "MMM d, yyyy")}
              </div>
              <p className="text-xs text-gray-400">
                {format(new Date(story.generatedAt), "h:mm a")}
              </p>
            </CardContent>
          </Card>

          <Card className={cn(
            themeConfig.colors.glass.background,
            themeConfig.colors.glass.border,
            themeConfig.colors.glass.shadow,
            "border",
            themeConfig.animation.transition,
            themeConfig.animation.hover,
            "hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10",
            "backdrop-blur-xl group"
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">AI Provider</CardTitle>
              <div className="p-2 rounded-full bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                <BarChart3 className="h-4 w-4 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-white capitalize">
                {story.aiProvider !== 'pending' ? story.aiProvider : 'Processing...'}
              </div>
              <p className="text-xs text-gray-400">
                {story.modelId !== 'pending' ? story.modelId : 'Selecting model...'}
              </p>
            </CardContent>
          </Card>

          <Card className={cn(
            themeConfig.colors.glass.background,
            themeConfig.colors.glass.border,
            themeConfig.colors.glass.shadow,
            "border",
            themeConfig.animation.transition,
            themeConfig.animation.hover,
            "hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10",
            "backdrop-blur-xl group"
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Processing Time</CardTitle>
              <div className="p-2 rounded-full bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                <Clock className="h-4 w-4 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-white">
                {story.processingTime ? `${Math.round(story.processingTime / 1000)}s` : 'Calculating...'}
              </div>
              <p className="text-xs text-gray-400">Generation time</p>
            </CardContent>
          </Card>

          <Card className={cn(
            themeConfig.colors.glass.background,
            themeConfig.colors.glass.border,
            themeConfig.colors.glass.shadow,
            "border",
            themeConfig.animation.transition,
            themeConfig.animation.hover,
            "hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10",
            "backdrop-blur-xl group"
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Prompt Version</CardTitle>
              <div className="p-2 rounded-full bg-yellow-500/20 group-hover:bg-yellow-500/30 transition-colors">
                <Lightbulb className="h-4 w-4 text-yellow-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-white">
                {story.promptVersion}
              </div>
              <p className="text-xs text-gray-400">Template version</p>
            </CardContent>
          </Card>
        </div>

        {/* Story Content */}
        <div className="space-y-6">
          {story.status === 'COMPLETED' && story.content ? (
            <StoryComponentErrorBoundary>
              <StoryTimeline storyContent={story.content} />
            </StoryComponentErrorBoundary>
          ) : story.status === 'GENERATING' ? (
            <Card className={cn(
              themeConfig.colors.glass.background,
              themeConfig.colors.glass.border,
              themeConfig.colors.glass.shadow,
              "border backdrop-blur-xl",
              themeConfig.animation.transition
            )}>
              <CardContent className="py-12">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-400" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Crafting Your Story...
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Our AI is transforming your analysis into an engaging narrative timeline.
                  </p>
                  <p className="text-sm text-gray-500">
                    This usually takes 1-2 minutes. Feel free to refresh the page.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : story.status === 'FAILED' ? (
            <Card className={cn(
              themeConfig.colors.glass.background,
              themeConfig.colors.glass.border,
              themeConfig.colors.glass.shadow,
              "border backdrop-blur-xl border-red-500/30"
            )}>
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-6 w-6 text-red-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Story Generation Failed
                  </h3>
                  <p className="text-gray-400 mb-4">
                    {story.errorMessage || "Something went wrong while generating your story."}
                  </p>
                  <Button
                    onClick={() => window.location.reload()}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className={cn(
              themeConfig.colors.glass.background,
              themeConfig.colors.glass.border,
              themeConfig.colors.glass.shadow,
              "border backdrop-blur-xl",
              themeConfig.animation.transition
            )}>
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-gray-500/20 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Story Pending
                  </h3>
                  <p className="text-gray-400">
                    Your story is in the queue for generation.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}