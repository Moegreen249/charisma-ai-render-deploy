import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { getAnalysisHistory, getAnalysisStats } from "@/app/actions/history";
import HistoryList from "@/components/HistoryList";
import { UnifiedLayout } from "@/components/layout/UnifiedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, FileText, TrendingUp } from "lucide-react";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import { themeConfig } from "@/lib/theme-config";
import { cn } from "@/lib/utils";

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Fetch analysis history and stats
  const [historyResult, statsResult] = await Promise.all([
    getAnalysisHistory(),
    getAnalysisStats(),
  ]);

  const analyses = historyResult.success ? historyResult.data : [];
  const stats = statsResult.success ? statsResult.data : null;

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
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Page Header */}
          <div className="text-center mb-8">
            <Badge className={cn("mb-4", themeConfig.colors.glass.background, themeConfig.colors.glass.border)}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Analysis Dashboard
            </Badge>
            <h1 className={cn("text-3xl font-bold mb-2", themeConfig.typography.gradient)}>
              Analysis History
            </h1>
            <p className="text-gray-400">
              View and manage your past conversation analyses
            </p>
          </div>
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <Card className={cn(
              themeConfig.colors.glass.background,
              themeConfig.colors.glass.border,
              themeConfig.colors.glass.shadow,
              "border transition-all duration-300 hover:scale-105",
              "hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10",
              "backdrop-blur-xl group"
            )}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  Total Analyses
                </CardTitle>
                <div className="p-2 rounded-full bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                  <FileText className="h-4 w-4 text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                  {stats.totalAnalyses}
                </div>
                <p className="text-xs text-gray-400">
                  All time analyses
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
                <CardTitle className="text-sm font-medium text-white">
                  Recent Analyses
                </CardTitle>
                <div className="p-2 rounded-full bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                  <Clock className="h-4 w-4 text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                  {stats.recentAnalyses}
                </div>
                <p className="text-xs text-gray-400">Last 7 days</p>
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
                <CardTitle className="text-sm font-medium text-white">
                  Average Duration
                </CardTitle>
                <div className="p-2 rounded-full bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                  {stats.totalAnalyses > 0 && stats.byProvider.length > 0
                    ? Math.round(
                        stats.byProvider.reduce(
                          (acc, p) => acc + (p._sum.durationMs || 0),
                          0,
                        ) /
                          stats.totalAnalyses /
                          1000,
                      )
                    : 0}
                  s
                </div>
                <p className="text-xs text-gray-400">Per analysis</p>
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
                <CardTitle className="text-sm font-medium text-white">
                  Providers Used
                </CardTitle>
                <div className="p-2 rounded-full bg-orange-500/20 group-hover:bg-orange-500/30 transition-colors">
                  <Activity className="h-4 w-4 text-orange-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                  {stats.byProvider.length}
                </div>
                <p className="text-xs text-gray-400">AI providers</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Provider Breakdown */}
        {stats && stats.byProvider.length > 0 && (
          <div className="mb-8">
            <h3 className={cn("text-lg font-medium mb-4", themeConfig.typography.gradient)}>
              Provider Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {stats.byProvider.map((provider) => (
                <Card key={provider.provider} className={cn(
                  themeConfig.colors.glass.background,
                  themeConfig.colors.glass.border,
                  themeConfig.colors.glass.shadow,
                  "border transition-all duration-300 hover:scale-105"
                )}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white capitalize">
                          {provider.provider}
                        </p>
                        <p className="text-xs text-gray-400">
                          {provider._count.id} analyses
                        </p>
                      </div>
                      <Badge className={cn(
                        "bg-purple-600/20 border-purple-500/30 text-purple-200"
                      )}>
                        {Math.round(
                          (provider._count.id / stats.totalAnalyses) * 100,
                        )}
                        %
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Analysis History List */}
        <HistoryList initialHistory={analyses || []} />
        </div>
      </div>
    </UnifiedLayout>
  );
}
