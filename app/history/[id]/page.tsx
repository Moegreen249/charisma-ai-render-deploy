import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { redirect, notFound } from "next/navigation";
import { getAnalysisById } from "@/app/actions/history";
import EnhancedAnalysisView from "@/components/EnhancedAnalysisView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Clock, Zap, Calendar } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AnalysisPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const { id } = await params;
  const result = await getAnalysisById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const analysis = result.data;

  const formatDuration = (durationMs: number | null) => {
    if (!durationMs) return "N/A";
    const seconds = Math.round(durationMs / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getProviderBadge = (provider: string) => {
    const colors = {
      google: "bg-primary/10 text-primary border-primary/20",
      openai: "bg-green-500/10 text-green-500 border-green-500/20",
      anthropic: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    };

    return (
      <Badge
        variant="outline"
        className={
          colors[provider as keyof typeof colors] ||
          "bg-muted text-muted-foreground border-border"
        }
      >
        {provider.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-2">
            <Link href="/history">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to History
              </Button>
            </Link>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-3xl font-bold text-card-foreground">
                Analysis Details
              </h1>
              <p className="text-muted-foreground">{analysis.fileName}</p>
            </div>
          </div>
        </div>
        {/* Analysis Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">File</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium truncate">
                {analysis.fileName}
              </div>
              <p className="text-xs text-muted-foreground">Analyzed file</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Provider</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {getProviderBadge(analysis.provider)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {analysis.modelId}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {formatDuration(analysis.durationMs)}
              </div>
              <p className="text-xs text-muted-foreground">Analysis time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Date</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {format(new Date(analysis.createdAt), "MMM d, yyyy")}
              </div>
              <p className="text-xs text-muted-foreground">
                {format(new Date(analysis.createdAt), "h:mm a")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Template Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Analysis Template</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{analysis.templateId}</Badge>
              <span className="text-sm text-muted-foreground">
                Template used for this analysis
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-card-foreground">
            Analysis Results
          </h2>
          <EnhancedAnalysisView
            analysisData={analysis.analysisResult as any}
            templateId={analysis.templateId}
          />
        </div>
      </div>
    </div>
  );
}
