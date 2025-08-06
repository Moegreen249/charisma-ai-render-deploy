'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Globe, Settings, Save, Eye, Code } from "lucide-react";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";

interface SeoSettings {
  id: string;
  siteName: string;
  siteDescription: string;
  siteKeywords: string;
  siteUrl: string;
  ogImage?: string;
  twitterHandle?: string;
  googleAnalyticsId?: string;
  vercelAnalytics: boolean;
  robotsTxt: string;
  sitemapEnabled: boolean;
}

export default function AdminSeoPage() {
  const [settings, setSettings] = useState<SeoSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/seo');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        setMessage({ type: 'error', text: 'Failed to load SEO settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load SEO settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const response = await fetch('/api/admin/seo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (response.ok) {
        setSettings(data.settings);
        setMessage({ type: 'success', text: 'SEO settings updated successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update SEO settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update SEO settings' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const updateSetting = (field: keyof SeoSettings, value: any) => {
    if (settings) {
      setSettings({
        ...settings,
        [field]: value,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4 text-center">Loading SEO settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 mt-20">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-white">Settings Not Found</h2>
            <p className="text-white/70">Unable to load SEO settings.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6 relative overflow-hidden">
      {/* Neural background particles - SEO theme */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-28 left-16 w-2 h-2 bg-green-400/20 rounded-full animate-pulse motion-reduce:animate-none"></div>
        <div className="absolute top-44 right-20 w-1 h-1 bg-blue-400/25 rounded-full animate-ping motion-reduce:animate-none"></div>
        <div className="absolute top-2/3 left-12 w-1.5 h-1.5 bg-cyan-400/20 rounded-full animate-pulse motion-reduce:animate-none" style={{animationDelay: '1.8s'}}></div>
        <div className="absolute bottom-36 right-28 w-1 h-1 bg-purple-400/25 rounded-full animate-ping motion-reduce:animate-none" style={{animationDelay: '2.2s'}}></div>
        <div className="absolute bottom-20 left-24 w-2 h-2 bg-indigo-300/15 rounded-full animate-pulse motion-reduce:animate-none" style={{animationDelay: '0.7s'}}></div>
      </div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <Settings className="mr-3 h-8 w-8" />
                SEO & Analytics Settings
              </h1>
              <p className="text-white/70 mt-1">
                Manage your site's SEO settings and analytics integration
              </p>
            </div>
            <Badge className="bg-green-500/20 text-green-200 border-green-400/30">
              <Search className="w-3 h-3 mr-1" />
              SEO Manager
            </Badge>
          </div>
        </div>

        {/* Message */}
        {message && (
          <Alert className={`mb-6 backdrop-blur-sm ${message.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-white' : 'bg-green-500/20 border-green-500/30 text-white'}`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm border border-white/20">
            <TabsTrigger value="basic" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">Basic SEO</TabsTrigger>
            <TabsTrigger value="social" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">Social Media</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">Analytics</TabsTrigger>
            <TabsTrigger value="technical" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">Technical</TabsTrigger>
          </TabsList>

          {/* Basic SEO */}
          <TabsContent value="basic" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Search className="h-5 w-5" />
                  Basic SEO Settings
                </CardTitle>
                <CardDescription className="text-white/60">
                  Configure your site's basic SEO information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="siteName" className="text-white">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => updateSetting('siteName', e.target.value)}
                    placeholder="CharismaAI"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>

                <div>
                  <Label htmlFor="siteDescription" className="text-white">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.siteDescription}
                    onChange={(e) => updateSetting('siteDescription', e.target.value)}
                    placeholder="AI-powered communication analysis platform..."
                    rows={3}
                    maxLength={160}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                  <p className="text-xs text-white/50 mt-1">
                    {settings.siteDescription.length}/160 characters (recommended for meta description)
                  </p>
                </div>

                <div>
                  <Label htmlFor="siteKeywords" className="text-white">Keywords</Label>
                  <Input
                    id="siteKeywords"
                    value={settings.siteKeywords}
                    onChange={(e) => updateSetting('siteKeywords', e.target.value)}
                    placeholder="AI, communication, analysis, conversation, insights"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                  <p className="text-xs text-white/50 mt-1">
                    Separate keywords with commas
                  </p>
                </div>

                <div>
                  <Label htmlFor="siteUrl" className="text-white">Site URL</Label>
                  <Input
                    id="siteUrl"
                    type="url"
                    value={settings.siteUrl}
                    onChange={(e) => updateSetting('siteUrl', e.target.value)}
                    placeholder="https://charismaai.vercel.app"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Media */}
          <TabsContent value="social" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Globe className="h-5 w-5" />
                  Social Media Settings
                </CardTitle>
                <CardDescription className="text-white/60">
                  Configure Open Graph and Twitter Card settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="ogImage" className="text-white">Open Graph Image URL</Label>
                  <Input
                    id="ogImage"
                    type="url"
                    value={settings.ogImage || ''}
                    onChange={(e) => updateSetting('ogImage', e.target.value)}
                    placeholder="https://charismaai.vercel.app/og-image.png"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                  <p className="text-xs text-white/50 mt-1">
                    Recommended size: 1200x630 pixels
                  </p>
                </div>

                <div>
                  <Label htmlFor="twitterHandle" className="text-white">Twitter Handle</Label>
                  <Input
                    id="twitterHandle"
                    value={settings.twitterHandle || ''}
                    onChange={(e) => updateSetting('twitterHandle', e.target.value)}
                    placeholder="@CharismaAI"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>

                {/* Preview */}
                <div className="mt-6">
                  <Label className="text-white">Social Media Preview</Label>
                  <div className="border border-white/20 rounded-lg p-4 bg-white/5 mt-2">
                    <div className="flex items-start space-x-3">
                      <div className="w-16 h-16 bg-primary/20 rounded flex items-center justify-center">
                        <Globe className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm text-white">{settings.siteName}</h3>
                        <p className="text-xs text-white/60 mt-1 line-clamp-2">
                          {settings.siteDescription}
                        </p>
                        <p className="text-xs text-white/50 mt-1">{settings.siteUrl}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <BarChart3 className="h-5 w-5" />
                  Analytics Integration
                </CardTitle>
                <CardDescription className="text-white/60">
                  Configure Google Analytics and Vercel Analytics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="googleAnalyticsId" className="text-white">Google Analytics ID</Label>
                  <Input
                    id="googleAnalyticsId"
                    value={settings.googleAnalyticsId || ''}
                    onChange={(e) => updateSetting('googleAnalyticsId', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                  <p className="text-xs text-white/50 mt-1">
                    Enter your Google Analytics 4 Measurement ID
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Vercel Analytics</Label>
                    <p className="text-sm text-white/60">
                      Enable Vercel's built-in analytics
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.vercelAnalytics}
                    onChange={(e) => updateSetting('vercelAnalytics', e.target.checked)}
                    className="rounded border-white/30 bg-white/10"
                  />
                </div>

                {/* Analytics Status */}
                <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="font-semibold mb-2 text-white">Analytics Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Google Analytics</span>
                      <span className={settings.googleAnalyticsId ? 'text-green-300' : 'text-white/50'}>
                        {settings.googleAnalyticsId ? 'Configured' : 'Not configured'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Vercel Analytics</span>
                      <span className={settings.vercelAnalytics ? 'text-green-300' : 'text-white/50'}>
                        {settings.vercelAnalytics ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Technical */}
          <TabsContent value="technical" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Code className="h-5 w-5" />
                  Technical SEO
                </CardTitle>
                <CardDescription className="text-white/60">
                  Configure robots.txt and sitemap settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="robotsTxt" className="text-white">Robots.txt Content</Label>
                  <Textarea
                    id="robotsTxt"
                    value={settings.robotsTxt}
                    onChange={(e) => updateSetting('robotsTxt', e.target.value)}
                    rows={6}
                    className="font-mono text-sm bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                  <p className="text-xs text-white/50 mt-1">
                    This content will be served at /robots.txt
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">XML Sitemap</Label>
                    <p className="text-sm text-white/60">
                      Automatically generate and serve XML sitemap
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.sitemapEnabled}
                    onChange={(e) => updateSetting('sitemapEnabled', e.target.checked)}
                    className="rounded border-white/30 bg-white/10"
                  />
                </div>

                {/* Technical Status */}
                <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="font-semibold mb-2 text-white">Technical SEO Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Robots.txt</span>
                      <span className="text-green-300">Configured</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">XML Sitemap</span>
                      <span className={settings.sitemapEnabled ? 'text-green-300' : 'text-white/50'}>
                        {settings.sitemapEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={saving} 
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white h-12 touch-manipulation hover:scale-[1.02] transition-all duration-300 min-w-32"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}