"use client";

import { useState, useEffect } from "react";
import { UnifiedLayout } from "@/components/layout/UnifiedLayout";
import { StoryListErrorBoundary } from "@/components/story/StoryErrorBoundary";
import { useStoryRetry } from "@/lib/hooks/useRetry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookOpen, Search, Trash2, Eye, Clock, Calendar, Crown, Download, RefreshCw } from "lucide-react";
import Filter from "lucide-react/dist/esm/icons/filter";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import { format, formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { themeConfig } from "@/lib/theme-config";
import { cn } from "@/lib/utils";

interface Story {
  id: string;
  title: string;
  status: 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';
  generatedAt: string;
  aiProvider: string;
  modelId: string;
  processingTime?: number;
  promptVersion: string;
  errorMessage?: string;
  contentPreview?: string;
  analysis: {
    fileName: string;
    provider: string;
    modelId: string;
    analysisDate: string;
    templateId: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

function StoriesPageContent() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [deletingStoryId, setDeletingStoryId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Use retry hook for story operations
  const storyRetry = useStoryRetry({
    maxRetries: 3,
    onRetry: (attempt, error) => {
      console.log(`Retrying story fetch (attempt ${attempt}):`, error.message);
    },
    onMaxRetriesReached: (error) => {
      setError(`Failed to load stories after multiple attempts: ${error.message}`);
    }
  });

  const fetchStories = async (page = 1, searchQuery = search, status = statusFilter) => {
    const fetchOperation = async () => {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        ...(searchQuery && { search: searchQuery }),
        ...(status !== "all" && { status }),
      });

      const response = await fetch(`/api/stories?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch stories`);
      }
      
      const data = await response.json();
      setStories(data.stories || []);
      setPagination(data.pagination || null);
      setLoading(false);
      
      return data;
    };

    try {
      await storyRetry.executeWithRetry(fetchOperation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stories');
      setStories([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories(1, search, statusFilter);
    setCurrentPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDeleteStory = async (storyId: string) => {
    if (!confirm("Are you sure you want to delete this story? This cannot be undone.")) {
      return;
    }

    const deleteOperation = async () => {
      setDeletingStoryId(storyId);
      
      const response = await fetch(`/api/stories/${storyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to delete story`);
      }

      // Refresh the stories list
      await fetchStories(currentPage, search, statusFilter);
    };

    try {
      await storyRetry.executeWithRetry(deleteOperation);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete story';
      alert(`Delete failed: ${errorMessage}`);
    } finally {
      setDeletingStoryId(null);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchStories(page, search, statusFilter);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { 
          icon: CheckCircle,
          color: 'bg-green-500/20 text-green-300 border-green-500/30',
          text: 'Completed'
        };
      case 'GENERATING':
        return { 
          icon: Loader2,
          color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          text: 'Generating...',
          animate: true
        };
      case 'FAILED':
        return { 
          icon: XCircle,
          color: 'bg-red-500/20 text-red-300 border-red-500/30',
          text: 'Failed'
        };
      default:
        return { 
          icon: Clock,
          color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
          text: 'Pending'
        };
    }
  };

  const StatusIcon = ({ status }: { status: string }) => {
    const statusInfo = getStatusInfo(status);
    const Icon = statusInfo.icon;
    return (
      <Icon 
        className={cn(
          "w-3 h-3 mr-1", 
          statusInfo.animate && "animate-spin"
        )} 
      />
    );
  };

  return (
    <UnifiedLayout>
      <div className="container mx-auto px-4 py-8 relative overflow-hidden">
        {/* Neural background particles */}
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
              AI Stories
            </Badge>
            <h1 className={cn("text-3xl font-bold mb-2", themeConfig.typography.gradient)}>
              Your Story Collection
            </h1>
            <p className="text-gray-400 mb-6">
              AI-generated narrative stories from your analysis results
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search stories or file names..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(
                  "pl-10",
                  "bg-white/5 border-white/20 text-white placeholder:text-gray-400",
                  "focus:bg-white/10 focus:border-white/30"
                )}
              />
            </div>
            <div className="flex items-center gap-2 sm:min-w-[180px] w-full sm:w-auto">
              <Filter className="text-gray-400 h-4 w-4 flex-shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={cn(
                  "flex-1 sm:flex-initial px-3 py-2 rounded-md",
                  "bg-white/5 border border-white/20 text-white",
                  "focus:bg-white/10 focus:border-white/30 focus:outline-none"
                )}
              >
                <option value="all">All Stories</option>
                <option value="completed">Completed</option>
                <option value="generating">Generating</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <Button
              onClick={() => fetchStories(currentPage, search, statusFilter)}
              variant="outline"
              size="sm"
              className={cn(
                "bg-white/5 border-white/20 text-white",
                "hover:bg-white/10 hover:border-white/30",
                "w-full sm:w-auto"
              )}
            >
              <RefreshCw className="h-4 w-4" />
              <span className="ml-2 sm:hidden">Refresh</span>
            </Button>
          </div>

          {/* Error State */}
          {error && (
            <Alert className="mb-6 bg-red-500/10 border-red-500/20">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className={cn(
                  themeConfig.colors.glass.background,
                  themeConfig.colors.glass.border,
                  "border backdrop-blur-xl"
                )}>
                  <CardHeader>
                    <Skeleton className="h-4 w-3/4 bg-white/10" />
                    <Skeleton className="h-3 w-1/2 bg-white/10" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full mb-4 bg-white/10" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16 bg-white/10" />
                      <Skeleton className="h-6 w-20 bg-white/10" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !stories || stories.length === 0 ? (
            // Empty State
            <Card className={cn(
              themeConfig.colors.glass.background,
              themeConfig.colors.glass.border,
              "border backdrop-blur-xl"
            )}>
              <CardContent className="py-12">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No Stories Found
                  </h3>
                  <p className="text-gray-400 mb-4">
                    {search || statusFilter !== "all" 
                      ? "Try adjusting your search or filters" 
                      : "Stories will appear here when you generate them from your analysis results"}
                  </p>
                  <Link href="/history">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                      Go to Analysis History
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Stories Grid
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {stories && stories.map((story) => {
                  const statusInfo = getStatusInfo(story.status);
                  
                  return (
                    <Card
                      key={story.id}
                      className={cn(
                        themeConfig.colors.glass.background,
                        themeConfig.colors.glass.border,
                        themeConfig.colors.glass.shadow,
                        "border backdrop-blur-xl group",
                        themeConfig.animation.transition,
                        "hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10",
                        "relative overflow-hidden"
                      )}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-white text-sm font-medium mb-1 truncate">
                              {story.title}
                            </CardTitle>
                            <p className="text-xs text-gray-400 truncate">
                              {story.analysis.fileName}
                            </p>
                          </div>
                          <Badge className={cn("border text-xs", statusInfo.color)}>
                            <StatusIcon status={story.status} />
                            {statusInfo.text}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        {/* Content Preview */}
                        {story.contentPreview && (
                          <div className="mb-4">
                            <p className="text-gray-300 text-xs leading-relaxed line-clamp-3">
                              {story.contentPreview}
                            </p>
                          </div>
                        )}
                        
                        {/* Metadata */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(story.generatedAt), "MMM d, yyyy")}</span>
                            <span className="text-gray-500">•</span>
                            <span>{formatDistanceToNow(new Date(story.generatedAt), { addSuffix: true })}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <BarChart3 className="h-3 w-3" />
                            <span className="capitalize">{story.aiProvider}</span>
                            <span className="text-gray-500">•</span>
                            <span>{story.modelId}</span>
                          </div>
                          
                          {story.processingTime && (
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Clock className="h-3 w-3" />
                              <span>{Math.round(story.processingTime / 1000)}s generation</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Error Message */}
                        {story.status === 'FAILED' && story.errorMessage && (
                          <div className="mb-4 p-2 rounded bg-red-500/10 border border-red-500/20">
                            <p className="text-red-300 text-xs">{story.errorMessage}</p>
                          </div>
                        )}
                        
                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {story.status === 'COMPLETED' && (
                            <Link href={`/story/${story.id}`} className="flex-1">
                              <Button
                                size="sm"
                                className="w-full bg-purple-600/20 border-purple-500/30 text-purple-200 hover:bg-purple-600/30 hover:border-purple-500/50"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View Story
                              </Button>
                            </Link>
                          )}
                          
                          {story.status === 'GENERATING' && (
                            <Link href={`/story/${story.id}`} className="flex-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full bg-blue-600/20 border-blue-500/30 text-blue-200 hover:bg-blue-600/30"
                              >
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                View Progress
                              </Button>
                            </Link>
                          )}
                          
                          {(story.status === 'PENDING' || story.status === 'FAILED') && (
                            <Link href={`/story/${story.id}`} className="flex-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full bg-gray-600/20 border-gray-500/30 text-gray-200 hover:bg-gray-600/30"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View Details
                              </Button>
                            </Link>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteStory(story.id)}
                            disabled={deletingStoryId === story.id}
                            className="bg-red-600/20 border-red-500/30 text-red-200 hover:bg-red-600/30 hover:border-red-500/50"
                          >
                            {deletingStoryId === story.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination?.hasPrev}
                    className="bg-white/5 border-white/20 text-white hover:bg-white/10 w-full sm:w-auto"
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1 overflow-x-auto max-w-full">
                    {Array.from({ length: Math.min(isMobile ? 3 : 5, pagination?.totalPages || 0) }, (_, i) => {
                      const maxPages = isMobile ? 3 : 5;
                      const startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
                      const page = startPage + i;
                      if (page > (pagination?.totalPages || 0)) return null;
                      
                      return (
                        <Button
                          key={page}
                          variant={page === currentPage ? "primary" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className={cn(
                            "flex-shrink-0",
                            page === currentPage 
                              ? "bg-purple-600 hover:bg-purple-700 text-white"
                              : "bg-white/5 border-white/20 text-white hover:bg-white/10"
                          )}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination?.hasNext}
                    className="bg-white/5 border-white/20 text-white hover:bg-white/10 w-full sm:w-auto"
                  >
                    Next
                  </Button>
                </div>
              )}
              
              {/* Results Summary */}
              {pagination && (
                <div className="text-center mt-6">
                  <p className="text-sm text-gray-400">
                    Showing {((currentPage - 1) * (pagination?.limit || 0)) + 1} to{' '}
                    {Math.min(currentPage * (pagination?.limit || 0), pagination?.totalCount || 0)} of{' '}
                    {pagination?.totalCount || 0} stories
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </UnifiedLayout>
  );
}

export default function StoriesPage() {
  return (
    <StoryListErrorBoundary>
      <StoriesPageContent />
    </StoryListErrorBoundary>
  );
}