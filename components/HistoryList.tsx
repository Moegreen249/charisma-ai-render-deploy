"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { themeConfig } from "@/lib/theme-config";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Eye, Trash2, FileText, Zap, Calendar, BookOpen, Crown,  } from "lucide-react";
import MoreHorizontal from "lucide-react/dist/esm/icons/more-horizontal";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import { format } from "date-fns";
import { deleteAnalysis } from "@/app/actions/history";

interface Analysis {
  id: string;
  templateId: string;
  modelId: string;
  provider: string;
  fileName: string;
  analysisDate: Date;
  durationMs: number | null;
  createdAt: Date;
  updatedAt: Date;
  analysisResult: any;
}

interface HistoryListProps {
  initialHistory: Analysis[];
}

export default function HistoryList({ initialHistory }: HistoryListProps) {
  const router = useRouter();
  const [history, setHistory] = useState<Analysis[]>(initialHistory);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [storyLoading, setStoryLoading] = useState<string | null>(null);

  const filteredHistory = history.filter((analysis) =>
    analysis.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    analysis.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    analysis.modelId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    analysis.templateId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const result = await deleteAnalysis(id);
      if (result.success) {
        setHistory(history.filter(analysis => analysis.id !== id));
      } else {
        console.error("Failed to delete analysis:", result.error);
        // You could add a toast notification here
      }
    } catch (error) {
      console.error("Error deleting analysis:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateStory = async (analysisId: string) => {
    setStoryLoading(analysisId);
    try {
      const response = await fetch('/api/story/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ analysisId }),
      });

      const result = await response.json();

      if (result.success) {
        // Navigate to story view or show success message
        if (result.story.status === 'COMPLETED') {
          router.push(`/story/${result.story.id}`);
        } else {
          // Story is generating, could show a toast or poll for completion
          console.log('Story generation started:', result.message);
          // For now, just navigate to the story page which will show loading state
          router.push(`/story/${result.story.id}`);
        }
      } else {
        console.error("Failed to generate story:", result.error);
        // Handle different error types
        if (result.requiresPro) {
          // Show upgrade prompt
          alert(`${result.error}\n\nWould you like to upgrade to Pro?`);
        } else {
          alert(result.error);
        }
      }
    } catch (error) {
      console.error("Error generating story:", error);
      alert("Failed to generate story. Please try again.");
    } finally {
      setStoryLoading(null);
    }
  };

  const getProviderBadge = (provider: string) => {
    const colors = {
      google: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      openai: "bg-green-500/20 text-green-300 border-green-500/30",
      anthropic: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    };
    
    return (
      <Badge variant="outline" className={colors[provider as keyof typeof colors] || "bg-gray-500/20 text-gray-300 border-gray-500/30"}>
        {provider.toUpperCase()}
      </Badge>
    );
  };

  const formatDuration = (durationMs: number | null) => {
    if (!durationMs) return "N/A";
    const seconds = Math.round(durationMs / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <Card className={cn(
      themeConfig.colors.glass.background,
      themeConfig.colors.glass.border,
      themeConfig.colors.glass.shadow,
      "border"
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <FileText className="h-5 w-5" />
            Analysis History
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search analyses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(
                  "pl-8 w-64",
                  "bg-white/10 border-white/20 text-white placeholder:text-gray-400",
                  "focus:bg-white/20 focus:border-purple-400",
                  themeConfig.animation.transition
                )}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-white/20 bg-white/5">
          <Table>
            <TableHeader className="border-b border-white/20">
              <TableRow className="border-b border-white/20 hover:bg-white/5">
                <TableHead className="text-gray-300 font-medium">File</TableHead>
                <TableHead className="text-gray-300 font-medium">Template</TableHead>
                <TableHead className="text-gray-300 font-medium">Provider</TableHead>
                <TableHead className="text-gray-300 font-medium">Model</TableHead>
                <TableHead className="text-gray-300 font-medium">Duration</TableHead>
                <TableHead className="text-gray-300 font-medium">Date</TableHead>
                <TableHead className="w-[50px] text-gray-300 font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.length === 0 ? (
                <TableRow className="border-b border-white/10">
                  <TableCell colSpan={7} className="text-center text-gray-400">
                    {searchTerm ? "No analyses found matching your search." : "No analyses found."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredHistory.map((analysis) => (
                  <TableRow key={analysis.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="font-medium truncate max-w-[200px] text-white">
                          {analysis.fileName}
                        </div>
                        <div className="text-sm text-gray-400">
                          {analysis.analysisResult?.overallSummary?.substring(0, 50)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-purple-600/20 border-purple-500/30 text-purple-200">
                        {analysis.templateId}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getProviderBadge(analysis.provider)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-400">
                        {analysis.modelId}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-400">
                        <Zap className="h-3 w-3" />
                        {formatDuration(analysis.durationMs)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-400">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(analysis.createdAt), "MMM d, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className={cn("bg-gray-800 border-white/20 text-white", themeConfig.colors.glass.background, themeConfig.colors.glass.border)}>
                          <DropdownMenuItem 
                            onClick={() => router.push(`/history/${analysis.id}`)} 
                            className={cn("text-white hover:bg-white/10 focus:bg-white/10", themeConfig.animation.transition)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Analysis
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleGenerateStory(analysis.id)}
                            className={cn("text-purple-400 hover:bg-purple-500/10 focus:bg-purple-500/10 focus:text-purple-400", themeConfig.animation.transition)}
                            disabled={storyLoading === analysis.id}
                          >
                            {storyLoading === analysis.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <BookOpen className="h-4 w-4 mr-2" />
                            )}
                            {storyLoading === analysis.id ? 'Generating...' : 'Generate Story'}
                            <Crown className="h-3 w-3 ml-1 text-yellow-400" />
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-400"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Analysis
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent className={cn(
                              themeConfig.colors.glass.background,
                              themeConfig.colors.glass.border,
                              "border text-white"
                            )}>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-white">Delete Analysis</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-400">
                                  Are you sure you want to delete the analysis for{" "}
                                  <strong>{analysis.fileName}</strong>? This action
                                  cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(analysis.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                  disabled={loading}
                                >
                                  {loading ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 text-sm text-gray-400">
          Showing {filteredHistory.length} of {history.length} analyses
        </div>
      </CardContent>
    </Card>
  );
} 