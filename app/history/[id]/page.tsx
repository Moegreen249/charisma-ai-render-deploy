import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { redirect, notFound } from "next/navigation";
import { getAnalysisById } from "@/app/actions/history";
import EnhancedAnalysisView from "@/components/EnhancedAnalysisView";
import { UnifiedLayout } from "@/components/layout/UnifiedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Clock, Zap, Calendar } from "lucide-react";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import { format } from "date-fns";
import Link from "next/link";
import { themeConfig } from "@/lib/theme-config";
import { cn } from "@/lib/utils";

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
      google: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      openai: "bg-green-500/20 text-green-300 border-green-500/30",
      anthropic: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    };

    return (
      <Badge
        className={cn(
          colors[provider as keyof typeof colors] ||
          "bg-gray-500/20 text-gray-300 border-gray-500/30",
          "border"
        )}
      >
        {provider.toUpperCase()}
      </Badge>
    );
  };

  return (
    <UnifiedLayout>
      <div className="container mx-auto px-4 py-8 relative overflow-hidden">
        {/* Neural background particles - analysis theme */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-24 left-16 w-2 h-2 bg-purple-400/20 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-1 h-1 bg-blue-400/25 rounded-full animate-ping"></div>
          <div className="absolute top-2/3 left-12 w-1.5 h-1.5 bg-cyan-400/20 rounded-full animate-pulse" style={{animationDelay: '1.2s'}}></div>
          <div className="absolute bottom-32 right-24 w-1 h-1 bg-green-400/25 rounded-full animate-ping" style={{animationDelay: '2.5s'}}></div>
          <div className="absolute bottom-48 left-28 w-2 h-2 bg-purple-300/15 rounded-full animate-pulse" style={{animationDelay: '0.8s'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Page Header */}
          <div className="text-center mb-8">
            <Badge className={cn("mb-4", themeConfig.colors.glass.background, themeConfig.colors.glass.border)}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Analysis Report
            </Badge>
            <h1 className={cn("text-3xl font-bold mb-2", themeConfig.typography.gradient)}>
              Analysis Details
            </h1>
            <p className="text-gray-400 mb-4">
              {analysis.fileName}
            </p>
            <Link href="/history">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "inline-flex items-center gap-2",
                  "bg-white/5 border-white/20 text-white",
                  "hover:bg-white/10 hover:border-white/30",
                  themeConfig.animation.transition
                )}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to History
              </Button>
            </Link>
          </div>
        {/* Analysis Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className={cn(
            themeConfig.colors.glass.background,
            themeConfig.colors.glass.border,
            themeConfig.colors.glass.shadow,
            "border transition-all duration-300 hover:scale-105",
            "hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10",
            "backdrop-blur-xl group"
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">File</CardTitle>
              <div className="p-2 rounded-full bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                <FileText className="h-4 w-4 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium truncate text-white">
                {analysis.fileName}
              </div>
              <p className="text-xs text-gray-400">Analyzed file</p>
            </CardContent>
          </Card>

          <Card className={cn(
            themeConfig.colors.glass.background,
            themeConfig.colors.glass.border,
            themeConfig.colors.glass.shadow,
            "border transition-all duration-300 hover:scale-105",
            "hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10",
            "backdrop-blur-xl group"
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Provider</CardTitle>
              <div className="p-2 rounded-full bg-yellow-500/20 group-hover:bg-yellow-500/30 transition-colors">
                <Zap className="h-4 w-4 text-yellow-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {getProviderBadge(analysis.provider)}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {analysis.modelId}
              </p>
            </CardContent>
          </Card>

          <Card className={cn(
            themeConfig.colors.glass.background,
            themeConfig.colors.glass.border,
            themeConfig.colors.glass.shadow,
            "border transition-all duration-300 hover:scale-105",
            "hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10",
            "backdrop-blur-xl group"
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Duration</CardTitle>
              <div className="p-2 rounded-full bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                <Clock className="h-4 w-4 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-white">
                {formatDuration(analysis.durationMs)}
              </div>
              <p className="text-xs text-gray-400">Analysis time</p>
            </CardContent>
          </Card>

          <Card className={cn(
            themeConfig.colors.glass.background,
            themeConfig.colors.glass.border,
            themeConfig.colors.glass.shadow,
            "border transition-all duration-300 hover:scale-105",
            "hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10",
            "backdrop-blur-xl group"
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Date</CardTitle>
              <div className="p-2 rounded-full bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                <Calendar className="h-4 w-4 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-white">
                {format(new Date(analysis.createdAt), "MMM d, yyyy")}
              </div>
              <p className="text-xs text-gray-400">
                {format(new Date(analysis.createdAt), "h:mm a")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Template Info */}
        <Card className={cn(
          "mb-8",
          themeConfig.colors.glass.background,
          themeConfig.colors.glass.border,
          themeConfig.colors.glass.shadow,
          "border",
          "hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10",
          "transition-all duration-300 backdrop-blur-xl"
        )}>
          <CardHeader>
            <CardTitle className="text-lg text-white">Analysis Template</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-600/20 border-purple-500/30 text-purple-200">
                {analysis.templateId}
              </Badge>
              <span className="text-sm text-gray-400">
                Template used for this analysis
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <div className="space-y-6">
          <h2 className={cn("text-2xl font-bold mb-6", themeConfig.typography.gradient)}>
            Analysis Results
          </h2>
          <EnhancedAnalysisView
            analysisData={analysis.analysisResult as any}
            templateId={analysis.templateId}
          />
        </div>
        </div>
      </div>
    </UnifiedLayout>
  );
}
