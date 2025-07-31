import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { getAnalysisHistory, getAnalysisStats } from "@/app/actions/history";
import HistoryList from "@/components/HistoryList";
import { UnifiedLayout } from "@/components/layout/UnifiedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, FileText, TrendingUp, BarChart3 } from "lucide-react";
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className={cn(
              themeConfig.colors.glass.background,
              themeConfig.colors.glass.border,
              themeConfig.colors.glass.shadow,
              "border transition-all duration-300 hover:scale-105"
            )}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  Total Analyses
                </CardTitle>
                <FileText className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalAnalyses}</div>
                <p className="text-xs text-gray-400">
                  All time analyses
                </p>
              </CardContent>
            </Card>

            <Card className={cn(
              themeConfig.colors.glass.background,
              themeConfig.colors.glass.border,
              themeConfig.colors.glass.shadow,
              "border transition-all duration-300 hover:scale-105"
            )}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  Recent Analyses
                </CardTitle>
                <Clock className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.recentAnalyses}</div>
                <p className="text-xs text-gray-400">Last 7 days</p>
              </CardContent>
            </Card>

            <Card className={cn(
              themeConfig.colors.glass.background,
              themeConfig.colors.glass.border,
              themeConfig.colors.glass.shadow,
              "border transition-all duration-300 hover:scale-105"
            )}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  Average Duration
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
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
              "border transition-all duration-300 hover:scale-105"
            )}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  Providers Used
                </CardTitle>
                <Activity className="h-4 w-4 text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
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
            <h3 className="text-lg font-medium text-white mb-4">
              Provider Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
