'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Server, Activity, AlertTriangle, CheckCircle, Cpu, HardDrive, Wifi, Sparkles } from 'lucide-react';

export default function SystemPage() {
  const [systemStats, setSystemStats] = useState({
    uptime: '7 days, 14 hours',
    cpuUsage: 45,
    memoryUsage: 67,
    diskUsage: 34,
    activeUsers: 156,
    totalAnalyses: 2847,
    dbConnections: 12
  });

  const [services, setServices] = useState([
    { name: 'Database', status: 'healthy', uptime: '99.9%' },
    { name: 'AI Processing', status: 'healthy', uptime: '99.7%' },
    { name: 'Email Service', status: 'healthy', uptime: '99.8%' },
    { name: 'File Storage', status: 'warning', uptime: '98.5%' },
    { name: 'Authentication', status: 'healthy', uptime: '99.9%' }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
      <div className="space-y-6">
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
          <Badge className="bg-green-500/20 text-green-200 border-green-400/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            All Systems Operational
          </Badge>
        </div>
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
            <div className="text-2xl font-bold text-white">{systemStats.cpuUsage}%</div>
            <div className="w-full bg-white/20 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${systemStats.cpuUsage}%` }}
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
            <div className="text-2xl font-bold text-white">{systemStats.memoryUsage}%</div>
            <div className="w-full bg-white/20 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${systemStats.memoryUsage}%` }}
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
            <div className="text-2xl font-bold text-white">{systemStats.activeUsers}</div>
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
            <div className="text-2xl font-bold text-white">{systemStats.totalAnalyses.toLocaleString()}</div>
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
            {services.map((service, index) => (
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
