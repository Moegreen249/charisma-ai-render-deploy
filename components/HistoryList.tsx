"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  MoreHorizontal,
  Search,
  Eye,
  Trash2,
  FileText,
  Clock,
  Zap,
  Calendar,
} from "lucide-react";
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

  const getProviderBadge = (provider: string) => {
    const colors = {
      google: "bg-primary/10 text-primary border-primary/20",
      openai: "bg-green-500/10 text-green-500 border-green-500/20",
      anthropic: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    };
    
    return (
      <Badge variant="outline" className={colors[provider as keyof typeof colors] || "bg-muted text-muted-foreground border-border"}>
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Analysis History
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search analyses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    {searchTerm ? "No analyses found matching your search." : "No analyses found."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredHistory.map((analysis) => (
                  <TableRow key={analysis.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="font-medium truncate max-w-[200px]">
                          {analysis.fileName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {analysis.analysisResult?.overallSummary?.substring(0, 50)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {analysis.templateId}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getProviderBadge(analysis.provider)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {analysis.modelId}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Zap className="h-3 w-3" />
                        {formatDuration(analysis.durationMs)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(analysis.createdAt), "MMM d, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/history/${analysis.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Analysis
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Analysis
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Analysis</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the analysis for{" "}
                                  <strong>{analysis.fileName}</strong>? This action
                                  cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(analysis.id)}
                                  className="bg-red-600 hover:bg-red-700"
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
        <div className="mt-4 text-sm text-muted-foreground">
          Showing {filteredHistory.length} of {history.length} analyses
        </div>
      </CardContent>
    </Card>
  );
} 