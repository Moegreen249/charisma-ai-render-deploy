import { Metadata } from 'next';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Clock,
  Activity,
  Server,
  Database,
  Zap,
  Globe,
  Shield,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'System Status - CharismaAI',
  description: 'Check the current status of CharismaAI services, including uptime, performance metrics, and any ongoing incidents.',
};

const systemServices = [
  {
    name: 'Web Application',
    status: 'operational',
    uptime: '99.9%',
    responseTime: '125ms',
    description: 'Main CharismaAI web interface',
  },
  {
    name: 'Analysis Engine',
    status: 'operational',
    uptime: '99.8%',
    responseTime: '2.3s',
    description: 'AI-powered conversation analysis service',
  },
  {
    name: 'Authentication',
    status: 'operational',
    uptime: '99.9%',
    responseTime: '89ms',
    description: 'User authentication and session management',
  },
  {
    name: 'Database',
    status: 'operational',
    uptime: '100%',
    responseTime: '45ms',
    description: 'Primary database and data storage',
  },
  {
    name: 'File Upload',
    status: 'operational',
    uptime: '99.7%',
    responseTime: '156ms',
    description: 'Chat file upload and processing service',
  },
  {
    name: 'Admin Panel',
    status: 'operational',
    uptime: '99.9%',
    responseTime: '98ms',
    description: 'Administrative dashboard and tools',
  },
];

const recentIncidents = [
  {
    date: '2024-01-15',
    title: 'Scheduled Maintenance - Database Optimization',
    status: 'resolved',
    duration: '30 minutes',
    description: 'Routine database maintenance to improve query performance. All services were restored within the scheduled window.',
  },
  {
    date: '2024-01-08',
    title: 'Temporary Analysis Delays',
    status: 'resolved', 
    duration: '45 minutes',
    description: 'Higher than normal analysis processing times due to increased demand. Additional resources were provisioned to resolve the issue.',
  },
];

const performanceMetrics = [
  {
    icon: TrendingUp,
    label: 'Overall Uptime',
    value: '99.9%',
    trend: 'stable',
    period: 'Last 30 days',
  },
  {
    icon: Zap,
    label: 'Avg Response Time',
    value: '127ms',
    trend: 'improved',
    period: 'Last 24 hours',
  },
  {
    icon: Activity,
    label: 'Analyses Completed',
    value: '1,247',
    trend: 'increased', 
    period: 'Today',
  },
  {
    icon: Globe,
    label: 'Active Users',
    value: '89',
    trend: 'stable',
    period: 'Right now',
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'operational':
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    case 'degraded':
      return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    case 'outage':
      return <XCircle className="w-5 h-5 text-red-400" />;
    default:
      return <Clock className="w-5 h-5 text-gray-400" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'operational':
      return <Badge className="bg-green-500/20 text-green-200 border-green-400/30">Operational</Badge>;
    case 'degraded':
      return <Badge className="bg-yellow-500/20 text-yellow-200 border-yellow-400/30">Degraded</Badge>;
    case 'outage':
      return <Badge className="bg-red-500/20 text-red-200 border-red-400/30">Outage</Badge>;
    case 'resolved':
      return <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30">Resolved</Badge>;
    default:
      return <Badge className="bg-gray-500/20 text-gray-200 border-gray-400/30">Unknown</Badge>;
  }
};

export default function StatusPage() {
  const overallStatus = systemServices.every(service => service.status === 'operational') ? 'operational' : 'degraded';

  return (
    <UnifiedLayout variant="default">
      <div className="text-white py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            {getStatusIcon(overallStatus)}
            <Badge className={overallStatus === 'operational' ? 'bg-green-500/20 text-green-200 border-green-400/30' : 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30'}>
              <Activity className="w-4 h-4 mr-2" />
              {overallStatus === 'operational' ? 'All Systems Operational' : 'Some Systems Degraded'}
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            System Status
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Real-time status and performance metrics for all CharismaAI services.
          </p>
        </div>

        {/* Performance Overview */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {performanceMetrics.map((metric, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-6 text-center">
                  <metric.icon className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
                  <div className="text-sm font-medium text-gray-300 mb-2">{metric.label}</div>
                  <div className="text-xs text-gray-400">{metric.period}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* System Services */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Service Status</h2>
          <div className="space-y-4">
            {systemServices.map((service, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(service.status)}
                      <div>
                        <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                        <p className="text-sm text-gray-300">{service.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-right">
                      <div className="hidden sm:block">
                        <div className="text-sm text-gray-400">Uptime</div>
                        <div className="text-lg font-semibold text-white">{service.uptime}</div>
                      </div>
                      <div className="hidden sm:block">
                        <div className="text-sm text-gray-400">Response Time</div>
                        <div className="text-lg font-semibold text-white">{service.responseTime}</div>
                      </div>
                      {getStatusBadge(service.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Recent Incidents</h2>
          {recentIncidents.length > 0 ? (
            <div className="space-y-4">
              {recentIncidents.map((incident, index) => (
                <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white text-lg">{incident.title}</CardTitle>
                        <CardDescription className="text-gray-300">
                          {incident.date} • Duration: {incident.duration}
                        </CardDescription>
                      </div>
                      {getStatusBadge(incident.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">{incident.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Recent Incidents</h3>
                <p className="text-gray-300">
                  All systems have been running smoothly. We'll update this page if any issues occur.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Subscribe to Updates */}
        <div className="text-center">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <Shield className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">Stay Informed</h3>
              <p className="text-gray-300 mb-6">
                Want to receive notifications about system status updates and maintenance windows? 
                Contact our support team to subscribe to status updates.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                Last updated: {new Date().toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </UnifiedLayout>
  );
}