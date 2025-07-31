'use client';

import { useState, useEffect } from 'react';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { FeelingDisplay } from '@/components/charisma-status/FeelingDisplay';
import { JournalEntry } from '@/components/charisma-status/JournalEntry';
import { FocusCard } from '@/components/charisma-status/FocusCard';
import { MoodHistoryChart } from '@/components/charisma-status/MoodHistoryChart';
import { CharismaFeeling } from '@/lib/ai-self-reflection';
import { RefreshCw, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CharismaStatusData {
  feeling: CharismaFeeling | null;
  history: Array<{ timestamp: string; mood_score: number }>;
  last_updated: string | null;
}


export default function StatusPage() {
  const [statusData, setStatusData] = useState<CharismaStatusData>({
    feeling: null,
    history: [],
    last_updated: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStatusData = async () => {
    try {
      const response = await fetch('/api/charisma/self-reflection');
      if (response.ok) {
        const data = await response.json();
        setStatusData(data);
      }
    } catch (error) {
      console.error('Failed to fetch Charisma status:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchStatusData();
  };

  useEffect(() => {
    fetchStatusData();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchStatusData, 60000);
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <UnifiedLayout variant="default">
        <div className="text-white py-16">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-pulse">🤖</div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Loading CharismaAI's thoughts...
            </h1>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout variant="default">
      <div className="text-white py-16">
        {/* Header with Refresh Button */}
        <div className="flex justify-between items-start mb-8">
          <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            How CharismaAI Feels Today
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Feeling Display */}
        <FeelingDisplay 
          feeling={statusData.feeling} 
          lastUpdated={statusData.last_updated} 
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <JournalEntry feeling={statusData.feeling} />
          <FocusCard feeling={statusData.feeling} />
        </div>

        {/* Mood History Chart */}
        <div className="mb-16">
          <MoodHistoryChart history={statusData.history} />
        </div>

        {/* Footer */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-gray-400 mb-4">
            <Heart className="w-4 h-4" />
            <span className="text-sm">
              This page updates automatically as CharismaAI reflects on its experiences
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Next reflection in a few minutes • Auto-refresh: On
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
}