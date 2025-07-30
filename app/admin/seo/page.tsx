'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Globe, 
  BarChart3, 
  Settings,
  Save,
  CheckCircle,
  AlertCircle,
  Eye,
  Code
} from 'lucide-react';

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Settings Not Found</h2>
          <p className="text-muted-foreground">Unable to load SEO settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">SEO & Analytics Settings</h1>
          <p className="text-muted-foreground">
            Manage your site's SEO settings and analytics integration
          </p>
        </div>

        {/* Message */}
        {message && (
          <Alert className={`mb-6 ${message.type === 'error' ? 'border-destructive bg-destructive/10' : 'border-green-500 bg-green-50'}`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription className={message.type === 'error' ? 'text-destructive' : 'text-green-700'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic SEO</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
          </TabsList>

          {/* Basic SEO */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Basic SEO Settings
                </CardTitle>
                <CardDescription>
                  Configure your site's basic SEO information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => updateSetting('siteName', e.target.value)}
                    placeholder="CharismaAI"
                  />
                </div>

                <div>
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.siteDescription}
                    onChange={(e) => updateSetting('siteDescription', e.target.value)}
                    placeholder="AI-powered communication analysis platform..."
                    rows={3}
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {settings.siteDescription.length}/160 characters (recommended for meta description)
                  </p>
                </div>

                <div>
                  <Label htmlFor="siteKeywords">Keywords</Label>
                  <Input
                    id="siteKeywords"
                    value={settings.siteKeywords}
                    onChange={(e) => updateSetting('siteKeywords', e.target.value)}
                    placeholder="AI, communication, analysis, conversation, insights"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Separate keywords with commas
                  </p>
                </div>

                <div>
                  <Label htmlFor="siteUrl">Site URL</Label>
                  <Input
                    id="siteUrl"
                    type="url"
                    value={settings.siteUrl}
                    onChange={(e) => updateSetting('siteUrl', e.target.value)}
                    placeholder="https://charismaai.vercel.app"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Media */}
          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Social Media Settings
                </CardTitle>
                <CardDescription>
                  Configure Open Graph and Twitter Card settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="ogImage">Open Graph Image URL</Label>
                  <Input
                    id="ogImage"
                    type="url"
                    value={settings.ogImage || ''}
                    onChange={(e) => updateSetting('ogImage', e.target.value)}
                    placeholder="https://charismaai.vercel.app/og-image.png"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended size: 1200x630 pixels
                  </p>
                </div>

                <div>
                  <Label htmlFor="twitterHandle">Twitter Handle</Label>
                  <Input
                    id="twitterHandle"
                    value={settings.twitterHandle || ''}
                    onChange={(e) => updateSetting('twitterHandle', e.target.value)}
                    placeholder="@CharismaAI"
                  />
                </div>

                {/* Preview */}
                <div className="mt-6">
                  <Label>Social Media Preview</Label>
                  <div className="border rounded-lg p-4 bg-muted/50 mt-2">
                    <div className="flex items-start space-x-3">
                      <div className="w-16 h-16 bg-primary/20 rounded flex items-center justify-center">
                        <Globe className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{settings.siteName}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {settings.siteDescription}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{settings.siteUrl}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analytics Integration
                </CardTitle>
                <CardDescription>
                  Configure Google Analytics and Vercel Analytics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                  <Input
                    id="googleAnalyticsId"
                    value={settings.googleAnalyticsId || ''}
                    onChange={(e) => updateSetting('googleAnalyticsId', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter your Google Analytics 4 Measurement ID
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Vercel Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable Vercel's built-in analytics
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.vercelAnalytics}
                    onChange={(e) => updateSetting('vercelAnalytics', e.target.checked)}
                    className="rounded border-input"
                  />
                </div>

                {/* Analytics Status */}
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Analytics Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Google Analytics</span>
                      <span className={settings.googleAnalyticsId ? 'text-green-600' : 'text-muted-foreground'}>
                        {settings.googleAnalyticsId ? 'Configured' : 'Not configured'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Vercel Analytics</span>
                      <span className={settings.vercelAnalytics ? 'text-green-600' : 'text-muted-foreground'}>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Technical SEO
                </CardTitle>
                <CardDescription>
                  Configure robots.txt and sitemap settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="robotsTxt">Robots.txt Content</Label>
                  <Textarea
                    id="robotsTxt"
                    value={settings.robotsTxt}
                    onChange={(e) => updateSetting('robotsTxt', e.target.value)}
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This content will be served at /robots.txt
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>XML Sitemap</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically generate and serve XML sitemap
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.sitemapEnabled}
                    onChange={(e) => updateSetting('sitemapEnabled', e.target.checked)}
                    className="rounded border-input"
                  />
                </div>

                {/* Technical Status */}
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Technical SEO Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Robots.txt</span>
                      <span className="text-green-600">Configured</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>XML Sitemap</span>
                      <span className={settings.sitemapEnabled ? 'text-green-600' : 'text-muted-foreground'}>
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
          <Button onClick={handleSave} disabled={saving} className="min-w-32">
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