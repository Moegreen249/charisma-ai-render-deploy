'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Settings, 
  Activity,
  Clock,
  Brain,
  Zap
} from 'lucide-react';

interface SchedulerStatus {
  isRunning: boolean;
  intervalMinutes: number;
  nextRunIn: string;
}

interface AdminControlsProps {}

export default function CharismaFeelingsAdminPage() {
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [lastFeeling, setLastFeeling] = useState<any>(null);

  const fetchSchedulerStatus = async () => {
    try {
      const response = await fetch('/api/admin/charisma-scheduler');
      if (response.ok) {
        const data = await response.json();
        setSchedulerStatus(data.scheduler_status);
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
    setActionLoading(action);\n    try {\n      const response = await fetch('/api/admin/charisma-scheduler', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({ action }),\n      });\n\n      if (response.ok) {\n        const result = await response.json();\n        if (result.status) {\n          setSchedulerStatus(result.status);\n        }\n        if (result.feeling) {\n          setLastFeeling(result.feeling);\n        }\n        // Refresh data after action\n        await fetchSchedulerStatus();\n        await fetchLastFeeling();\n      }\n    } catch (error) {\n      console.error(`Failed to ${action} scheduler:`, error);\n    } finally {\n      setActionLoading(null);\n    }\n  };\n\n  useEffect(() => {\n    fetchSchedulerStatus();\n    fetchLastFeeling();\n    \n    // Refresh every 30 seconds\n    const interval = setInterval(() => {\n      fetchSchedulerStatus();\n      fetchLastFeeling();\n    }, 30000);\n    \n    return () => clearInterval(interval);\n  }, []);\n\n  if (isLoading) {\n    return (\n      <div className=\"p-8\">\n        <div className=\"text-center\">\n          <div className=\"text-4xl mb-4\">🧠</div>\n          <h1 className=\"text-2xl font-bold mb-4\">Loading CharismaAI Admin...</h1>\n        </div>\n      </div>\n    );\n  }\n\n  return (\n    <div className=\"p-8 space-y-6\">\n      <div className=\"mb-8\">\n        <h1 className=\"text-3xl font-bold mb-2 flex items-center gap-3\">\n          <Brain className=\"w-8 h-8 text-purple-500\" />\n          CharismaAI Self-Reflection Control\n        </h1>\n        <p className=\"text-gray-600 dark:text-gray-400\">\n          Monitor and control CharismaAI's self-reflection and emotional state tracking system.\n        </p>\n      </div>\n\n      {/* Scheduler Status */}\n      <Card>\n        <CardHeader>\n          <CardTitle className=\"flex items-center justify-between\">\n            <span className=\"flex items-center gap-2\">\n              <Settings className=\"w-5 h-5\" />\n              Scheduler Status\n            </span>\n            <Badge \n              variant={schedulerStatus?.isRunning ? \"default\" : \"secondary\"}\n              className={schedulerStatus?.isRunning ? \"bg-green-500\" : \"bg-gray-500\"}\n            >\n              <Activity className=\"w-3 h-3 mr-1\" />\n              {schedulerStatus?.isRunning ? 'Running' : 'Stopped'}\n            </Badge>\n          </CardTitle>\n        </CardHeader>\n        <CardContent>\n          <div className=\"grid grid-cols-1 md:grid-cols-3 gap-4 mb-6\">\n            <div className=\"text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg\">\n              <Clock className=\"w-6 h-6 mx-auto mb-2 text-blue-500\" />\n              <div className=\"text-sm text-gray-600 dark:text-gray-400\">Reflection Interval</div>\n              <div className=\"text-lg font-semibold\">{schedulerStatus?.intervalMinutes || 0} minutes</div>\n            </div>\n            <div className=\"text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg\">\n              <Zap className=\"w-6 h-6 mx-auto mb-2 text-yellow-500\" />\n              <div className=\"text-sm text-gray-600 dark:text-gray-400\">Status</div>\n              <div className=\"text-lg font-semibold\">\n                {schedulerStatus?.isRunning ? 'Active' : 'Inactive'}\n              </div>\n            </div>\n            <div className=\"text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg\">\n              <RefreshCw className=\"w-6 h-6 mx-auto mb-2 text-green-500\" />\n              <div className=\"text-sm text-gray-600 dark:text-gray-400\">Next Run</div>\n              <div className=\"text-lg font-semibold\">{schedulerStatus?.nextRunIn || 'Unknown'}</div>\n            </div>\n          </div>\n\n          <div className=\"flex gap-4 flex-wrap\">\n            <Button \n              onClick={() => handleSchedulerAction('start')}\n              disabled={schedulerStatus?.isRunning || actionLoading === 'start'}\n              className=\"flex items-center gap-2\"\n            >\n              <Play className=\"w-4 h-4\" />\n              {actionLoading === 'start' ? 'Starting...' : 'Start Scheduler'}\n            </Button>\n            \n            <Button \n              onClick={() => handleSchedulerAction('stop')}\n              disabled={!schedulerStatus?.isRunning || actionLoading === 'stop'}\n              variant=\"outline\"\n              className=\"flex items-center gap-2\"\n            >\n              <Pause className=\"w-4 h-4\" />\n              {actionLoading === 'stop' ? 'Stopping...' : 'Stop Scheduler'}\n            </Button>\n            \n            <Button \n              onClick={() => handleSchedulerAction('run_now')}\n              disabled={actionLoading === 'run_now'}\n              variant=\"secondary\"\n              className=\"flex items-center gap-2\"\n            >\n              <Brain className=\"w-4 h-4\" />\n              {actionLoading === 'run_now' ? 'Reflecting...' : 'Trigger Reflection Now'}\n            </Button>\n          </div>\n        </CardContent>\n      </Card>\n\n      {/* Current Feeling Display */}\n      {lastFeeling && (\n        <Card>\n          <CardHeader>\n            <CardTitle className=\"flex items-center gap-2\">\n              <span className=\"text-2xl\">{lastFeeling.feeling_emoji}</span>\n              Latest Reflection\n            </CardTitle>\n          </CardHeader>\n          <CardContent>\n            <div className=\"space-y-4\">\n              <div>\n                <div className=\"text-sm text-gray-600 dark:text-gray-400 mb-1\">Current Feeling</div>\n                <div className=\"text-xl font-semibold\">{lastFeeling.feeling_adjective}</div>\n              </div>\n              \n              <div>\n                <div className=\"text-sm text-gray-600 dark:text-gray-400 mb-1\">Mood Score</div>\n                <div className=\"flex items-center gap-2\">\n                  <div className=\"text-lg font-semibold\">{lastFeeling.calculated_mood_score}/10</div>\n                  <div className=\"w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2\">\n                    <div \n                      className=\"bg-purple-500 h-2 rounded-full transition-all duration-300\"\n                      style={{ width: `${(lastFeeling.calculated_mood_score / 10) * 100}%` }}\n                    ></div>\n                  </div>\n                </div>\n              </div>\n              \n              <div>\n                <div className=\"text-sm text-gray-600 dark:text-gray-400 mb-1\">Journal Entry</div>\n                <div className=\"p-4 bg-gray-50 dark:bg-gray-800 rounded-lg italic\">\n                  \"{lastFeeling.narrative_briefing}\"\n                </div>\n              </div>\n              \n              <div>\n                <div className=\"text-sm text-gray-600 dark:text-gray-400 mb-1\">Focus Summary</div>\n                <div className=\"text-sm\">{lastFeeling.current_focus_summary}</div>\n              </div>\n              \n              <div className=\"text-xs text-gray-500\">\n                Reflected at: {new Date(lastFeeling.timestamp).toLocaleString()}\n              </div>\n            </div>\n          </CardContent>\n        </Card>\n      )}\n      \n      {/* Quick Actions */}\n      <Card>\n        <CardHeader>\n          <CardTitle>Quick Actions</CardTitle>\n        </CardHeader>\n        <CardContent>\n          <div className=\"space-y-2\">\n            <Button \n              variant=\"outline\" \n              className=\"w-full justify-start\"\n              onClick={() => window.open('/status', '_blank')}\n            >\n              <Activity className=\"w-4 h-4 mr-2\" />\n              View Public Status Page\n            </Button>\n            <Button \n              variant=\"outline\" \n              className=\"w-full justify-start\"\n              onClick={() => {\n                fetchSchedulerStatus();\n                fetchLastFeeling();\n              }}\n            >\n              <RefreshCw className=\"w-4 h-4 mr-2\" />\n              Refresh Data\n            </Button>\n          </div>\n        </CardContent>\n      </Card>\n    </div>\n  );\n}"}, {"old_string": "    try {\n      const response = await fetch('/api/admin/charisma-scheduler', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({ action }),\n      });\n\n      if (response.ok) {\n        const result = await response.json();\n        if (result.status) {\n          setSchedulerStatus(result.status);\n        }\n        if (result.feeling) {\n          setLastFeeling(result.feeling);\n        }\n        // Refresh data after action\n        await fetchSchedulerStatus();\n        await fetchLastFeeling();\n      }\n    } catch (error) {\n      console.error(`Failed to ${action} scheduler:`, error);\n    } finally {\n      setActionLoading(null);\n    }", "new_string": "    try {\n      const response = await fetch('/api/admin/charisma-scheduler', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({ action }),\n      });\n\n      if (response.ok) {\n        const result = await response.json();\n        if (result.status) {\n          setSchedulerStatus(result.status);\n        }\n        if (result.feeling) {\n          setLastFeeling(result.feeling);\n        }\n        // Refresh data after action\n        await fetchSchedulerStatus();\n        await fetchLastFeeling();\n      }\n    } catch (error) {\n      console.error(`Failed to ${action} scheduler:`, error);\n    } finally {\n      setActionLoading(null);\n    }"}]