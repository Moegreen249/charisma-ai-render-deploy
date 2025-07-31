'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CharismaFeeling } from '@/lib/ai-self-reflection';
import { Target, Cpu, Zap, Server } from 'lucide-react';

interface FocusCardProps {
  feeling: CharismaFeeling | null;
}

export function FocusCard({ feeling }: FocusCardProps) {
  if (!feeling) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5" />
            My Current Focus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span className="text-gray-300">Initializing...</span>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-gray-300">Loading configuration...</span>
            </div>
            <div className="flex items-center gap-3">
              <Server className="w-4 h-4 text-green-400" />
              <span className="text-gray-300">Starting up...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Parse the focus summary to extract structured info
  const focusLines = feeling.current_focus_summary.split('. ').filter(line => line.trim());
  
  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Target className="w-5 h-5" />
          My Current Focus
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {focusLines.map((line, index) => {
            const icon = index === 0 ? Cpu : index === 1 ? Zap : Server;
            const IconComponent = icon;
            const colors = ['text-purple-400', 'text-blue-400', 'text-green-400'];
            
            return (
              <div key={index} className="flex items-start gap-3">
                <IconComponent className={`w-4 h-4 mt-0.5 ${colors[index % colors.length]}`} />
                <span className="text-gray-200 text-sm leading-relaxed">
                  {line.endsWith('.') ? line : line + '.'}
                </span>
              </div>
            );
          })}
          
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
              System Health Status
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-300">All Systems Nominal</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}