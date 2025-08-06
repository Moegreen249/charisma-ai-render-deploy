'use client';

import { CharismaFeeling } from '@/lib/ai-self-reflection';

interface FeelingDisplayProps {
  feeling: CharismaFeeling | null;
  lastUpdated?: string | null;
}

export function FeelingDisplay({ feeling, lastUpdated }: FeelingDisplayProps) {
  if (!feeling) {
    return (
      <div className="text-center mb-16">
        <div className="text-6xl mb-4">🤖</div>
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Awakening...
        </h1>
        <p className="text-xl text-gray-300">
          CharismaAI is gathering its thoughts for the first time.
        </p>
        {lastUpdated && (
          <p className="text-sm text-gray-400 mt-4">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="text-center mb-16">
      <div className="text-8xl mb-6 animate-pulse">
        {feeling.feeling_emoji}
      </div>
      <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
        Today, I'm feeling...
      </h1>
      <div className="text-3xl md:text-4xl font-semibold text-white mb-4">
        {feeling.feeling_adjective}
      </div>
      {lastUpdated && (
        <p className="text-sm text-gray-400">
          Last reflection: {new Date(lastUpdated).toLocaleString()}
        </p>
      )}
    </div>
  );
}