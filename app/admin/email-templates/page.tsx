'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Save, Eye, Send, Sparkles, Plus, RefreshCw } from 'lucide-react';
import Edit from 'lucide-react/dist/esm/icons/edit';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import { SkeletonCard } from '@/components/ui/skeleton';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  htmlContent?: string;
  category: string;
  isBuiltIn: boolean;
  isActive: boolean;
  variables?: string[];
  createdAt: string;
  updatedAt: string;
}

export default function EmailTemplatesPage() {
  const { data: session, status } = useSession();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  // Load email templates
  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/email-templates', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch email templates');
      }

      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (err) {
      console.error('Error loading email templates:', err);
      setError('Failed to load email templates');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user.role === 'ADMIN') {
      loadTemplates();
    }
  }, [session]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
        <div className="space-y-6">
          <SkeletonCard className="h-24" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard className="h-48" />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6 relative overflow-hidden">
      {/* Neural background particles - email templates theme */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 left-8 sm:left-20 w-2 h-2 bg-purple-400/20 rounded-full animate-pulse motion-reduce:animate-none"></div>
        <div className="absolute top-48 right-12 sm:right-32 w-1 h-1 bg-cyan-400/25 rounded-full animate-ping motion-reduce:animate-none"></div>
        <div className="absolute bottom-32 left-6 sm:left-16 w-1.5 h-1.5 bg-blue-400/20 rounded-full animate-pulse motion-reduce:animate-none" style={{animationDelay: '1.5s'}}></div>
      </div>
      
      <div className="space-y-6 relative z-10">
      {/* Error Message */}
      {error && (
        <Alert className="bg-red-500/20 border-red-500/30 text-white">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {message && (
        <Alert className={message.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-white' : 'bg-green-500/20 border-green-500/30 text-white'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

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
          <div className="flex items-center gap-3">
            <Badge className="bg-purple-500/20 text-purple-200 border-purple-400/30">
              <Sparkles className="w-3 h-3 mr-1" />
              {templates.length} Templates
            </Badge>
            <Button
              onClick={loadTemplates}
              size="sm"
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-8">
                <Mail className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <h3 className="text-white text-lg font-medium mb-2">No Templates Found</h3>
                <p className="text-white/60 mb-4">Create your first email template to get started.</p>
                <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          templates.map((template) => (
            <Card key={template.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:scale-105 group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">{template.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    {template.isBuiltIn && (
                      <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30 text-xs">
                        Built-in
                      </Badge>
                    )}
                    <Badge 
                      className={`${
                        template.isActive 
                          ? 'bg-green-500/20 text-green-200 border-green-400/30' 
                          : 'bg-gray-500/20 text-gray-200 border-gray-400/30'
                      }`}
                    >
                      {template.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <CardDescription className="text-white/60">
                  {template.subject}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-white/50">
                    Category: <span className="text-white/70 capitalize">{template.category}</span>
                  </div>
                  <div className="text-sm text-white/50">
                    Last modified: <span className="text-white/70">{new Date(template.updatedAt).toLocaleDateString()}</span>
                  </div>
                  {template.variables && template.variables.length > 0 && (
                    <div className="text-sm text-white/50">
                      Variables: <span className="text-white/70">{template.variables.join(', ')}</span>
                    </div>
                  )}
                  <div className="flex space-x-2 pt-2">
                    <Button size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20 touch-manipulation">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10 touch-manipulation">
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
          <CardDescription className="text-white/60">
            Common email template management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white h-12 touch-manipulation hover:scale-[1.02] transition-all duration-300"
              onClick={() => window.location.href = '/admin/invitation-management?tab=templates'}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Template
            </Button>
            <Button 
              variant="outline" 
              className="bg-white/5 border-white/20 text-white hover:bg-white/10 h-12 touch-manipulation hover:scale-[1.02] transition-all duration-300"
            >
              <Send className="w-4 h-4 mr-2" />
              Test Email Delivery
            </Button>
            <Button 
              variant="outline" 
              className="bg-white/5 border-white/20 text-white hover:bg-white/10 h-12 touch-manipulation hover:scale-[1.02] transition-all duration-300"
            >
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
