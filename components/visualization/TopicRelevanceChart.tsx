"use client";

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface Topic {
  name: string;
  relevance: number;
  description?: string;
}

interface TopicRelevanceChartProps {
  topics: Topic[];
}

const TopicRelevanceChart: React.FC<TopicRelevanceChartProps> = ({ topics }) => {
  if (!topics || topics.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>No topic data available</p>
      </div>
    );
  }

  // Sort topics by relevance for better visualization
  const sortedTopics = [...topics].sort((a, b) => b.relevance - a.relevance);

  // Custom tooltip component with dark theme styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-foreground font-medium">
            Topic: {label}
          </p>
          <p className="text-primary">
            Relevance: {payload[0].value}
          </p>
          {payload[0].payload.description && (
            <p className="text-muted-foreground text-sm mt-1">
              {payload[0].payload.description}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={sortedTopics}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="#374151" 
          opacity={0.3}
        />
        <XAxis
          dataKey="name"
          stroke="#9CA3AF"
          fontSize={12}
          tickLine={{ stroke: '#374151' }}
          axisLine={{ stroke: '#374151' }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis
          stroke="#9CA3AF"
          fontSize={12}
          tickLine={{ stroke: '#374151' }}
          axisLine={{ stroke: '#374151' }}
          domain={[0, 1]}
          tickFormatter={(value) => (value * 100).toFixed(0) + '%'}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="relevance"
          fill="#00FFC2"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TopicRelevanceChart; 