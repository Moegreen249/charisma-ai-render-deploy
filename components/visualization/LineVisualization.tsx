"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface LineVisualizationProps {
  data: Record<string, string | number>[]; // Data array from insight.content
  xDataKey: string; // Key for X-axis (e.g., "timestamp")
  yDataKey: string | string[]; // Key for Y-axis (e.g., "intensity" or ["pos", "neg"])
  lineColor?: string; // Dynamic color for the line(s)
  unit?: string; // Unit for the Y-axis
}

const LineVisualization: React.FC<LineVisualizationProps> = ({
  data,
  xDataKey,
  yDataKey,
  lineColor = "#00FFC2", // Default to primary accent
  unit,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>No data available</p>
      </div>
    );
  }

  // Handle multiple Y-axis keys for multi-line charts
  const lines = Array.isArray(yDataKey) ? yDataKey : [yDataKey];

  // Format timestamp for display (HH:MM) if xDataKey is timestamp
  const formatXAxis = (value: string | number) => {
    if (xDataKey === "timestamp" && typeof value === "string") {
      try {
        const date = new Date(value);
        return date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      } catch {
        return value;
      }
    }
    return value;
  };

  // Custom tooltip component with dark theme styling
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{
      dataKey: string;
      value: number;
      payload: Record<string, string | number>;
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-foreground font-medium">
            {xDataKey === "timestamp" ? "Time" : xDataKey}:{" "}
            {formatXAxis(label || "")}
          </p>
          {payload.map((entry, index: number) => (
            <p key={index} className="text-primary">
              {entry.dataKey}: {entry.value}
              {unit ? ` ${unit}` : ""}
            </p>
          ))}
          {payload[0]?.payload?.emotion && (
            <p className="text-muted-foreground">
              Emotion: {payload[0].payload.emotion}
            </p>
          )}
          {payload[0]?.payload?.context && (
            <p className="text-muted-foreground text-sm">
              {payload[0].payload.context}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Generate colors for multiple lines if needed
  const getLineColor = (index: number) => {
    if (lines.length === 1) return lineColor;

    // For multiple lines, use different shades or colors
    const colors = ["#00FFC2", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"];
    return colors[index % colors.length];
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis
          dataKey={xDataKey}
          tickFormatter={(value) => String(formatXAxis(value))}
          stroke="#9CA3AF"
          fontSize={12}
          tickLine={{ stroke: "#374151" }}
          axisLine={{ stroke: "#374151" }}
        />
        <YAxis
          stroke="#9CA3AF"
          fontSize={12}
          tickLine={{ stroke: "#374151" }}
          axisLine={{ stroke: "#374151" }}
          domain={[0, "dataMax + 0.1"]}
          tickFormatter={(value) => `${value}${unit ? ` ${unit}` : ""}`}
        />
        <Tooltip content={<CustomTooltip />} />
        {lines.map((lineKey, index) => (
          <Line
            key={lineKey}
            type="monotone"
            dataKey={lineKey}
            stroke={getLineColor(index)}
            strokeWidth={3}
            dot={{ fill: getLineColor(index), strokeWidth: 2, r: 4 }}
            activeDot={{
              r: 6,
              stroke: getLineColor(index),
              strokeWidth: 2,
            }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineVisualization;
