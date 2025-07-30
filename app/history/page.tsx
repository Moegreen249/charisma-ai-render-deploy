import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { getAnalysisHistory, getAnalysisStats } from "@/app/actions/history";
import HistoryList from "@/components/HistoryList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, FileText, TrendingUp } from "lucide-react";

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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-2">
            <Activity className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-card-foreground">
                Analysis History
              </h1>
              <p className="text-muted-foreground">
                View and manage your past conversation analyses
              </p>
            </div>
          </div>
        </div>
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Analyses
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAnalyses}</div>
                <p className="text-xs text-muted-foreground">
                  All time analyses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Recent Analyses
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.recentAnalyses}</div>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Duration
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
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
                <p className="text-xs text-muted-foreground">Per analysis</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Providers Used
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.byProvider.length}
                </div>
                <p className="text-xs text-muted-foreground">AI providers</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Provider Breakdown */}
        {stats && stats.byProvider.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-card-foreground mb-4">
              Provider Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.byProvider.map((provider) => (
                <Card key={provider.provider}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-card-foreground capitalize">
                          {provider.provider}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {provider._count.id} analyses
                        </p>
                      </div>
                      <Badge variant="outline">
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
  );
}
