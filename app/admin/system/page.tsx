'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Database, Server, Activity, Cpu, HardDrive, Wifi, Sparkles, RefreshCw } from 'lucide-react';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import { SkeletonStats, SkeletonCard } from '@/components/ui/skeleton';

interface SystemStats {
  uptime: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  totalMemory: number;
  usedMemory: number;
  activeUsers: number;
  totalAnalyses: number;
  activeJobs: number;
  dbResponseTime: number;
}

interface Service {
  name: string;
  status: 'healthy' | 'warning' | 'error' | 'idle';
  uptime: string;
  responseTime?: string;
}

interface SystemHealth {
  overallStatus: 'healthy' | 'warning' | 'error';
  systemStats: SystemStats;
  services: Service[];
  timestamp: string;
}

export default function SystemPage() {
  const { data: session, status } = useSession();
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Authentication check
  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      redirect('/auth/signin');
    }

    if (session.user.role !== 'ADMIN') {
      redirect('/');
    }
  }, [session, status]);

  // Load system health data
  const loadSystemHealth = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/system-health');
      if (!response.ok) {
        throw new Error('Failed to fetch system health');
      }
      const data = await response.json();
      setSystemHealth(data);
      setLastUpdated(new Date());
      setError('');
    } catch (err) {
      console.error('Error loading system health:', err);
      setError('Failed to load system health data');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user.role === 'ADMIN') {
      loadSystemHealth();
      // Auto-refresh every 30 seconds
      const interval = setInterval(loadSystemHealth, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
        <div className="space-y-6">
          <SkeletonCard className="h-24" />
          <SkeletonStats count={4} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkeletonCard className="h-48" />
            <SkeletonCard className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return (
          <Badge className="bg-green-500/20 text-green-200 border-green-400/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            All Systems Operational
          </Badge>
        );
      case 'warning':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-200 border-yellow-400/30">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Some Issues Detected
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-500/20 text-red-200 border-red-400/30">
            <AlertTriangle className="w-3 h-3 mr-1" />
            System Issues
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500/20 text-gray-200 border-gray-400/30">
            <Activity className="w-3 h-3 mr-1" />
            Unknown Status
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6 relative overflow-hidden">
      {/* Neural background particles - system theme */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 left-8 sm:left-20 w-2 h-2 bg-green-400/20 rounded-full animate-pulse motion-reduce:animate-none"></div>
        <div className="absolute top-48 right-12 sm:right-32 w-1 h-1 bg-blue-400/25 rounded-full animate-ping motion-reduce:animate-none"></div>
        <div className="absolute bottom-32 left-6 sm:left-16 w-1.5 h-1.5 bg-cyan-400/20 rounded-full animate-pulse motion-reduce:animate-none" style={{animationDelay: '1.5s'}}></div>
      </div>
      
      <div className="space-y-6 relative z-10">
      {/* Error Message */}
      {error && (
        <Alert className="bg-red-500/20 border-red-500/30 text-white">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <Server className="mr-3 h-6 w-6" />
              System Status
            </h1>
            <p className="text-white/70 mt-1">
              Monitor system health and performance metrics
            </p>
          </div>
          <div className="flex items-center gap-3">
            {systemHealth && getStatusBadge(systemHealth.overallStatus)}
            <Button
              onClick={loadSystemHealth}
              size="sm"
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
        {systemHealth && (
          <div className="mt-2 text-sm text-white/60">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm font-medium flex items-center">
              <Cpu className="w-4 h-4 mr-2" />
              CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{systemHealth?.systemStats.cpuUsage || 0}%</div>
            <div className="w-full bg-white/20 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${systemHealth?.systemStats.cpuUsage || 0}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm font-medium flex items-center">
              <HardDrive className="w-4 h-4 mr-2" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{systemHealth?.systemStats.memoryUsage || 0}%</div>
            <div className="w-full bg-white/20 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${systemHealth?.systemStats.memoryUsage || 0}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm font-medium flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{systemHealth?.systemStats.activeUsers || 0}</div>
            <div className="text-sm text-white/60">Currently online</div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm font-medium flex items-center">
              <Database className="w-4 h-4 mr-2" />
              Total Analyses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{systemHealth?.systemStats.totalAnalyses?.toLocaleString() || '0'}</div>
            <div className="text-sm text-white/60">All time</div>
          </CardContent>
        </Card>
      </div>

      {/* Services Status */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Service Health</CardTitle>
          <CardDescription className="text-white/60">
            Status of critical system services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemHealth?.services.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    service.status === 'healthy' ? 'bg-green-500' : 
                    service.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-white font-medium">{service.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-white/60 text-sm">Uptime: {service.uptime}</span>
                  <Badge className={`${
                    service.status === 'healthy' ? 'bg-green-500/20 text-green-200 border-green-400/30' :
                    service.status === 'warning' ? 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30' :
                    'bg-red-500/20 text-red-200 border-red-400/30'
                  }`}>
                    {service.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Actions */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white">System Actions</CardTitle>
          <CardDescription className="text-white/60">
            Administrative system operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
              <Activity className="w-4 h-4 mr-2" />
              View Logs
            </Button>
            <Button variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10">
              <Database className="w-4 h-4 mr-2" />
              Database Backup
            </Button>
            <Button variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10">
              <Server className="w-4 h-4 mr-2" />
              Restart Services
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
