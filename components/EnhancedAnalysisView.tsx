"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Heart,
  Hash,
  MessageCircle,
  Target,
  Globe,
  TrendingUp,
  BarChart3,
  Network,
  Sparkles,
  Activity,
  Eye,
  Shield,
  AlertTriangle,
  Star,
  Award,
  ChevronRight,
  Filter,
  Grid,
  List,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { AnalysisResult, Insight } from "@/src/types";
import { getTemplateById } from "@/app/actions/templates";
import { useEnhancedLanguage } from "@/components/EnhancedLanguageProvider";
import FlexibleInsightRenderer from "@/components/FlexibleInsightRenderer";

interface EnhancedAnalysisViewProps {
  analysisData: AnalysisResult;
  templateId?: string;
  coachOpen?: boolean;
  setCoachOpen?: (open: boolean) => void;
}

// Enhanced insight categorization with better organization
const getCategoryInfo = (category: string, t: any) => {
  const categoryMap: Record<
    string,
    { title: string; icon: any; color: string; description: string }
  > = {
    psychology: {
      title: t.psychologyInsights || "Psychology",
      icon: Brain,
      color: "text-purple-600 bg-purple-100 border-purple-200",
      description:
        t.psychologyDescription ||
        "Deep psychological analysis and behavioral patterns",
    },
    relationship: {
      title: t.relationshipInsights || "Relationship",
      icon: Heart,
      color: "text-pink-600 bg-pink-100 border-pink-200",
      description:
        t.relationshipDescription ||
        "Relationship dynamics and interpersonal connections",
    },
    communication: {
      title: t.communicationInsights || "Communication",
      icon: MessageCircle,
      color: "text-blue-600 bg-blue-100 border-blue-200",
      description:
        t.communicationDescription ||
        "Communication patterns and effectiveness",
    },
    emotional: {
      title: t.emotionalInsights || "Emotional",
      icon: Heart,
      color: "text-red-600 bg-red-100 border-red-200",
      description:
        t.emotionalDescription || "Emotional intelligence and regulation",
    },
    leadership: {
      title: t.leadershipInsights || "Leadership",
      icon: Target,
      color: "text-indigo-600 bg-indigo-100 border-indigo-200",
      description:
        t.leadershipDescription || "Leadership competencies and team dynamics",
    },
    business: {
      title: t.businessInsights || "Business",
      icon: BarChart3,
      color: "text-green-600 bg-green-100 border-green-200",
      description:
        t.businessDescription || "Professional and business analysis",
    },
    coaching: {
      title: t.coachingInsights || "Coaching",
      icon: Award,
      color: "text-yellow-600 bg-yellow-100 border-yellow-200",
      description: t.coachingDescription || "Development and goal achievement",
    },
    clinical: {
      title: t.clinicalInsights || "Clinical",
      icon: Shield,
      color: "text-teal-600 bg-teal-100 border-teal-200",
      description:
        t.clinicalDescription || "Therapeutic and mental health indicators",
    },
    data: {
      title: t.dataInsights || "Data",
      icon: Activity,
      color: "text-cyan-600 bg-cyan-100 border-cyan-200",
      description: t.dataDescription || "Quantitative analysis and metrics",
    },
    subtext: {
      title: t.subtextInsights || "Subtext",
      icon: Eye,
      color: "text-orange-600 bg-orange-100 border-orange-200",
      description: t.subtextDescription || "Hidden meanings and intentions",
    },
    predictive: {
      title: t.predictiveInsights || "Predictive",
      icon: TrendingUp,
      color: "text-violet-600 bg-violet-100 border-violet-200",
      description:
        t.predictiveDescription || "Future trajectory and forecasting",
    },
    general: {
      title: t.generalInsights || "General",
      icon: Sparkles,
      color: "text-gray-600 bg-gray-100 border-gray-200",
      description: t.generalDescription || "General analysis and observations",
    },
  };

  return categoryMap[category] || categoryMap.general;
};

// Priority level indicators
const getPriorityInfo = (priority: number) => {
  if (priority >= 5)
    return {
      label: "Critical",
      color: "bg-red-500",
      textColor: "text-red-700",
    };
  if (priority >= 4)
    return {
      label: "High",
      color: "bg-orange-500",
      textColor: "text-orange-700",
    };
  if (priority >= 3)
    return {
      label: "Medium",
      color: "bg-blue-500",
      textColor: "text-blue-700",
    };
  if (priority >= 2)
    return { label: "Low", color: "bg-green-500", textColor: "text-green-700" };
  return { label: "Info", color: "bg-gray-500", textColor: "text-gray-700" };
};

export default function EnhancedAnalysisView({
  analysisData,
  templateId,
  coachOpen,
  setCoachOpen,
}: EnhancedAnalysisViewProps) {
  const { translations: t, isRTL, direction } = useEnhancedLanguage();
  const [activeTab, setActiveTab] = useState("overview");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [template, setTemplate] = useState<any>(null);
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  useEffect(() => {
    const loadTemplate = async () => {
      if (templateId) {
        try {
          const result = await getTemplateById(templateId);
          if (result.success && result.data) {
            setTemplate(result.data);
          }
        } catch (error) {
          console.error("Failed to load template:", error);
        }
      }
    };

    loadTemplate();
  }, [templateId]);

  // Process insights for better organization - NO DUPLICATION
  const organizedInsights = useMemo(() => {
    // Use ONLY the flexible insights from enhanced templates
    const insights = analysisData.insights || [];

    // Group by category
    const grouped: Record<string, Insight[]> = {};
    insights.forEach((insight) => {
      const category = insight.metadata?.category || "general";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(insight);
    });

    // Sort insights within each category by priority (descending)
    Object.keys(grouped).forEach((category) => {
      grouped[category].sort(
        (a, b) => (b.metadata?.priority || 0) - (a.metadata?.priority || 0),
      );
    });

    return grouped;
  }, [analysisData.insights]);

  // Get all categories with counts
  const categoryStats = useMemo(() => {
    return Object.entries(organizedInsights).map(([category, insights]) => ({
      category,
      count: insights.length,
      highPriority: insights.filter((i) => (i.metadata?.priority || 0) >= 4)
        .length,
      ...getCategoryInfo(category, t),
    }));
  }, [organizedInsights, t]);

  // Filter insights based on selected category
  const filteredInsights = useMemo(() => {
    if (!selectedCategory) {
      return Object.values(organizedInsights).flat();
    }
    return organizedInsights[selectedCategory] || [];
  }, [organizedInsights, selectedCategory]);

  // Extract key metrics from the analysis
  const keyMetrics = useMemo(() => {
    const metrics = analysisData.metrics || {};
    return Object.entries(metrics).map(([key, value]) => ({
      key,
      value: typeof value === "number" ? Math.round(value * 100) / 100 : value,
      label: key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase()),
    }));
  }, [analysisData.metrics]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`min-h-screen bg-background p-4 ${direction === "rtl" ? "rtl" : "ltr"}`}
      dir={direction}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {t.detailedAnalysis}
              </h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {analysisData.detectedLanguage && (
                  <Badge variant="secondary" className="gap-1">
                    <Globe className="h-3 w-3" />
                    {t.detectedLanguage}: {analysisData.detectedLanguage}
                  </Badge>
                )}
                {template && (
                  <Badge variant="outline" className="gap-1">
                    <span>{template.icon}</span>
                    {template.name}
                  </Badge>
                )}
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  {analysisData.insights?.length || 0}{" "}
                  {t.insights || "Insights"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            >
              {viewMode === "grid" ? (
                <List className="h-4 w-4" />
              ) : (
                <Grid className="h-4 w-4" />
              )}
            </Button>
            <Button
              onClick={() => setCoachOpen && setCoachOpen(true)}
              className="gap-2"
              disabled={!setCoachOpen}
            >
              <MessageCircle className="h-4 w-4" />
              {t.coachTitle}
            </Button>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">{t.overview}</TabsTrigger>
            <TabsTrigger value="insights">
              {t.insights || "Insights"}
            </TabsTrigger>
            <TabsTrigger value="categories">
              {t.categories || "Categories"}
            </TabsTrigger>
            <TabsTrigger value="metrics">{t.metrics || "Metrics"}</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Executive Summary Card */}
            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  {t.overallSummary}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {analysisData.overallSummary}
                </p>
              </CardContent>
            </Card>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t.totalInsights || "Total Insights"}
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {analysisData.insights?.length || 0}
                      </p>
                    </div>
                    <Sparkles className="h-8 w-8 text-primary/60" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t.categories || "Categories"}
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {categoryStats.length}
                      </p>
                    </div>
                    <Hash className="h-8 w-8 text-primary/60" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t.highPriority || "High Priority"}
                      </p>
                      <p className="text-2xl font-bold text-orange-600">
                        {categoryStats.reduce(
                          (sum, cat) => sum + cat.highPriority,
                          0,
                        )}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-orange-500/60" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t.keyMetrics || "Key Metrics"}
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {keyMetrics.length}
                      </p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-primary/60" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Priority Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  {t.topPriorityInsights || "Top Priority Insights"}
                </CardTitle>
                <CardDescription>
                  {t.mostImportantFindings ||
                    "Most important findings from the analysis"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredInsights
                    .filter((insight) => (insight.metadata?.priority || 0) >= 4)
                    .slice(0, 4)
                    .map((insight, index) => (
                      <div key={index} className="relative">
                        <FlexibleInsightRenderer
                          insight={insight}
                          className="h-full"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge
                            className={
                              getPriorityInfo(insight.metadata?.priority || 0)
                                .color
                            }
                          >
                            {
                              getPriorityInfo(insight.metadata?.priority || 0)
                                .label
                            }
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            {/* Filters */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {t.filterBy || "Filter by"}:
                </span>
              </div>
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                {t.all || "All"} (
                {Object.values(organizedInsights).flat().length})
              </Button>
              {categoryStats.map(
                ({ category, count, title, icon: Icon, color }) => (
                  <Button
                    key={category}
                    variant={
                      selectedCategory === category ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="gap-1"
                  >
                    <Icon className="h-3 w-3" />
                    {title} ({count})
                  </Button>
                ),
              )}
            </div>

            {/* Insights Display */}
            <div
              className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}
            >
              <AnimatePresence>
                {filteredInsights.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    <FlexibleInsightRenderer
                      insight={insight}
                      className="h-full hover:shadow-lg transition-shadow duration-200"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      {insight.metadata?.priority && (
                        <Badge
                          className={
                            getPriorityInfo(insight.metadata.priority).color
                          }
                        >
                          {getPriorityInfo(insight.metadata.priority).label}
                        </Badge>
                      )}
                      {insight.metadata?.confidence && (
                        <Badge variant="outline">
                          {Math.round(insight.metadata.confidence * 100)}%
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredInsights.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {t.noInsightsFound ||
                      "No insights found for the selected category."}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryStats.map(
                ({
                  category,
                  count,
                  highPriority,
                  title,
                  icon: Icon,
                  color,
                  description,
                }) => (
                  <Card
                    key={category}
                    className={`cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 ${color.split(" ")[2]}`}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span>{title}</span>
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </CardTitle>
                      <CardDescription>{description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {t.highPriority || "High Priority"}
                        </span>
                        <Badge
                          variant={
                            highPriority > 0 ? "destructive" : "secondary"
                          }
                        >
                          {highPriority}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => {
                          setSelectedCategory(category);
                          setActiveTab("insights");
                        }}
                      >
                        {t.viewInsights || "View Insights"}
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                ),
              )}
            </div>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {keyMetrics.map(({ key, value, label }) => (
                <Card key={key}>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">
                        {label}
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {typeof value === "number" && value <= 1 && value >= 0
                          ? `${Math.round(value * 100)}%`
                          : String(value)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}
