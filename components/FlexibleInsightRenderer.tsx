"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Users,
  Brain,
  Heart,
  Hash,
  Target,
  MessageCircle,
  Zap,
  Eye,
  Lightbulb,
  Shield,
  Activity,
  Star,
  Award,
  CheckCircle2,
  AlertTriangle,
  Info,
  PieChart,
  LineChart,
  Calendar,
  Globe,
  Settings,
  Layers,
  Network,
  Sparkles,
} from "lucide-react";
import {
  LineVisualization,
  BarVisualization,
} from "@/components/visualization";
import type {
  Insight,
  InsightType,
  InsightMetadata,
} from "@/src/types/analysis";
import { useEnhancedLanguage } from "@/components/EnhancedLanguageProvider";
import { getComprehensiveTranslations } from "@/lib/comprehensive-translations";

interface FlexibleInsightRendererProps {
  insight: Insight;
  className?: string;
}

// Icon mapping for different insight types and categories
const getInsightIcon = (insight: Insight) => {
  // If metadata has a specific icon, use it
  if (insight.metadata?.icon) {
    const iconMap: Record<string, React.ComponentType<any>> = {
      brain: Brain,
      heart: Heart,
      users: Users,
      target: Target,
      zap: Zap,
      eye: Eye,
      lightbulb: Lightbulb,
      shield: Shield,
      activity: Activity,
      star: Star,
      award: Award,
      check: CheckCircle2,
      alert: AlertTriangle,
      info: Info,
      chart: BarChart3,
      pie: PieChart,
      line: LineChart,
      calendar: Calendar,
      globe: Globe,
      settings: Settings,
      layers: Layers,
      network: Network,
      sparkles: Sparkles,
      hash: Hash,
      message: MessageCircle,
      clock: Clock,
      trending: TrendingUp,
    };

    return iconMap[insight.metadata.icon] || Info;
  }

  // Default icons based on insight type
  switch (insight.type) {
    case "text":
      return MessageCircle;
    case "list":
      return Layers;
    case "score":
      return Target;
    case "timeline":
      return Clock;
    case "metric":
      return BarChart3;
    case "chart":
      return PieChart;
    case "category":
      return Hash;
    default:
      return Info;
  }
};

// Color theme mapping
const getColorTheme = (insight: Insight) => {
  if (insight.metadata?.color) {
    return insight.metadata.color;
  }

  const category = insight.metadata?.category;
  switch (category) {
    case "psychology":
      return "purple";
    case "relationship":
      return "pink";
    case "communication":
      return "blue";
    case "emotional":
      return "red";
    case "leadership":
      return "indigo";
    case "business":
      return "green";
    case "coaching":
      return "yellow";
    case "clinical":
      return "teal";
    case "data":
      return "cyan";
    case "subtext":
      return "orange";
    case "predictive":
      return "violet";
    default:
      return "gray";
  }
};

// Text insight renderer
const TextInsightRenderer: React.FC<{ insight: Insight }> = ({ insight }) => {
  const IconComponent = getInsightIcon(insight);
  const colorTheme = getColorTheme(insight);
  const { translations: t } = useEnhancedLanguage();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <IconComponent className={`h-4 w-4 text-${colorTheme}-500`} />
        <span className="text-sm font-medium">{insight.title}</span>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        {typeof insight.content === "string"
          ? insight.content
          : JSON.stringify(insight.content)}
      </p>
    </div>
  );
};

// List insight renderer
const ListInsightRenderer: React.FC<{ insight: Insight }> = ({ insight }) => {
  const IconComponent = getInsightIcon(insight);
  const colorTheme = getColorTheme(insight);

  const items = Array.isArray(insight.content)
    ? insight.content
    : [insight.content];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <IconComponent className={`h-4 w-4 text-${colorTheme}-500`} />
        <span className="text-sm font-medium">{insight.title}</span>
      </div>
      <ul className="space-y-1 text-sm">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
            <span className="text-gray-700 dark:text-gray-300">
              {typeof item === "string" ? item : JSON.stringify(item)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Score insight renderer
const ScoreInsightRenderer: React.FC<{ insight: Insight }> = ({ insight }) => {
  const IconComponent = getInsightIcon(insight);
  const colorTheme = getColorTheme(insight);

  const score = typeof insight.content === "number" ? insight.content : 0;
  // Updated for 1-100 scale
  const maxScore = 100;
  const percentage = Math.min((score / maxScore) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <IconComponent className={`h-4 w-4 text-${colorTheme}-500`} />
        <span className="text-sm font-medium">{insight.title}</span>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-300">Score</span>
          <span className="font-medium">
            {score}/{maxScore}
          </span>
        </div>
        <Progress value={percentage} className="h-2" />
      </div>
    </div>
  );
};

// Metric insight renderer
const MetricInsightRenderer: React.FC<{ insight: Insight }> = ({ insight }) => {
  const IconComponent = getInsightIcon(insight);
  const colorTheme = getColorTheme(insight);

  const renderMetricValue = (value: any) => {
    if (typeof value === "number") {
      // Handle 1-100 scale display
      if (value >= 1 && value <= 100) {
        return value.toLocaleString();
      }
      return value.toLocaleString();
    }
    if (typeof value === "string") {
      return value;
    }
    return JSON.stringify(value);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <IconComponent className={`h-4 w-4 text-${colorTheme}-500`} />
        <span className="text-sm font-medium">{insight.title}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">
        {renderMetricValue(insight.content)}
        {insight.metadata?.unit && (
          <span className="text-sm text-gray-500 ml-1">
            {insight.metadata.unit}
          </span>
        )}
      </div>
    </div>
  );
};

// Timeline insight renderer
const TimelineInsightRenderer: React.FC<{ insight: Insight }> = ({
  insight,
}) => {
  const IconComponent = getInsightIcon(insight);
  const colorTheme = getColorTheme(insight);

  const items = Array.isArray(insight.content)
    ? insight.content
    : [insight.content];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <IconComponent className={`h-4 w-4 text-${colorTheme}-500`} />
        <span className="text-sm font-medium">{insight.title}</span>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded"
          >
            <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <div className="text-sm font-medium">
                {typeof item === "string"
                  ? item
                  : item.title || item.name || JSON.stringify(item)}
              </div>
              {typeof item === "object" && item !== null && item.timestamp && (
                <div className="text-xs text-gray-500 mt-1">
                  {item.timestamp}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Chart insight renderer - Enhanced with comprehensive fallbacks and translations
const ChartInsightRenderer: React.FC<{ insight: Insight }> = ({ insight }) => {
  const { metadata, content } = insight;
  const { translations: t, language } = useEnhancedLanguage();

  // Enhanced chart type inference with comprehensive fallbacks
  if (!metadata?.chartTypeHint || !metadata?.xDataKey || !metadata?.yDataKey) {
    // Fallback: Try to infer chart type from content structure
    if (Array.isArray(content) && content.length > 0) {
      const firstItem = content[0];
      if (typeof firstItem === "object" && firstItem !== null) {
        const keys = Object.keys(firstItem);

        // Enhanced pattern detection for various chart types
        let inferredType = null;
        let xKey = null;
        let yKey = null;
        let unit = metadata?.unit || t.scoreUnit;

        // Pattern 1: Time series data (timestamp + intensity/emotion/value/score)
        if (
          keys.includes("timestamp") ||
          keys.includes("time") ||
          keys.includes("period")
        ) {
          xKey =
            keys.find((k) => ["timestamp", "time", "period"].includes(k)) ||
            keys[0];
          yKey =
            keys.find((k) =>
              [
                "intensity",
                "emotion",
                "value",
                "score",
                "level",
                "rating",
              ].includes(k),
            ) || keys[1];
          inferredType = "line";
          unit =
            yKey === "intensity"
              ? t.intensityUnit
              : yKey === "score"
                ? t.scoreUnit
                : t.levelUnit;
        }
        // Pattern 2: Category data (name/component/category + value/score/level/rating)
        else if (
          keys.includes("name") ||
          keys.includes("component") ||
          keys.includes("category")
        ) {
          xKey =
            keys.find((k) =>
              ["name", "component", "category", "label"].includes(k),
            ) || keys[0];
          yKey =
            keys.find((k) =>
              [
                "relevance",
                "value",
                "score",
                "level",
                "rating",
                "strength",
                "intensity",
              ].includes(k),
            ) || keys[1];
          inferredType = "bar";
          unit =
            yKey === "relevance"
              ? t.relevance
              : yKey === "score"
                ? t.scoreUnit
                : t.levelUnit;
        }
        // Pattern 3: Generic two-column data
        else if (keys.length >= 2) {
          xKey = keys[0];
          yKey = keys[1];
          inferredType = keys[0].toLowerCase().includes("time")
            ? "line"
            : "bar";
          unit = yKey.charAt(0).toUpperCase() + yKey.slice(1);
        }

        if (inferredType && xKey && yKey) {
          const chartColor =
            metadata?.mainColor || metadata?.color || "#00FFC2";

          if (inferredType === "line") {
            return (
              <div className="h-64 w-full">
                <LineVisualization
                  data={content as any[]}
                  xDataKey={xKey}
                  yDataKey={yKey}
                  lineColor={chartColor}
                  unit={unit}
                />
              </div>
            );
          } else {
            return (
              <div className="h-64 w-full">
                <BarVisualization
                  data={content as any[]}
                  xDataKey={xKey}
                  yDataKey={yKey}
                  barColor={chartColor}
                  unit={unit}
                />
              </div>
            );
          }
        }
      }
    }

    // Enhanced fallback with proper translations and data structure analysis
    return (
      <div className="p-4 bg-muted/20 rounded-lg border-2 border-dashed border-muted">
        <div className="text-sm font-medium mb-2 flex items-center gap-2">
          📊 {insight.title}
        </div>
        <div className="text-sm text-muted-foreground mb-3">
          {t.chartDataDetected}
        </div>
        {Array.isArray(content) && content.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              {t.dataPointsCount}: {content.length}
            </div>
            <div className="text-xs text-muted-foreground">
              {t.availableFields}:{" "}
              {typeof content[0] === "object"
                ? Object.keys(content[0]).join(", ")
                : t.dataPointsCount}
            </div>
            {/* Simple data table fallback */}
            <div className="max-h-32 overflow-y-auto mt-2">
              <div className="grid gap-1 text-xs">
                {content.slice(0, 5).map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between p-1 bg-background rounded"
                  >
                    <span>
                      {typeof item === "object"
                        ? item.name ||
                          item.component ||
                          item.category ||
                          `Item ${i + 1}`
                        : item}
                    </span>
                    <span>
                      {typeof item === "object"
                        ? item.value ||
                          item.score ||
                          item.level ||
                          item.intensity ||
                          "N/A"
                        : ""}
                    </span>
                  </div>
                ))}
                {content.length > 5 && (
                  <div className="text-center text-muted-foreground">
                    ... {t.moreItems} {content.length - 5} {t.moreItems}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!Array.isArray(content)) {
    return (
      <div className="text-red-500 p-4">
        {t.error}: Chart content must be an array of data points.
      </div>
    );
  }

  const chartData = content as any[];
  const dynamicColor = metadata.mainColor || metadata.color || "#00FFC2";

  // Render specific chart based on hint
  switch (metadata.chartTypeHint) {
    case "line":
      return (
        <div className="h-64 w-full">
          <LineVisualization
            data={chartData}
            xDataKey={metadata.xDataKey}
            yDataKey={metadata.yDataKey}
            lineColor={dynamicColor}
            unit={metadata.unit || t.scoreUnit}
          />
        </div>
      );
    case "bar":
      return (
        <div className="h-64 w-full">
          <BarVisualization
            data={chartData}
            xDataKey={metadata.xDataKey}
            yDataKey={metadata.yDataKey}
            barColor={dynamicColor}
            unit={metadata.unit || t.scoreUnit}
          />
        </div>
      );
    default:
      return (
        <div className="text-muted-foreground p-4">
          Unsupported chart type: {metadata.chartTypeHint}
        </div>
      );
  }
};

// Table insight renderer
const TableInsightRenderer: React.FC<{ insight: Insight }> = ({ insight }) => {
  const IconComponent = getInsightIcon(insight);
  const colorTheme = getColorTheme(insight);

  // Handle different table formats
  let tableData: any[] = [];
  let headers: string[] = [];

  if (Array.isArray(insight.content)) {
    tableData = insight.content;
    if (tableData.length > 0 && typeof tableData[0] === "object") {
      headers = Object.keys(tableData[0]);
    }
  } else if (typeof insight.content === "object" && insight.content !== null) {
    const contentObj = insight.content as any;
    if (contentObj.headers && contentObj.rows) {
      headers = contentObj.headers;
      tableData = contentObj.rows;
    } else {
      // Convert object to table format
      tableData = Object.entries(insight.content).map(([key, value]) => ({
        key,
        value: typeof value === "object" ? JSON.stringify(value) : value,
      }));
      headers = ["key", "value"];
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <IconComponent className={`h-4 w-4 text-${colorTheme}-500`} />
        <span className="text-sm font-medium">{insight.title}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              {headers.map((header, i) => (
                <th
                  key={i}
                  className="text-left font-medium text-gray-600 dark:text-gray-300 p-2"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, i) => (
              <tr key={i} className="border-b">
                {headers.map((header, j) => (
                  <td key={j} className="p-2 text-gray-700 dark:text-gray-300">
                    {typeof row === "object" ? row[header] : row}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Category insight renderer
const CategoryInsightRenderer: React.FC<{ insight: Insight }> = ({
  insight,
}) => {
  const IconComponent = getInsightIcon(insight);
  const colorTheme = getColorTheme(insight);

  // Handle different category formats
  let categories: Array<{
    name: string;
    count?: number;
    percentage?: number;
    items?: any[];
  }> = [];

  if (Array.isArray(insight.content)) {
    categories = insight.content.map((item) => {
      if (typeof item === "string") {
        return { name: item };
      }
      if (typeof item === "object" && item !== null) {
        return {
          name: item.name || item.category || "Unknown",
          count: item.count,
          percentage: item.percentage,
          items: item.items,
        };
      }
      return { name: String(item) };
    });
  } else if (typeof insight.content === "object" && insight.content !== null) {
    categories = Object.entries(insight.content).map(([key, value]) => ({
      name: key,
      count: Array.isArray(value)
        ? value.length
        : typeof value === "number"
          ? value
          : Array.isArray(value)
            ? value.length
            : 1,
      items: Array.isArray(value) ? value : [value],
    }));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <IconComponent className={`h-4 w-4 text-${colorTheme}-500`} />
        <span className="text-sm font-medium">{insight.title}</span>
      </div>
      <div className="space-y-2">
        {categories.map((category, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
          >
            <span className="text-sm font-medium">{category.name}</span>
            <div className="flex items-center gap-2">
              {category.count && (
                <Badge variant="secondary" className="text-xs">
                  {category.count}
                </Badge>
              )}
              {category.percentage && (
                <Badge variant="outline" className="text-xs">
                  {Math.round(category.percentage)}%
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main flexible insight renderer component
const FlexibleInsightRenderer: React.FC<FlexibleInsightRendererProps> = ({
  insight,
  className = "",
}) => {
  const priority = insight.metadata?.priority || 3;
  const colorTheme = getColorTheme(insight);

  const getPriorityBorderClass = () => {
    if (priority >= 5) return "border-red-200 dark:border-red-800";
    if (priority >= 4) return "border-orange-200 dark:border-orange-800";
    if (priority >= 3) return "border-blue-200 dark:border-blue-800";
    if (priority >= 2) return "border-green-200 dark:border-green-800";
    return "border-gray-200 dark:border-gray-800";
  };

  const renderInsightContent = () => {
    switch (insight.type) {
      case "text":
        return <TextInsightRenderer insight={insight} />;
      case "list":
        return <ListInsightRenderer insight={insight} />;
      case "score":
        return <ScoreInsightRenderer insight={insight} />;
      case "timeline":
        return <TimelineInsightRenderer insight={insight} />;
      case "metric":
        return <MetricInsightRenderer insight={insight} />;
      case "chart":
        return <ChartInsightRenderer insight={insight} />;
      case "category":
        return <CategoryInsightRenderer insight={insight} />;
      case "table":
        return <TableInsightRenderer insight={insight} />;
      default:
        return <TextInsightRenderer insight={insight} />;
    }
  };

  return (
    <Card className={`${className} ${getPriorityBorderClass()}`}>
      <CardContent className="p-4">
        {renderInsightContent()}
        {insight.metadata?.timestamp && (
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {insight.metadata.timestamp}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FlexibleInsightRenderer;
