"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface BarVisualizationProps {
  data: Record<string, string | number>[]; // Data array from insight.content
  xDataKey: string; // Key for X-axis (e.g., "name")
  yDataKey: string | string[]; // Key for Y-axis (e.g., "relevance" or ["value1", "value2"])
  barColor?: string; // Dynamic color for the bars
  unit?: string; // Unit for the Y-axis
}

const BarVisualization: React.FC<BarVisualizationProps> = ({
  data,
  xDataKey,
  yDataKey,
  barColor = "#00FFC2", // Default to primary accent
  unit,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>No data available</p>
      </div>
    );
  }

  // Sort data by Y-axis value for better visualization
  const sortedData = [...data].sort((a, b) => {
    const keyToSort = Array.isArray(yDataKey) ? yDataKey[0] : yDataKey;
    const aValue = Number(a[keyToSort]) || 0;
    const bValue = Number(b[keyToSort]) || 0;
    return bValue - aValue;
  });

  // Handle multiple Y-axis keys for grouped bars
  const bars = Array.isArray(yDataKey) ? yDataKey : [yDataKey];

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
            {xDataKey}: {label}
          </p>
          {payload.map((entry, index: number) => (
            <p key={index} className="text-primary">
              {entry.dataKey}: {entry.value}
              {unit ? ` ${unit}` : ""}
            </p>
          ))}
          {payload[0]?.payload?.keywords &&
            Array.isArray(payload[0].payload.keywords) && (
              <p className="text-muted-foreground text-sm mt-1">
                Keywords: {payload[0].payload.keywords.join(", ")}
              </p>
            )}
          {payload[0]?.payload?.description && (
            <p className="text-muted-foreground text-sm">
              {payload[0].payload.description}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Generate colors for multiple bars if needed
  const getBarColor = (index: number) => {
    if (bars.length === 1) {
      return barColor;
    }

    // For multiple bars, use different colors
    const colors = ["#00FFC2", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"];
    return colors[index % colors.length];
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={sortedData}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis
          dataKey={xDataKey}
          stroke="#9CA3AF"
          fontSize={12}
          tickLine={{ stroke: "#374151" }}
          axisLine={{ stroke: "#374151" }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis
          stroke="#9CA3AF"
          fontSize={12}
          tickLine={{ stroke: "#374151" }}
          axisLine={{ stroke: "#374151" }}
          domain={[0, "dataMax + 0.1"]}
          tickFormatter={(value) => {
            if (unit === "Score" || unit === "Relevance Score") {
              return `${(value * 100).toFixed(0)}%`;
            }
            return `${value}${unit ? ` ${unit}` : ""}`;
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        {bars.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            fill={getBarColor(index)}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarVisualization;
