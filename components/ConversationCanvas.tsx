"use client";

import React, { useState, useCallback, useMemo } from "react";
import "@xyflow/react/dist/style.css";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  ConnectionMode,
  Position,
  Handle,
} from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Brain,
  Heart,
  Hash,
  Users,
  Network,
  List,
  Zap,
  Target,
  TrendingUp,
  Globe,
} from "lucide-react";
import { motion } from "framer-motion";
import type { AnalysisResult } from "@/types";
import { getAnalysisTemplate } from "@/lib/analysis-templates";
// Type definitions for visualization nodes
interface EmotionNode {
  id: string;
  type: 'emotion';
  emotion: string;
  intensity: number;
  timestamp: string;
}

interface TopicNode {
  id: string;
  type: 'topic';
  topic: string;
  mentions: number;
}

interface CentralNode {
  id: string;
  type: 'central';
  label: string;
}

interface PersonalityDetailNode {
  id: string;
  type: 'personality';
  trait: string;
  strength: number;
}

interface EmotionDetailNode {
  id: string;
  type: 'emotion-detail';
  emotion: string;
  intensity: number;
  context: string;
}

interface TopicDetailNode {
  id: string;
  type: 'topic-detail';
  topic: string;
  details: string;
}

interface PatternDetailNode {
  id: string;
  type: 'pattern';
  pattern: string;
  frequency: number;
}

interface ConversationNode {
  id: string;
  type: 'conversation';
  message: string;
  timestamp: string;
}

// Dynamic Component Registry for different template visualizations
const VisualizationModes = {
  "communication-analysis": "default",
  "relationship-analysis": "relationship",
  "business-meeting": "business",
  "therapeutic-analysis": "clinical",
  "conflict-resolution": "conflict",
} as const;

// Enhanced nodes that adapt to different template types
interface PersonalityNodeProps {
  data: {
    traits: string[];
    summary?: string;
    templateType?: string;
  };
  selected: boolean;
}

const AdaptivePersonalityNode = ({ data, selected }: PersonalityNodeProps) => {
  const templateType = data.templateType || "general";
  const getColorScheme = () => {
    switch (templateType) {
      case "relationship":
        return {
          bg: "bg-pink-100 dark:bg-pink-900/30",
          text: "text-pink-600",
          border: "border-pink-300/60",
        };
      case "business":
        return {
          bg: "bg-purple-100 dark:bg-purple-900/30",
          text: "text-purple-600",
          border: "border-purple-300/60",
        };
      case "clinical":
        return {
          bg: "bg-green-100 dark:bg-green-900/30",
          text: "text-green-600",
          border: "border-green-300/60",
        };
      case "conflict":
        return {
          bg: "bg-orange-100 dark:bg-orange-900/30",
          text: "text-orange-600",
          border: "border-orange-300/60",
        };
      default:
        return {
          bg: "bg-blue-100 dark:bg-blue-900/30",
          text: "text-blue-600",
          border: "border-blue-300/60",
        };
    }
  };

  const colors = getColorScheme();

  return (
    <div
      className={`bg-white dark:bg-gray-800 border-2 ${selected ? `${colors.border.replace("300/60", "500")} shadow-xl scale-105` : colors.border} rounded-xl p-4 min-w-[240px] max-w-[240px] shadow-lg cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200`}
    >
      <Handle
        type="source"
        position={Position.Right}
        className={`w-4 h-4 ${colors.text.replace("text-", "bg-")} border-2 border-white`}
      />
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 ${colors.bg} rounded-lg`}>
          <Brain className={`h-5 w-5 ${colors.text}`} />
        </div>
        <span className={`font-bold text-sm ${colors.text}`}>
          {templateType === "relationship"
            ? "Relationship Traits"
            : templateType === "business"
              ? "Professional Traits"
              : templateType === "clinical"
                ? "Psychological Patterns"
                : templateType === "conflict"
                  ? "Negotiation Style"
                  : "Personality Traits"}
        </span>
      </div>
      <div className="space-y-2">
        {data.traits.slice(0, 3).map((trait: string, i: number) => (
          <div
            key={i}
            className={`${colors.bg.replace("100", "50").replace("900/30", "900/20")} px-3 py-2 rounded-lg text-xs font-medium ${colors.text} border ${colors.border.replace("/60", "")}`}
          >
            {trait}
          </div>
        ))}
        {data.traits.length > 3 && (
          <div className="text-gray-500 text-xs font-medium text-center pt-1">
            +{data.traits.length - 3} more traits
          </div>
        )}
      </div>
    </div>
  );
};

interface PatternNodeProps {
  data: {
    pattern: string;
    examples: string[];
    impact: string;
    templateType?: string;
  };
  selected: boolean;
}

const AdaptivePatternNode = ({ data, selected }: PatternNodeProps) => {
  const templateType = data.templateType || "general";
  const getPatternTypeAndColor = () => {
    switch (templateType) {
      case "relationship":
        return {
          icon: Heart,
          color: "purple",
          label: "Relationship Pattern",
          bg: "bg-purple-100 dark:bg-purple-900/30",
          text: "text-purple-600",
          border: "border-purple-300/60",
        };
      case "business":
        return {
          icon: Target,
          color: "indigo",
          label: "Business Pattern",
          bg: "bg-indigo-100 dark:bg-indigo-900/30",
          text: "text-indigo-600",
          border: "border-indigo-300/60",
        };
      case "clinical":
        return {
          icon: Brain,
          color: "teal",
          label: "Clinical Pattern",
          bg: "bg-teal-100 dark:bg-teal-900/30",
          text: "text-teal-600",
          border: "border-teal-300/60",
        };
      case "conflict":
        return {
          icon: Zap,
          color: "red",
          label: "Conflict Pattern",
          bg: "bg-red-100 dark:bg-red-900/30",
          text: "text-red-600",
          border: "border-red-300/60",
        };
      default:
        return {
          icon: Users,
          color: "purple",
          label: "Communication Pattern",
          bg: "bg-purple-100 dark:bg-purple-900/30",
          text: "text-purple-600",
          border: "border-purple-300/60",
        };
    }
  };

  const { icon: Icon, bg, text, border, label } = getPatternTypeAndColor();

  return (
    <div
      className={`bg-white dark:bg-gray-800 border-2 ${selected ? border.replace("300/60", "500") : border} rounded-lg p-3 min-w-[220px] max-w-[280px] shadow-lg cursor-pointer hover:shadow-xl transition-all`}
    >
      <Handle
        type="source"
        position={Position.Right}
        className={`w-3 h-3 ${text.replace("text-", "bg-")}`}
      />
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 ${bg} rounded-lg`}>
          <Icon className={`h-4 w-4 ${text}`} />
        </div>
        <div>
          <span className={`font-semibold text-xs ${text} opacity-75`}>
            {label}
          </span>
          <div className="font-semibold text-sm">{data.pattern}</div>
        </div>
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
        {data.impact.slice(0, 80)}...
      </div>
      {data.examples && data.examples.length > 0 && (
        <div className="text-xs">
          <div className={`font-medium ${text} mb-1`}>Example:</div>
          <div
            className={`${bg.replace("100", "50").replace("900/30", "900/20")} p-2 rounded text-gray-700 dark:text-gray-300 italic border-l-2 ${border.replace("/60", "")}`}
          >
            "{data.examples[0].slice(0, 60)}..."
          </div>
        </div>
      )}
    </div>
  );
};

// Template-specific analysis panels
const RelationshipAnalysisPanel = ({
  analysisData,
}: {
  analysisData: AnalysisResult;
}) => (
  <div className="space-y-4">
    <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-lg border border-pink-200 dark:border-pink-800">
      <h3 className="font-semibold text-pink-700 dark:text-pink-300 mb-2 flex items-center gap-2">
        <Heart className="h-4 w-4" />
        Relationship Dynamics
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {analysisData.overallSummary}
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
        <h4 className="font-medium mb-2 text-pink-600 dark:text-pink-400">
          Emotional Connection
        </h4>
        <div className="space-y-1">
          {(() => {
            const emotionalInsight = analysisData.insights?.find(
              (insight) =>
                insight.type === "chart" &&
                insight.title?.toLowerCase().includes("emotional"),
            );
            const emotionalData = emotionalInsight?.content as any[];
            return (
              emotionalData?.slice(0, 3).map((emotion, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{emotion.emotion || emotion.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(
                      (emotion.intensity || emotion.score || 0) * 100,
                    )}
                    %
                  </Badge>
                </div>
              )) || (
                <span className="text-sm text-gray-500">
                  No emotional data available
                </span>
              )
            );
          })()}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
        <h4 className="font-medium mb-2 text-pink-600 dark:text-pink-400">
          Key Topics
        </h4>
        <div className="space-y-1">
          {(() => {
            const topicInsight = analysisData.insights?.find(
              (insight) =>
                insight.type === "chart" &&
                insight.title?.toLowerCase().includes("topic"),
            );
            const topicData = topicInsight?.content as any[];
            return (
              topicData?.slice(0, 3).map((topic, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{topic.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {Math.round((topic.relevance || topic.score || 0) * 100)}%
                  </Badge>
                </div>
              )) || (
                <span className="text-sm text-gray-500">
                  No topics available
                </span>
              )
            );
          })()}
        </div>
      </div>
    </div>
  </div>
);

const BusinessAnalysisPanel = ({
  analysisData,
}: {
  analysisData: AnalysisResult;
}) => (
  <div className="space-y-4">
    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
      <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-2">
        <Target className="h-4 w-4" />
        Business Meeting Analysis
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {analysisData.overallSummary}
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
        <h4 className="font-medium mb-2 text-purple-600 dark:text-purple-400">
          Leadership Style
        </h4>
        <div className="space-y-1">
          {analysisData.personality?.traits.slice(0, 2).map((trait, i) => (
            <Badge key={i} variant="secondary" className="text-xs block w-fit">
              {trait}
            </Badge>
          )) || (
            <span className="text-sm text-gray-500">
              No personality data available
            </span>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
        <h4 className="font-medium mb-2 text-purple-600 dark:text-purple-400">
          Meeting Efficiency
        </h4>
        <div className="space-y-1">
          {Array.isArray(analysisData.communicationPatterns) &&
            analysisData.communicationPatterns
              ?.filter(
                (p) =>
                  p.pattern?.toLowerCase().includes("efficiency") ||
                  p.pattern?.toLowerCase().includes("decision"),
              )
              .slice(0, 2)
              .map((pattern, i) => (
                <div key={i} className="text-sm text-gray-600 dark:text-gray-400">
                  {pattern.pattern}
                </div>
              )) || (
            <span className="text-sm text-gray-500">No patterns available</span>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
        <h4 className="font-medium mb-2 text-purple-600 dark:text-purple-400">
          Decision Making
        </h4>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {(() => {
            const topicInsight = analysisData.insights?.find(
              (insight) =>
                insight.type === "chart" &&
                insight.title?.toLowerCase().includes("topic"),
            );
            const topicData = topicInsight?.content as any[];
            const strategicTopic = topicData?.find(
              (t) =>
                t.name?.toLowerCase().includes("decision") ||
                t.name?.toLowerCase().includes("strategy"),
            );
            return strategicTopic?.name || "Strategic Discussion";
          })()}
        </div>
      </div>
    </div>
  </div>
);

const ClinicalAnalysisPanel = ({
  analysisData,
}: {
  analysisData: AnalysisResult;
}) => (
  <div className="space-y-4">
    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
      <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center gap-2">
        <Brain className="h-4 w-4" />
        Therapeutic Communication Analysis
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {analysisData.overallSummary}
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
        <h4 className="font-medium mb-2 text-green-600 dark:text-green-400">
          Emotional Processing
        </h4>
        <div className="space-y-2">
          {(() => {
            const emotionalInsight = analysisData.insights?.find(
              (insight) =>
                insight.type === "chart" &&
                insight.title?.toLowerCase().includes("emotional"),
            );
            const emotionalData = emotionalInsight?.content as any[];
            return (
              emotionalData?.map((emotion, i) => (
                <div
                  key={i}
                  className="bg-green-50 dark:bg-green-900/20 p-2 rounded text-sm"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{emotion.emotion}</span>
                    <span className="text-xs text-gray-500">
                      {emotion.timestamp}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {emotion.context}
                  </div>
                </div>
              )) || (
                <span className="text-sm text-gray-500">
                  No emotional data available
                </span>
              )
            );
          })()}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
        <h4 className="font-medium mb-2 text-green-600 dark:text-green-400">
          Coping Mechanisms
        </h4>
        <div className="space-y-1">
          {Array.isArray(analysisData.communicationPatterns) &&
            analysisData.communicationPatterns
              ?.filter(
                (p) =>
                  p.pattern?.toLowerCase().includes("coping") ||
                  p.pattern?.toLowerCase().includes("reflection") ||
                  p.pattern?.toLowerCase().includes("processing"),
              )
              .slice(0, 3)
              .map((pattern, i) => (
                <div key={i} className="text-sm">
                  <div className="font-medium text-green-600 dark:text-green-400">
                    {pattern.pattern}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {pattern.impact}
                  </div>
                </div>
              )) || (
            <span className="text-sm text-gray-500">
              No coping patterns available</span>
          )}
        </div>
      </div>
    </div>
  </div>
);

const ConflictAnalysisPanel = ({
  analysisData,
}: {
  analysisData: AnalysisResult;
}) => (
  <div className="space-y-4">
    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
      <h3 className="font-semibold text-orange-700 dark:text-orange-300 mb-2 flex items-center gap-2">
        <Zap className="h-4 w-4" />
        Conflict Resolution Analysis
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {analysisData.overallSummary}
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
        <h4 className="font-medium mb-2 text-orange-600 dark:text-orange-400">
          Conflict Escalation
        </h4>
        <div className="space-y-2">
          {(() => {
            const emotionalInsight = analysisData.insights?.find(
              (insight) =>
                insight.type === "chart" &&
                insight.title?.toLowerCase().includes("emotional"),
            );
            const emotionalData = emotionalInsight?.content as any[];
            const conflictEmotions = emotionalData?.filter(
              (e) =>
                e.emotion?.toLowerCase().includes("anger") ||
                e.emotion?.toLowerCase().includes("frustration") ||
                e.emotion?.toLowerCase().includes("tension"),
            );
            return (
              conflictEmotions?.map((emotion, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded"
                >
                  <span className="text-sm font-medium">{emotion.emotion}</span>
                  <Badge
                    variant={
                      emotion.intensity > 0.7
                        ? "destructive"
                        : emotion.intensity > 0.4
                          ? "secondary"
                          : "outline"
                    }
                    className="text-xs"
                  >
                    {Math.round((emotion.intensity || 0) * 100)}%
                  </Badge>
                </div>
              )) || (
                <span className="text-sm text-gray-500">
                  No conflict emotions detected
                </span>
              )
            );
          })()}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
        <h4 className="font-medium mb-2 text-orange-600 dark:text-orange-400">
          Resolution Strategies
        </h4>
        <div className="space-y-2">
          {Array.isArray(analysisData.communicationPatterns) &&
            analysisData.communicationPatterns
              ?.filter(
                (p) =>
                  p.pattern?.toLowerCase().includes("resolution") ||
                  p.pattern?.toLowerCase().includes("compromise") ||
                  p.pattern?.toLowerCase().includes("mediation"),
              )
              .map((pattern, i) => (
                <div
                  key={i}
                  className="p-2 bg-green-50 dark:bg-green-900/20 rounded"
                >
                  <div className="font-medium text-sm text-green-600 dark:text-green-400">
                    {pattern.pattern}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {pattern.impact}
                  </div>
                </div>
              )) || (
            <span className="text-sm text-gray-500">
              No resolution strategies found
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Placeholder node components - these need to be implemented properly
const DefaultNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className="bg-white border-2 rounded p-2 min-w-[120px] shadow">
    <div className="text-sm font-medium">{data.label || "Node"}</div>
  </div>
);

const nodeTypes = {
  personality: AdaptivePersonalityNode,
  emotion: DefaultNode,
  topic: DefaultNode,
  pattern: AdaptivePatternNode,
  central: DefaultNode,
  personalityDetail: DefaultNode,
  emotionDetail: DefaultNode,
  topicDetail: DefaultNode,
  patternDetail: DefaultNode,
};

interface ConversationCanvasProps {
  analysisData?: AnalysisResult | null;
  onOpenCoach: () => void;
  templateId?: string;
}

export default function ConversationCanvas({
  analysisData,
  onOpenCoach,
  templateId,
}: ConversationCanvasProps) {
  const [activeTab, setActiveTab] = useState<"visualization" | "analysis">(
    "visualization",
  );
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Transform analysis data into React Flow nodes and edges
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!analysisData) return { initialNodes: [], initialEdges: [] };

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Central node - positioned in the center
    const centralNode: Node = {
      id: "central",
      type: "central",
      position: { x: 600, y: 400 },
      data: { label: "Conversation Analysis" },
      draggable: true,
    };
    nodes.push(centralNode);

    // Personality node - positioned to the left
    if (analysisData.personality) {
      const personalityNode: Node = {
        id: "personality",
        type: "personality",
        position: { x: 50, y: 350 },
        data: {
          traits: analysisData.personality.traits,
          summary: analysisData.personality.summary,
          templateType: "general",
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };
      nodes.push(personalityNode);

      // Add personality detail node if expanded
      if (expandedNodes.has("personality")) {
        const personalityDetailNode: Node = {
          id: "personality-detail",
          type: "personalityDetail",
          position: { x: 50, y: 550 },
          data: analysisData.personality,
          parentId: "personality",
        };
        nodes.push(personalityDetailNode);
      }
    }

    // Connect personality to central
    if (analysisData.personality) {
      edges.push({
        id: "e-personality-central",
        source: "personality",
        target: "central",
        type: "smoothstep",
        animated: true,
        style: { stroke: "#3b82f6", strokeWidth: 3 },
      });
    }

    // Emotion nodes - positioned at the top in a row with better spacing
    const emotionalInsight = analysisData.insights?.find(
      (insight) =>
        insight.type === "chart" &&
        insight.title?.toLowerCase().includes("emotional"),
    );
    const emotionalData = emotionalInsight?.content as any[];
    emotionalData?.forEach((emotion, index) => {
      const emotionNode: Node = {
        id: `emotion-${index}`,
        type: "emotion",
        position: {
          x: 200 + index * 300,
          y: 50,
        },
        data: emotion,
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      };
      nodes.push(emotionNode);

      // Add detail node if expanded
      if (expandedNodes.has(`emotion-${index}`)) {
        const detailNode: Node = {
          id: `emotion-${index}-detail`,
          type: "emotionDetail",
          position: {
            x: 200 + index * 300,
            y: 280,
          },
          data: emotion,
          parentId: `emotion-${index}`,
        };
        nodes.push(detailNode);
      }

      edges.push({
        id: `e-emotion-${index}-central`,
        source: `emotion-${index}`,
        target: "central",
        type: "smoothstep",
        animated: true,
        style: { stroke: "#ef4444", strokeWidth: 3 },
      });
    });

    // Topic nodes - positioned at the bottom in a row with better spacing
    const topicInsight = analysisData.insights?.find(
      (insight) =>
        insight.type === "chart" &&
        insight.title?.toLowerCase().includes("topic"),
    );
    const topicData = topicInsight?.content as any[];
    topicData?.forEach((topic, index) => {
      const topicNode: Node = {
        id: `topic-${index}`,
        type: "topic",
        position: {
          x: 150 + index * 320,
          y: 700,
        },
        data: topic,
        sourcePosition: Position.Top,
        targetPosition: Position.Bottom,
      };
      nodes.push(topicNode);

      // Add detail node if expanded
      if (expandedNodes.has(`topic-${index}`)) {
        const detailNode: Node = {
          id: `topic-${index}-detail`,
          type: "topicDetail",
          position: {
            x: 150 + index * 320,
            y: 520,
          },
          data: topic,
          parentId: `topic-${index}`,
        };
        nodes.push(detailNode);
      }

      edges.push({
        id: `e-topic-${index}-central`,
        source: `topic-${index}`,
        target: "central",
        type: "smoothstep",
        animated: true,
        style: { stroke: "#10b981", strokeWidth: 3 },
      });
    });

    // Pattern nodes - positioned to the right in a column with better spacing
    if (Array.isArray(analysisData.communicationPatterns)) {
      analysisData.communicationPatterns.forEach((pattern, index) => {
      const patternNode: Node = {
        id: `pattern-${index}`,
        type: "pattern",
        position: {
          x: 1100,
          y: 150 + index * 250,
        },
        data: pattern,
        sourcePosition: Position.Left,
        targetPosition: Position.Right,
      };
      nodes.push(patternNode);

      // Add detail node if expanded
      if (expandedNodes.has(`pattern-${index}`)) {
        const detailNode: Node = {
          id: `pattern-${index}-detail`,
          type: "patternDetail",
          position: {
            x: 800,
            y: 150 + index * 250,
          },
          data: pattern,
          parentId: `pattern-${index}`,
        };
        nodes.push(detailNode);
      }

      edges.push({
        id: `e-pattern-${index}-central`,
        source: `pattern-${index}`,
        target: "central",
        type: "smoothstep",
        animated: true,
        style: { stroke: "#8b5cf6", strokeWidth: 3 },
      });
    });
    }

    return { initialNodes: nodes, initialEdges: edges };
  }, [analysisData, expandedNodes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback(
    (event: any, node: Node) => {
      // Don't handle clicks on detail nodes
      if (node.id.includes("-detail")) return;

      setSelectedNode(node);

      // Toggle expansion for main nodes
      const newExpanded = new Set(expandedNodes);
      if (expandedNodes.has(node.id)) {
        newExpanded.delete(node.id);
      } else {
        newExpanded.add(node.id);
      }
      setExpandedNodes(newExpanded);
    },
    [expandedNodes],
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  if (!analysisData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">No analysis data available</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full min-h-screen"
    >
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Conversation Analysis
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Interactive visualization of your conversation insights
            </p>
          </div>
          <Button onClick={onOpenCoach} size="lg" className="shadow-lg">
            <MessageCircle className="mr-2 h-5 w-5" />
            Chat with AI Coach
          </Button>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "visualization" | "analysis")
          }
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger
              value="visualization"
              className="flex items-center gap-2"
            >
              <Network className="h-4 w-4" />
              Visualization
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Analysis
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="h-screen pt-28">
        {activeTab === "visualization" && (
          <div className="h-full w-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              connectionMode={ConnectionMode.Loose}
              fitView
              fitViewOptions={{
                padding: 0.1,
                includeHiddenNodes: false,
                minZoom: 0.5,
                maxZoom: 1.5,
              }}
              className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
              nodesConnectable={false}
              nodesDraggable={true}
              zoomOnScroll={true}
              zoomOnPinch={true}
              panOnScroll={false}
              defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
            >
              <Background
                color="#e5e7eb"
                gap={20}
                size={1}
                className="dark:opacity-20"
              />
              <Controls
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
                showZoom={true}
                showFitView={true}
                showInteractive={false}
              />
              <MiniMap
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
                nodeColor={(node) => {
                  switch (node.type) {
                    case "personality":
                      return "#3b82f6";
                    case "emotion":
                      return "#ef4444";
                    case "topic":
                      return "#10b981";
                    case "pattern":
                      return "#8b5cf6";
                    case "central":
                      return "#6366f1";
                    default:
                      return "#6b7280";
                  }
                }}
                maskColor="rgb(240, 242, 247, 0.7)"
              />
            </ReactFlow>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border">
              <h3 className="font-semibold text-sm mb-3">Legend</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Personality Traits</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Emotional Arc</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Key Topics</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span>Communication Patterns</span>
                </div>
              </div>
            </div>

            {/* Node Details Panel */}
            {selectedNode && (
              <motion.div
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 300 }}
                className="absolute top-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border max-w-sm"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-sm">Node Details</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedNode(null)}
                    className="h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>
                {selectedNode.type === "personality" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Personality Traits</span>
                    </div>
                    <div className="space-y-1">
                      {(selectedNode.data as any).traits?.map(
                        (trait: string, i: number) => (
                          <div
                            key={i}
                            className="text-xs bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded"
                          >
                            {trait}
                          </div>
                        ),
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      {(selectedNode.data as any).summary}
                    </p>
                  </div>
                )}
                {selectedNode.type === "emotion" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="font-medium">
                        {(selectedNode.data as any).emotion}
                      </span>
                    </div>
                    <div className="text-xs space-y-1">
                      <div>
                        Intensity:{" "}
                        {Math.round((selectedNode.data as any).intensity * 100)}
                        %
                      </div>
                      <div>Time: {(selectedNode.data as any).timestamp}</div>
                      <div className="mt-2 text-gray-600 dark:text-gray-400">
                        Context: {(selectedNode.data as any).context}
                      </div>
                    </div>
                  </div>
                )}
                {selectedNode.type === "topic" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-green-500" />
                      <span className="font-medium">
                        {(selectedNode.data as any).name}
                      </span>
                    </div>
                    <div className="text-xs">
                      Relevance:{" "}
                      {Math.round((selectedNode.data as any).relevance * 100)}%
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-medium">Keywords:</div>
                      <div className="flex flex-wrap gap-1">
                        {(selectedNode.data as any).keywords?.map(
                          (keyword: string, i: number) => (
                            <span
                              key={i}
                              className="text-xs bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded"
                            >
                              {keyword}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {selectedNode.type === "pattern" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">
                        {(selectedNode.data as any).pattern}
                      </span>
                    </div>
                    <div className="text-xs space-y-2">
                      <div>
                        <div className="font-medium">Impact:</div>
                        <div className="text-gray-600 dark:text-gray-400">
                          {(selectedNode.data as any).impact}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Examples:</div>
                        {(selectedNode.data as any).examples?.map(
                          (example: string, i: number) => (
                            <div
                              key={i}
                              className="text-gray-600 dark:text-gray-400 italic mt-1"
                            >
                              "{example}"
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}

        {activeTab === "analysis" && (
          <div className="h-full overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              {/* Analysis Header with Language */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">
                      Conversation Analysis
                    </h2>
                    <p className="text-muted-foreground">
                      Detailed insights from your conversation
                    </p>
                  </div>
                  {analysisData.detectedLanguage && (
                    <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-lg">
                      <Globe className="h-4 w-4 text-blue-500" />
                      <div className="text-sm">
                        <span className="text-muted-foreground">Language:</span>
                        <span className="ml-2 font-medium">
                          {analysisData.detectedLanguage}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personality Traits */}
                <Card className="h-fit">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Brain className="h-5 w-5 text-blue-500" />
                      Personality Traits
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {analysisData.personality?.traits.map((trait, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg font-medium"
                        >
                          {trait}
                        </motion.div>
                      )) || (
                        <span className="text-sm text-gray-500">
                          No personality traits available
                        </span>
                      )}
                    </div>
                    <div className="bg-secondary/20 p-4 rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {analysisData.personality?.summary ||
                          "No personality summary available"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Emotional Arc */}
                <Card className="h-fit">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Heart className="h-5 w-5 text-red-500" />
                      Emotional Arc
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px] pr-2">
                      <div className="space-y-4">
                        {(() => {
                          const emotionalInsight = analysisData.insights?.find(
                            (insight) =>
                              insight.type === "chart" &&
                              insight.title
                                ?.toLowerCase()
                                .includes("emotional"),
                          );
                          const emotionalData =
                            emotionalInsight?.content as any[];
                          return (
                            emotionalData?.map((emotion, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border-l-4 border-red-500"
                              >
                                <div className="flex justify-between items-center mb-3">
                                  <span className="font-semibold text-red-700 dark:text-red-300">
                                    {emotion.emotion}
                                  </span>
                                  <span className="text-xs bg-red-100 dark:bg-red-900/40 px-3 py-1 rounded-full text-red-700 dark:text-red-300 font-medium">
                                    {((emotion.intensity || 0) * 100).toFixed(
                                      0,
                                    )}
                                    %
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                                  {emotion.context}
                                </p>
                                <p className="text-xs text-muted-foreground/70 font-medium">
                                  {emotion.timestamp}
                                </p>
                              </motion.div>
                            )) || (
                              <span className="text-sm text-gray-500">
                                No emotional data available
                              </span>
                            )
                          );
                        })()}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Topics */}
                <Card className="h-fit">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Hash className="h-5 w-5 text-green-500" />
                      Key Topics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(() => {
                        const topicInsight = analysisData.insights?.find(
                          (insight) =>
                            insight.type === "chart" &&
                            insight.title?.toLowerCase().includes("topic"),
                        );
                        const topicData = topicInsight?.content as any[];
                        return (
                          topicData?.map((topic, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                              className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-500"
                            >
                              <div className="flex justify-between items-center mb-3">
                                <span className="font-semibold text-green-700 dark:text-green-300">
                                  {topic.name}
                                </span>
                                <span className="text-xs bg-green-100 dark:bg-green-900/40 px-3 py-1 rounded-full text-green-700 dark:text-green-300 font-medium">
                                  {((topic.relevance || 0) * 100).toFixed(0)}%
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1 mb-3">
                                {topic.keywords?.map(
                                  (keyword: string, i: number) => (
                                    <span
                                      key={i}
                                      className="text-xs bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded-full"
                                    >
                                      {keyword}
                                    </span>
                                  ),
                                ) || null}
                              </div>
                            </motion.div>
                          )) || (
                            <span className="text-sm text-gray-500">
                              No topics available
                            </span>
                          )
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>

                {/* Communication Patterns */}
                <Card className="h-fit">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="h-5 w-5 text-purple-500" />
                      Communication Patterns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px] pr-2">
                      <div className="space-y-4">
                        {Array.isArray(analysisData.communicationPatterns) &&
                          analysisData.communicationPatterns?.map(
                            (pattern, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border-l-4 border-purple-500"
                              >
                                <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-3">
                                  {pattern.pattern}
                                </h4>
                                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                                  {pattern.impact}
                                </p>
                                <div className="space-y-3">
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Examples:
                                  </p>
                                  {pattern.examples
                                    ?.slice(0, 2)
                                    .map((example, eIndex) => (
                                      <div
                                        key={eIndex}
                                        className="bg-white dark:bg-gray-800 px-3 py-2 rounded text-xs text-muted-foreground italic border-l-2 border-purple-300 dark:border-purple-600"
                                      >
                                        "{example}"
                                      </div>
                                    ))}
                                </div>
                              </motion.div>
                            ),
                          )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Overall Summary */}
              <Card className="mt-8">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-indigo-500" />
                    Overall Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-lg border-l-4 border-indigo-500">
                    <p className="text-muted-foreground leading-relaxed text-base">
                      {analysisData.overallSummary}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
