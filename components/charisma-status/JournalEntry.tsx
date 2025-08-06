'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CharismaFeeling } from '@/lib/ai-self-reflection';
import { BookOpen } from 'lucide-react';

interface JournalEntryProps {
  feeling: CharismaFeeling | null;
}

export function JournalEntry({ feeling }: JournalEntryProps) {
  if (!feeling) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            My Morning Briefing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-300 italic">
            Gathering thoughts for my first reflection...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          My Recent Reflection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-gray-100 leading-relaxed">
          <span className="text-lg">"</span>
          <span className="text-base italic font-serif">
            {feeling.narrative_briefing}
          </span>
          <span className="text-lg">"</span>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
          <div className="text-sm text-gray-400">
            Current mood score: <span className="text-purple-300 font-semibold">{feeling.calculated_mood_score}/10</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}