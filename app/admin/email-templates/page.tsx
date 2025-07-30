'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Edit, Save, Eye, Send, Sparkles } from 'lucide-react';

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'Welcome Email',
      subject: 'Welcome to CharismaAI',
      type: 'welcome',
      status: 'active',
      lastModified: '2024-01-15'
    },
    {
      id: 2,
      name: 'Password Reset',
      subject: 'Reset Your Password',
      type: 'password-reset',
      status: 'active',
      lastModified: '2024-01-10'
    },
    {
      id: 3,
      name: 'Analysis Complete',
      subject: 'Your Analysis is Ready',
      type: 'notification',
      status: 'active',
      lastModified: '2024-01-12'
    }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
      <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <Mail className="mr-3 h-6 w-6" />
              Email Templates
            </h1>
            <p className="text-white/70 mt-1">
              Manage email templates for user communications
            </p>
          </div>
          <Badge className="bg-purple-500/20 text-purple-200 border-purple-400/30">
            <Sparkles className="w-3 h-3 mr-1" />
            {templates.length} Templates
          </Badge>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">{template.name}</CardTitle>
                <Badge 
                  className={`${
                    template.status === 'active' 
                      ? 'bg-green-500/20 text-green-200 border-green-400/30' 
                      : 'bg-gray-500/20 text-gray-200 border-gray-400/30'
                  }`}
                >
                  {template.status}
                </Badge>
              </div>
              <CardDescription className="text-white/60">
                {template.subject}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-white/50">
                  Type: <span className="text-white/70 capitalize">{template.type}</span>
                </div>
                <div className="text-sm text-white/50">
                  Last modified: <span className="text-white/70">{template.lastModified}</span>
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10">
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
          <CardDescription className="text-white/60">
            Common email template management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white">
              <Mail className="w-4 h-4 mr-2" />
              Create New Template
            </Button>
            <Button variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10">
              <Send className="w-4 h-4 mr-2" />
              Test Email Delivery
            </Button>
            <Button variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10">
              <Save className="w-4 h-4 mr-2" />
              Export Templates
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
