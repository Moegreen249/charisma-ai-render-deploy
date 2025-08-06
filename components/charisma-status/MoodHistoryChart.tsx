'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface MoodHistoryData {
  timestamp: string;
  mood_score: number;
}

interface MoodHistoryChartProps {
  history: MoodHistoryData[];
}

export function MoodHistoryChart({ history }: MoodHistoryChartProps) {
  if (!history || history.length === 0) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            My Emotional Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <div className="text-gray-300">Building my emotional history...</div>
              <div className="text-sm text-gray-400 mt-2">
                Come back in a few minutes to see my mood patterns!
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format data for the chart
  const chartData = history.slice(-20).map((item, index) => {
    const date = new Date(item.timestamp);
    return {
      ...item,
      timeLabel: date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      dayLabel: date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric' 
      }),
      index,
    };
  });

  const averageMood = chartData.reduce((sum, item) => sum + item.mood_score, 0) / chartData.length;
  const latestMood = chartData[chartData.length - 1]?.mood_score || 5;
  const trend = chartData.length > 1 
    ? latestMood - chartData[chartData.length - 2].mood_score
    : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-3">
          <p className="text-white text-sm">
            {`${data.dayLabel} at ${data.timeLabel}`}
          </p>
          <p className="text-purple-300 font-semibold">
            {`Mood: ${payload[0].value}/10`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            My Emotional Journey
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Latest</div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-white">{latestMood}/10</span>
              {trend > 0 && <span className="text-green-400 text-sm">↗</span>}
              {trend < 0 && <span className="text-red-400 text-sm">↘</span>}
              {trend === 0 && <span className="text-gray-400 text-sm">→</span>}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <XAxis 
                dataKey="timeLabel" 
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                axisLine={{ stroke: '#374151' }}
                tickLine={{ stroke: '#374151' }}
              />
              <YAxis 
                domain={[1, 10]}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                axisLine={{ stroke: '#374151' }}
                tickLine={{ stroke: '#374151' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine 
                y={averageMood} 
                stroke="#6B7280" 
                strokeDasharray="3 3" 
                label={{ value: "Avg", position: "insideTopRight", fill: "#9CA3AF", fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="mood_score"
                stroke="#8B5CF6"
                strokeWidth={3}
                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2, fill: '#A78BFA' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-400">Average Mood</div>
            <div className="text-white font-semibold">{averageMood.toFixed(1)}/10</div>
          </div>
          <div>
            <div className="text-gray-400">Data Points</div>
            <div className="text-white font-semibold">{chartData.length}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}