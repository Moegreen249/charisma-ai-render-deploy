'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Settings, 
  Activity,
  Clock,
  Zap,
  Save
} from 'lucide-react';
import { BrainIcon } from '@/components/icons/Brain';

interface SchedulerStatus {
  isRunning: boolean;
  intervalMinutes: number;
  nextRunIn: string;
}

export default function CharismaFeelingsAdminPage() {
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [lastFeeling, setLastFeeling] = useState<any>(null);
  const [reflectionInterval, setReflectionInterval] = useState<number>(5);
  const [intervalInputValue, setIntervalInputValue] = useState<string>('5');

  const fetchSchedulerStatus = async () => {
    try {
      const response = await fetch('/api/admin/charisma-scheduler');
      if (response.ok) {
        const data = await response.json();
        setSchedulerStatus(data.scheduler_status);
        setReflectionInterval(data.reflection_interval || 5);
        setIntervalInputValue(String(data.reflection_interval || 5));
      }
    } catch (error) {
      console.error('Failed to fetch scheduler status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLastFeeling = async () => {
    try {
      const response = await fetch('/api/charisma/self-reflection');
      if (response.ok) {
        const data = await response.json();
        setLastFeeling(data.feeling);
      }
    } catch (error) {
      console.error('Failed to fetch last feeling:', error);
    }
  };

  const handleSchedulerAction = async (action: 'start' | 'stop' | 'run_now') => {
    setActionLoading(action);
    try {
      const response = await fetch('/api/admin/charisma-scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status) {
          setSchedulerStatus(result.status);
        }
        if (result.feeling) {
          setLastFeeling(result.feeling);
        }
        // Refresh data after action
        await fetchSchedulerStatus();
        await fetchLastFeeling();
      }
    } catch (error) {
      console.error(`Failed to ${action} scheduler:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleIntervalUpdate = async () => {
    const newInterval = parseInt(intervalInputValue);
    
    if (isNaN(newInterval) || newInterval < 1) {
      alert('Please enter a valid interval (minimum 1 minute)');
      return;
    }

    if (newInterval > 1440) {
      alert('Interval cannot exceed 24 hours (1440 minutes)');
      return;
    }

    setActionLoading('set_interval');
    try {
      const response = await fetch('/api/admin/charisma-scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'set_interval', 
          interval: newInterval 
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setReflectionInterval(newInterval);
        // Refresh scheduler status to get updated info
        await fetchSchedulerStatus();
        alert(`Reflection interval updated to ${newInterval} minutes`);
      } else {
        const errorData = await response.json();
        alert(`Failed to update interval: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Failed to update reflection interval:', error);
      alert('Failed to update reflection interval');
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchSchedulerStatus();
    fetchLastFeeling();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchSchedulerStatus();
      fetchLastFeeling();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="text-4xl mb-4">🧠</div>
          <h1 className="text-2xl font-bold mb-4">Loading CharismaAI Admin...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <BrainIcon className="w-8 h-8 text-purple-500" />
          CharismaAI Self-Reflection Control
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor and control CharismaAI's self-reflection and emotional state tracking system.
        </p>
      </div>

      {/* Scheduler Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Scheduler Status
            </span>
            <Badge 
              variant={schedulerStatus?.isRunning ? "default" : "secondary"}
              className={schedulerStatus?.isRunning ? "bg-green-500" : "bg-gray-500"}
            >
              <Activity className="w-3 h-3 mr-1" />
              {schedulerStatus?.isRunning ? 'Running' : 'Stopped'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Clock className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <div className="text-sm text-gray-600 dark:text-gray-400">Reflection Interval</div>
              <div className="text-lg font-semibold">{schedulerStatus?.intervalMinutes || 0} minutes</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Zap className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-sm text-gray-600 dark:text-gray-400">Status</div>
              <div className="text-lg font-semibold">
                {schedulerStatus?.isRunning ? 'Active' : 'Inactive'}
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <RefreshCw className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <div className="text-sm text-gray-600 dark:text-gray-400">Next Run</div>
              <div className="text-lg font-semibold">{schedulerStatus?.nextRunIn || 'Unknown'}</div>
            </div>
          </div>

          <div className="flex gap-4 flex-wrap">
            <Button 
              onClick={() => handleSchedulerAction('start')}
              disabled={schedulerStatus?.isRunning || actionLoading === 'start'}
              className="flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              {actionLoading === 'start' ? 'Starting...' : 'Start Scheduler'}
            </Button>
            
            <Button 
              onClick={() => handleSchedulerAction('stop')}
              disabled={!schedulerStatus?.isRunning || actionLoading === 'stop'}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Pause className="w-4 h-4" />
              {actionLoading === 'stop' ? 'Stopping...' : 'Stop Scheduler'}
            </Button>
            
            <Button 
              onClick={() => handleSchedulerAction('run_now')}
              disabled={actionLoading === 'run_now'}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <BrainIcon className="w-4 h-4" />
              {actionLoading === 'run_now' ? 'Reflecting...' : 'Trigger Reflection Now'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reflection Interval Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Reflection Interval Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="interval-input" className="text-sm font-medium">
                  Interval (minutes)
                </Label>
                <div className="mt-1">
                  <Input
                    id="interval-input"
                    type="number"
                    min="1"
                    max="1440"
                    value={intervalInputValue}
                    onChange={(e) => setIntervalInputValue(e.target.value)}
                    placeholder="Enter interval in minutes"
                    className="w-full"
                    disabled={actionLoading === 'set_interval'}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Minimum: 1 minute, Maximum: 1440 minutes (24 hours)
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleIntervalUpdate}
                  disabled={actionLoading === 'set_interval' || intervalInputValue === String(reflectionInterval)}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {actionLoading === 'set_interval' ? 'Updating...' : 'Update Interval'}
                </Button>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <Settings className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    Current Configuration
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Reflection interval: <strong>{reflectionInterval} minutes</strong>
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                    Changes will restart the scheduler automatically if it's currently running.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Quick Presets</Label>
              <div className="flex gap-2 flex-wrap">
                {[1, 5, 10, 15, 30, 60, 120].map((preset) => (
                  <Button
                    key={preset}
                    variant="outline"
                    size="sm"
                    onClick={() => setIntervalInputValue(String(preset))}
                    disabled={actionLoading === 'set_interval'}
                    className={`${preset === reflectionInterval ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
                  >
                    {preset}m
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Feeling Display */}
      {lastFeeling && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{lastFeeling.feeling_emoji}</span>
              Latest Reflection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Feeling</div>
                <div className="text-xl font-semibold">{lastFeeling.feeling_adjective}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Mood Score</div>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-semibold">{lastFeeling.calculated_mood_score}/10</div>
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(lastFeeling.calculated_mood_score / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Journal Entry</div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg italic">
                  "{lastFeeling.narrative_briefing}"
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Focus Summary</div>
                <div className="text-sm">{lastFeeling.current_focus_summary}</div>
              </div>
              
              <div className="text-xs text-gray-500">
                Reflected at: {new Date(lastFeeling.timestamp).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => window.open('/status', '_blank')}
            >
              <Activity className="w-4 h-4 mr-2" />
              View Public Status Page
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                fetchSchedulerStatus();
                fetchLastFeeling();
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}