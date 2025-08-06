"use client";

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface EmotionalArcPoint {
  timestamp: string;
  intensity: number;
  emotion?: string;
}

interface EmotionalArcChartProps {
  emotionalArc: EmotionalArcPoint[];
}

const EmotionalArcChart: React.FC<EmotionalArcChartProps> = ({ emotionalArc }) => {
  if (!emotionalArc || emotionalArc.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>No emotional arc data available</p>
      </div>
    );
  }

  // Format timestamp for display (HH:MM)
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } catch {
      return timestamp;
    }
  };

  // Custom tooltip component with dark theme styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-foreground font-medium">
            Time: {formatTimestamp(label)}
          </p>
          <p className="text-primary">
            Intensity: {payload[0].value}
          </p>
          {payload[0].payload.emotion && (
            <p className="text-muted-foreground">
              Emotion: {payload[0].payload.emotion}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={emotionalArc}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="#374151" 
          opacity={0.3}
        />
        <XAxis
          dataKey="timestamp"
          tickFormatter={formatTimestamp}
          stroke="#9CA3AF"
          fontSize={12}
          tickLine={{ stroke: '#374151' }}
          axisLine={{ stroke: '#374151' }}
        />
        <YAxis
          stroke="#9CA3AF"
          fontSize={12}
          tickLine={{ stroke: '#374151' }}
          axisLine={{ stroke: '#374151' }}
          domain={[0, 10]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="intensity"
          stroke="#00FFC2"
          strokeWidth={3}
          dot={{ fill: '#00FFC2', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: '#00FFC2', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default EmotionalArcChart; 