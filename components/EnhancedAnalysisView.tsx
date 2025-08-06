"use client";

import React, { useState, useMemo, useEffect, useCallback, memo } from "react";
// Removed unused notification provider import
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
import { Brain, Heart, Hash, MessageCircle, Target, Globe, TrendingUp, Network, Sparkles, Activity, Eye, Shield, Star, Award, ChevronRight, List, Download, Share2, Printer, Copy, Maximize2, RefreshCw, GitCompare, BarChart, Calendar, Clock, Users, Zap, BookOpen } from "lucide-react";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import Filter from "lucide-react/dist/esm/icons/filter";
import Grid from "lucide-react/dist/esm/icons/grid-3x3";
import MoreHorizontal from "lucide-react/dist/esm/icons/more-horizontal";
import PieChart from "lucide-react/dist/esm/icons/pie-chart";
import LineChart from "lucide-react/dist/esm/icons/line-chart";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import { motion, AnimatePresence } from "framer-motion";
import type { AnalysisResult, Insight } from "@/types";
import { getTemplateById } from "@/app/actions/templates";
import { useEnhancedLanguage } from "@/components/EnhancedLanguageProvider";
import FlexibleInsightRenderer from "@/components/FlexibleInsightRenderer";
import { themeConfig } from "@/lib/theme-config";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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
      color: "text-purple-300 bg-purple-500/20 border-purple-500/30",
      description:
        t.psychologyDescription ||
        "Deep psychological analysis and behavioral patterns",
    },
    relationship: {
      title: t.relationshipInsights || "Relationship",
      icon: Heart,
      color: "text-pink-300 bg-pink-500/20 border-pink-500/30",
      description:
        t.relationshipDescription ||
        "Relationship dynamics and interpersonal connections",
    },
    communication: {
      title: t.communicationInsights || "Communication",
      icon: MessageCircle,
      color: "text-blue-300 bg-blue-500/20 border-blue-500/30",
      description:
        t.communicationDescription ||
        "Communication patterns and effectiveness",
    },
    emotional: {
      title: t.emotionalInsights || "Emotional",
      icon: Heart,
      color: "text-red-300 bg-red-500/20 border-red-500/30",
      description:
        t.emotionalDescription || "Emotional intelligence and regulation",
    },
    leadership: {
      title: t.leadershipInsights || "Leadership",
      icon: Target,
      color: "text-indigo-300 bg-indigo-500/20 border-indigo-500/30",
      description:
        t.leadershipDescription || "Leadership competencies and team dynamics",
    },
    business: {
      title: t.businessInsights || "Business",
      icon: BarChart3,
      color: "text-green-300 bg-green-500/20 border-green-500/30",
      description:
        t.businessDescription || "Professional and business analysis",
    },
    coaching: {
      title: t.coachingInsights || "Coaching",
      icon: Award,
      color: "text-yellow-300 bg-yellow-500/20 border-yellow-500/30",
      description: t.coachingDescription || "Development and goal achievement",
    },
    clinical: {
      title: t.clinicalInsights || "Clinical",
      icon: Shield,
      color: "text-teal-300 bg-teal-500/20 border-teal-500/30",
      description:
        t.clinicalDescription || "Therapeutic and mental health indicators",
    },
    data: {
      title: t.dataInsights || "Data",
      icon: Activity,
      color: "text-cyan-300 bg-cyan-500/20 border-cyan-500/30",
      description: t.dataDescription || "Quantitative analysis and metrics",
    },
    subtext: {
      title: t.subtextInsights || "Subtext",
      icon: Eye,
      color: "text-orange-300 bg-orange-500/20 border-orange-500/30",
      description: t.subtextDescription || "Hidden meanings and intentions",
    },
    predictive: {
      title: t.predictiveInsights || "Predictive",
      icon: TrendingUp,
      color: "text-violet-300 bg-violet-500/20 border-violet-500/30",
      description:
        t.predictiveDescription || "Future trajectory and forecasting",
    },
    general: {
      title: t.generalInsights || "General",
      icon: Sparkles,
      color: "text-gray-300 bg-gray-500/20 border-gray-500/30",
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
      color: "bg-red-500/20 border-red-500/30",
      textColor: "text-red-300",
    };
  if (priority >= 4)
    return {
      label: "High",
      color: "bg-orange-500/20 border-orange-500/30",
      textColor: "text-orange-300",
    };
  if (priority >= 3)
    return {
      label: "Medium",
      color: "bg-blue-500/20 border-blue-500/30",
      textColor: "text-blue-300",
    };
  if (priority >= 2)
    return { label: "Low", color: "bg-green-500/20 border-green-500/30", textColor: "text-green-300" };
  return { label: "Info", color: "bg-gray-500/20 border-gray-500/30", textColor: "text-gray-300" };
};

// Memoized sub-components for better performance
const InsightCard = memo(({ insight, index }: { insight: any; index: number }) => {
  const priorityInfo = useMemo(() => getPriorityInfo(insight.metadata?.priority || 0), [insight.metadata?.priority]);
  
  return (
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
          <Badge className={priorityInfo.color}>
            {priorityInfo.label}
          </Badge>
        )}
        {insight.metadata?.confidence && (
          <Badge variant="outline" className="border-white/30 text-white bg-white/10">
            {Math.round(insight.metadata.confidence * 100)}%
          </Badge>
        )}
      </div>
    </motion.div>
  );
});

InsightCard.displayName = 'InsightCard';

const QuickStatsCard = memo(({ title, value, icon: Icon, color }: { 
  title: string; 
  value: string | number; 
  icon: any; 
  color?: string; 
}) => (
  <Card className={cn(
    themeConfig.colors.glass.background,
    themeConfig.colors.glass.border,
    themeConfig.colors.glass.shadow,
    "border"
  )}>
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className={cn("text-2xl font-bold", color || "text-purple-400")}>
            {value}
          </p>
        </div>
        <Icon className={cn("h-8 w-8", color || "text-purple-400/60")} />
      </div>
    </CardContent>
  </Card>
));

QuickStatsCard.displayName = 'QuickStatsCard';

function EnhancedAnalysisView({
  analysisData,
  templateId,
  coachOpen,
  setCoachOpen,
}: EnhancedAnalysisViewProps) {
  const { translations: t, isRTL, direction } = useEnhancedLanguage();
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [template, setTemplate] = useState<any>(null);
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [chartType, setChartType] = useState<"pie" | "bar" | "line">("pie");
  
  // Story-related state
  const [existingStory, setExistingStory] = useState<any>(null);
  const [storyLoading, setStoryLoading] = useState(false);
  const [storyGenerating, setStoryGenerating] = useState(false);

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

  // Check for existing story related to this analysis
  useEffect(() => {
    const checkForExistingStory = async () => {
      if (!session?.user?.id || !analysisData.id) return;
      
      setStoryLoading(true);
      try {
        const response = await fetch(`/api/stories?analysisId=${analysisData.id}`);
        const data = await response.json();
        
        if (data.success && data.stories && data.stories.length > 0) {
          setExistingStory(data.stories[0]); // Take the first/most recent story
        }
      } catch (error) {
        console.error('Failed to check for existing story:', error);
      } finally {
        setStoryLoading(false);
      }
    };

    checkForExistingStory();
  }, [session?.user?.id, analysisData.id]);

  // Handle story generation (memoized to prevent re-creation)
  const handleGenerateStory = useCallback(async () => {
    if (!session?.user?.id || !analysisData.id) return;
    
    setStoryGenerating(true);
    try {
      const response = await fetch('/api/story/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisId: analysisData.id,
          analysisData: analysisData,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setExistingStory(data.story);
        // Show success message or redirect
      } else {
        console.error('Story generation failed:', data.error);
        // Show error message
      }
    } catch (error) {
      console.error('Failed to generate story:', error);
      // Show error message
    } finally {
      setStoryGenerating(false);
    }
  }, [session?.user?.id, analysisData.id]);

  // Handle view story (memoized)
  const handleViewStory = useCallback(() => {
    if (existingStory?.id) {
      router.push(`/story/${existingStory.id}`);
    }
  }, [existingStory?.id, router]);

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
      className={`min-h-screen p-4 ${direction === "rtl" ? "rtl" : "ltr"}`}
      dir={direction}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-3 rounded-xl",
              "bg-gradient-to-br from-purple-500/20 to-blue-500/20",
              "border border-white/20"
            )}>
              <BarChart3 className="h-8 w-8 text-purple-400" />
            </div>
            <div>
              <h1 className={cn(
                "text-3xl font-bold",
                themeConfig.typography.gradient
              )}>
                {t.detailedAnalysis}
              </h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {analysisData.detectedLanguage && (
                  <Badge className="gap-1 bg-green-600/20 border-green-500/30 text-green-200">
                    <Globe className="h-3 w-3" />
                    {t.detectedLanguage}: {analysisData.detectedLanguage}
                  </Badge>
                )}
                {template && (
                  <Badge variant="outline" className="gap-1 border-white/20 text-white bg-white/5">
                    <span>{template.icon}</span>
                    {template.name}
                  </Badge>
                )}
                <Badge className="gap-1 bg-blue-600/20 border-blue-500/30 text-blue-200">
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
              className={cn(
                "bg-white/10 border-white/20 text-white",
                "hover:bg-white/20 hover:border-white/30",
                themeConfig.animation.transition
              )}
            >
              {viewMode === "grid" ? (
                <List className="h-4 w-4" />
              ) : (
                <Grid className="h-4 w-4" />
              )}
            </Button>
            
            {/* Story Generation/View Button */}
            {session?.user && (
              <Button
                onClick={existingStory ? handleViewStory : handleGenerateStory}
                disabled={storyLoading || storyGenerating}
                className={cn(
                  "gap-2",
                  existingStory 
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700",
                  "text-white font-medium",
                  "hover:opacity-90",
                  themeConfig.animation.transition,
                  themeConfig.animation.hover
                )}
              >
                {storyLoading || storyGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : existingStory ? (
                  <BookOpen className="h-4 w-4" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {storyLoading 
                  ? "Checking..." 
                  : storyGenerating 
                    ? "Generating..." 
                    : existingStory 
                      ? "View Story" 
                      : "Generate Story"}
              </Button>
            )}
            
            <Button
              onClick={() => setCoachOpen && setCoachOpen(true)}
              className={cn(
                "gap-2",
                "bg-gradient-to-r",
                themeConfig.colors.gradients.button,
                "text-white font-medium",
                "hover:opacity-90",
                themeConfig.animation.transition,
                themeConfig.animation.hover
              )}
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
          <TabsList className={cn(
            "grid w-full grid-cols-4",
            "bg-white/5 border border-white/10"
          )}>
            <TabsTrigger 
              value="overview"
              className="text-white data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              {t.overview}
            </TabsTrigger>
            <TabsTrigger 
              value="insights"
              className="text-white data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              {t.insights || "Insights"}
            </TabsTrigger>
            <TabsTrigger 
              value="categories"
              className="text-white data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              {t.categories || "Categories"}
            </TabsTrigger>
            <TabsTrigger 
              value="metrics"
              className="text-white data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              {t.metrics || "Metrics"}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Executive Summary Card */}
            <Card className={cn(
              "border-l-4 border-l-purple-500",
              themeConfig.colors.glass.background,
              themeConfig.colors.glass.border,
              themeConfig.colors.glass.shadow,
              "border"
            )}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Network className="h-5 w-5" />
                  {t.overallSummary}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p 
                  className="text-lg leading-relaxed text-gray-300"
                  dir="auto"
                  style={{
                    unicodeBidi: 'plaintext',
                    textAlign: 'start',
                    lineHeight: '1.6',
                    wordBreak: 'break-word',
                    textRendering: 'optimizeLegibility'
                  }}
                >
                  {analysisData.overallSummary}
                </p>
              </CardContent>
            </Card>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <QuickStatsCard
                title={t.totalInsights || "Total Insights"}
                value={analysisData.insights?.length || 0}
                icon={Sparkles}
              />
              
              <QuickStatsCard
                title={t.categories || "Categories"}
                value={categoryStats.length}
                icon={Hash}
              />
              
              <QuickStatsCard
                title={t.highPriority || "High Priority"}
                value={categoryStats.reduce((sum, cat) => sum + cat.highPriority, 0)}
                icon={AlertTriangle}
                color="text-orange-400"
              />
              
              <QuickStatsCard
                title={t.keyMetrics || "Key Metrics"}
                value={keyMetrics.length}
                icon={BarChart3}
              />
            </div>

            {/* Top Priority Insights */}
            <Card className={cn(
              themeConfig.colors.glass.background,
              themeConfig.colors.glass.border,
              themeConfig.colors.glass.shadow,
              "border"
            )}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Star className="h-5 w-5" />
                  {t.topPriorityInsights || "Top Priority Insights"}
                </CardTitle>
                <CardDescription className="text-gray-400">
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
                <span className="text-sm font-medium text-white">
                  {t.filterBy || "Filter by"}:
                </span>
              </div>
              <Button
                variant={selectedCategory === null ? "secondary" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  selectedCategory === null 
                    ? "bg-purple-600 hover:bg-purple-700 text-white" 
                    : "bg-white/10 border-white/20 text-white hover:bg-white/20",
                  themeConfig.animation.transition
                )}
              >
                {t.all || "All"} (
                {Object.values(organizedInsights).flat().length})
              </Button>
              {categoryStats.map(
                ({ category, count, title, icon: Icon, color }) => (
                  <Button
                    key={category}
                    variant={
                      selectedCategory === category ? "secondary" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      "gap-1",
                      selectedCategory === category 
                        ? "bg-purple-600 hover:bg-purple-700 text-white" 
                        : "bg-white/10 border-white/20 text-white hover:bg-white/20",
                      themeConfig.animation.transition
                    )}
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
                  <InsightCard
                    key={`insight-${index}-${insight.title || index}`}
                    insight={insight}
                    index={index}
                  />
                ))}
              </AnimatePresence>
            </div>

            {filteredInsights.length === 0 && (
              <Card className={cn(
                themeConfig.colors.glass.background,
                themeConfig.colors.glass.border,
                themeConfig.colors.glass.shadow,
                "border"
              )}>
                <CardContent className="p-8 text-center">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">
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
                    className={cn(
                      "cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4",
                      color.split(" ")[2],
                      themeConfig.colors.glass.background,
                      themeConfig.colors.glass.border,
                      themeConfig.colors.glass.shadow,
                      "border"
                    )}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span>{title}</span>
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </CardTitle>
                      <CardDescription className="text-gray-400">{description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">
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
                <Card key={key} className={cn(
                  themeConfig.colors.glass.background,
                  themeConfig.colors.glass.border,
                  themeConfig.colors.glass.shadow,
                  "border"
                )}>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-400 mb-1">
                        {label}
                      </p>
                      <p className="text-2xl font-bold text-purple-400">
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

// Export memoized component for better performance
export default memo(EnhancedAnalysisView);
