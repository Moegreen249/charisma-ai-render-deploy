'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Bug, Clock, Database, Download, Eye, RefreshCw, Search, Shield, Trash2, TrendingDown, TrendingUp, Users, X, Zap, WifiOff, Server, UserX,  } from "lucide-react";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import Filter from "lucide-react/dist/esm/icons/filter";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import { motion, AnimatePresence } from 'framer-motion';
// import { useErrorStore, type ErrorDetails } from '@/lib/error-management';
import { themeClasses } from '@/components/providers/ThemeProvider';

interface ErrorDetails {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  description?: string;
  createdAt: string;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  stackTrace?: string;
  endpoint?: string;
  userId?: string;
  timestamp?: string;
  resolved?: boolean;
  metadata?: any;
}

const ERROR_TYPE_ICONS = {
  API: Server,
  CLIENT: Bug,
  NETWORK: WifiOff,
  DATABASE: Database,
  AUTH: Shield,
  VALIDATION: AlertCircle,
  SYSTEM: Zap,
} as const;

const SEVERITY_COLORS = {
  LOW: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  MEDIUM: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  HIGH: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  CRITICAL: 'bg-red-500/20 text-red-300 border-red-500/30',
} as const;

export default function AdminErrorsPage() {
  const { data: session, status } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedError, setSelectedError] = useState<ErrorDetails | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const [errors, setErrors] = useState<ErrorDetails[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) redirect('/auth/signin');
    if (session.user.role !== 'ADMIN') redirect('/');
  }, [session, status]);

  // Load errors on mount
  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      loadErrorData();
    }
  }, [session]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(loadErrorData, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadErrorData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/errors');
      if (response.ok) {
        const data = await response.json();
        setErrors(data.errors || []);
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error('Failed to load errors:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleResolveError = async (errorId: string) => {
    try {
      const response = await fetch(`/api/admin/errors/${errorId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolvedBy: session?.user?.id }),
      });
      if (response.ok) {
        await loadErrorData();
      }
    } catch (error) {
      console.error('Failed to resolve error:', error);
    }
  };

  const handleBulkResolve = async (severity: string) => {
    try {
      const response = await fetch('/api/admin/errors/bulk-resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ severity }),
      });
      if (response.ok) {
        await loadErrorData();
      }
    } catch (error) {
      console.error('Failed to bulk resolve errors:', error);
    }
  };

  const clearErrors = async () => {
    try {
      const response = await fetch('/api/admin/errors/bulk-resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearAll: true }),
      });
      if (response.ok) {
        await loadErrorData();
      }
    } catch (error) {
      console.error('Failed to clear errors:', error);
    }
  };

  const filteredErrors = errors.filter((error) => {
    const matchesSearch = !searchTerm || 
      error.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      error.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || error.type === selectedType;
    const matchesSeverity = selectedSeverity === 'all' || error.severity === selectedSeverity;
    
    // Time range filter
    const hoursMap = { '1h': 1, '24h': 24, '7d': 168, '30d': 720 };
    const hours = hoursMap[selectedTimeRange as keyof typeof hoursMap] || 168;
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    const matchesTimeRange = error.timestamp ? new Date(error.timestamp) > cutoff : true;

    return matchesSearch && matchesType && matchesSeverity && matchesTimeRange;
  });

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className={`${themeClasses.bg.glass} rounded-2xl p-8 border border-white/20`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className={`${themeClasses.text.primary} mt-4 text-center`}>Loading error data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6 relative overflow-hidden">
      {/* Neural background particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-red-400/20 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-16 w-1 h-1 bg-orange-400/25 rounded-full animate-ping"></div>
        <div className="absolute top-2/3 left-8 w-1.5 h-1.5 bg-yellow-400/20 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute bottom-32 right-20 w-1 h-1 bg-red-400/25 rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className={`${themeClasses.bg.glass} rounded-lg p-6 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${themeClasses.text.primary} flex items-center`}>
                <AlertTriangle className="mr-3 h-8 w-8 text-red-400" />
                Error Management
              </h1>
              <p className={`${themeClasses.text.secondary} mt-1`}>
                Monitor and resolve platform errors across all systems
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`${
                  autoRefresh
                    ? 'bg-green-500/20 border-green-500/30 text-green-300 hover:bg-green-500/30'
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                } transition-all duration-300`}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
              </Button>
              <Button
                onClick={loadErrorData}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 text-white transition-all duration-300"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className={`${themeClasses.bg.glass} hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300 hover:scale-105 group`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${themeClasses.text.primary}`}>Total Errors</CardTitle>
              <div className="p-2 rounded-full bg-red-500/20 group-hover:bg-red-500/30 transition-colors">
                <AlertTriangle className="h-4 w-4 text-red-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${themeClasses.text.primary} group-hover:scale-110 transition-transform duration-300`}>
                {stats?.total?.toLocaleString() || 0}
              </div>
              <p className={`text-xs ${themeClasses.text.muted} mt-1`}>
                All time errors recorded
              </p>
            </CardContent>
          </Card>

          <Card className={`${themeClasses.bg.glass} hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 hover:scale-105 group`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${themeClasses.text.primary}`}>Critical Issues</CardTitle>
              <div className="p-2 rounded-full bg-orange-500/20 group-hover:bg-orange-500/30 transition-colors">
                <AlertCircle className="h-4 w-4 text-orange-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${themeClasses.text.primary} group-hover:scale-110 transition-transform duration-300`}>
                {(stats?.bySeverity?.['CRITICAL'] || 0) + (stats?.bySeverity?.['HIGH'] || 0)}
              </div>
              <p className={`text-xs ${themeClasses.text.muted} mt-1`}>
                High & critical severity
              </p>
            </CardContent>
          </Card>

          <Card className={`${themeClasses.bg.glass} hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300 hover:scale-105 group`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${themeClasses.text.primary}`}>Resolved</CardTitle>
              <div className="p-2 rounded-full bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                <CheckCircle className="h-4 w-4 text-green-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${themeClasses.text.primary} group-hover:scale-110 transition-transform duration-300`}>
                {stats?.resolved || 0}
              </div>
              <p className={`text-xs ${themeClasses.text.muted} mt-1`}>
                {stats?.total && stats.total > 0 ? Math.round(((stats.resolved || 0) / stats.total) * 100) : 0}% resolution rate
              </p>
            </CardContent>
          </Card>

          <Card className={`${themeClasses.bg.glass} hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:scale-105 group`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${themeClasses.text.primary}`}>Recent</CardTitle>
              <div className="p-2 rounded-full bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                <Clock className="h-4 w-4 text-blue-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${themeClasses.text.primary} group-hover:scale-110 transition-transform duration-300`}>
                {stats?.recent || 0}
              </div>
              <p className={`text-xs ${themeClasses.text.muted} mt-1`}>
                Last 24 hours
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <Card className={`${themeClasses.bg.glass} hover:bg-white/[0.15] transition-all duration-300`}>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeClasses.text.muted} w-4 h-4`} />
                <Input
                  placeholder="Search errors by message or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 ${themeClasses.bg.card} border-white/20 ${themeClasses.text.primary} placeholder:text-white/60`}
                />
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className={`w-40 ${themeClasses.bg.card} border-white/20 ${themeClasses.text.primary}`}>
                  <SelectValue placeholder="Error Type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all" className="text-white hover:bg-gray-700">All Types</SelectItem>
                  {Object.keys(ERROR_TYPE_ICONS).map((type) => (
                    <SelectItem key={type} value={type} className="text-white hover:bg-gray-700">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger className={`w-40 ${themeClasses.bg.card} border-white/20 ${themeClasses.text.primary}`}>
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all" className="text-white hover:bg-gray-700">All Severities</SelectItem>
                  {Object.keys(SEVERITY_COLORS).map((severity) => (
                    <SelectItem key={severity} value={severity} className="text-white hover:bg-gray-700">
                      {severity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className={`w-32 ${themeClasses.bg.card} border-white/20 ${themeClasses.text.primary}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="1h" className="text-white hover:bg-gray-700">Last Hour</SelectItem>
                  <SelectItem value="24h" className="text-white hover:bg-gray-700">Last 24h</SelectItem>
                  <SelectItem value="7d" className="text-white hover:bg-gray-700">Last 7d</SelectItem>
                  <SelectItem value="30d" className="text-white hover:bg-gray-700">Last 30d</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full grid-cols-3 ${themeClasses.bg.card} border-white/20`}>
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 hover:text-white transition-colors"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="errors"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 hover:text-white transition-colors"
            >
              Error List ({filteredErrors.length})
            </TabsTrigger>
            <TabsTrigger 
              value="analytics"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 hover:text-white transition-colors"
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="errors" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>
                Error Details ({filteredErrors.length})
              </h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkResolve('LOW')}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Resolve All Low Priority
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearErrors}
                  className="border-red-400/20 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                <AnimatePresence>
                  {filteredErrors.map((error) => {
                    const IconComponent = ERROR_TYPE_ICONS[error.type as keyof typeof ERROR_TYPE_ICONS] || Bug;
                    return (
                      <motion.div
                        key={error.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card className={`${themeClasses.bg.glass} border-l-4 ${
                          error.severity === 'CRITICAL' ? 'border-l-red-500' :
                          error.severity === 'HIGH' ? 'border-l-orange-500' :
                          error.severity === 'MEDIUM' ? 'border-l-yellow-500' :
                          'border-l-blue-500'
                        } hover:bg-white/[0.15] transition-all duration-300`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <div className={`p-2 rounded-full ${
                                  error.severity === 'CRITICAL' ? 'bg-red-500/20' :
                                  error.severity === 'HIGH' ? 'bg-orange-500/20' :
                                  error.severity === 'MEDIUM' ? 'bg-yellow-500/20' :
                                  'bg-blue-500/20'
                                }`}>
                                  <IconComponent className={`w-4 h-4 ${
                                    error.severity === 'CRITICAL' ? 'text-red-400' :
                                    error.severity === 'HIGH' ? 'text-orange-400' :
                                    error.severity === 'MEDIUM' ? 'text-yellow-400' :
                                    'text-blue-400'
                                  }`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge
                                      variant="outline"
                                      className={SEVERITY_COLORS[error.severity]}
                                    >
                                      {error.severity}
                                    </Badge>
                                    <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                                      {error.type}
                                    </Badge>
                                    {(error.resolved || error.isResolved) && (
                                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Resolved
                                      </Badge>
                                    )}
                                  </div>
                                  <h4 className={`font-medium ${themeClasses.text.primary} mb-1`}>
                                    {error.message}
                                  </h4>
                                  {error.description && (
                                    <p className={`text-sm ${themeClasses.text.muted} mb-2`}>
                                      {error.description}
                                    </p>
                                  )}
                                  <div className={`text-xs ${themeClasses.text.muted} space-y-1`}>
                                    <p>
                                      {error.timestamp ? new Date(error.timestamp).toLocaleString() : 'Unknown time'}
                                      {error.metadata?.component && ` • ${error.metadata.component}`}
                                      {error.endpoint && ` • ${error.endpoint}`}
                                    </p>
                                    {error.resolvedAt && error.resolvedBy && (
                                      <p className="text-green-400">
                                        Resolved {new Date(error.resolvedAt).toLocaleString()} by {error.resolvedBy}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2 ml-4">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-white/20 text-white hover:bg-white/10"
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
                                    <DialogHeader>
                                      <DialogTitle className="text-white">Error Details</DialogTitle>
                                      <DialogDescription className="text-gray-300">
                                        Full error information and stack trace
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <h4 className="font-medium text-white mb-2">Error Message</h4>
                                        <p className="text-gray-300 p-3 bg-gray-800 rounded-md">
                                          {error.message}
                                        </p>
                                      </div>
                                      {error.stackTrace && (
                                        <div>
                                          <h4 className="font-medium text-white mb-2">Stack Trace</h4>
                                          <pre className="text-xs text-gray-300 p-3 bg-gray-800 rounded-md overflow-auto max-h-60">
                                            {error.stackTrace}
                                          </pre>
                                        </div>
                                      )}
                                      {error.metadata && (
                                        <div>
                                          <h4 className="font-medium text-white mb-2">Metadata</h4>
                                          <pre className="text-xs text-gray-300 p-3 bg-gray-800 rounded-md">
                                            {JSON.stringify(error.metadata, null, 2)}
                                          </pre>
                                        </div>
                                      )}
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                {!(error.resolved || error.isResolved) && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleResolveError(error.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Resolve
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {filteredErrors.length === 0 && (
                  <div className={`text-center py-12 ${themeClasses.text.muted}`}>
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
                    <h3 className={`text-lg font-medium ${themeClasses.text.primary} mb-2`}>
                      No errors found
                    </h3>
                    <p>No errors match your current filters. Great job!</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}