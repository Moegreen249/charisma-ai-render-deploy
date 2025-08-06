"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, Crown, Settings, Users, Save, RefreshCw, Brain, Zap, Clock, Info } from "lucide-react";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import { cn } from "@/lib/utils";
import { AI_PROVIDERS, getProviderConfig, type AIProvider, type AIModel } from "@/lib/ai-providers-client";

interface StorySettings {
  id: string;
  isEnabled: boolean;
  freeTrialDays: number;
  maxFreeStories: number;
  systemPrompt: string;
  promptVersion: string;
  allowedProviders: string[];
  defaultProvider: string;
  defaultModel: string;
  timeoutSeconds: number;
  isProFeature: boolean;
  updatedAt: string;
  updater?: {
    name: string;
    email: string;
  };
}

interface StoryStats {
  totalStories: number;
  completedStories: number;
  failedStories: number;
  generatingStories: number;
  successRate: number;
  totalUsers: number;
  proUsers: number;
  activeTrialUsers: number;
}

export default function StorySettingsPanel() {
  const [settings, setSettings] = useState<StorySettings | null>(null);
  const [stats, setStats] = useState<StoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedPrompt, setExpandedPrompt] = useState(false);
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [selectedProviderConfig, setSelectedProviderConfig] = useState<any>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  // Load available models when provider changes
  useEffect(() => {
    if (settings?.defaultProvider) {
      const providerConfig = getProviderConfig(settings.defaultProvider as AIProvider);
      setSelectedProviderConfig(providerConfig);
      
      if (providerConfig) {
        const models = providerConfig.models.filter(m => m.available);
        setAvailableModels(models);
      }
    }
  }, [settings?.defaultProvider]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/story-settings');
      const data = await response.json();

      if (data.success) {
        setSettings(data.settings);
        setStats(data.stats);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch settings');
      }
    } catch (err) {
      setError('Network error while fetching settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const response = await fetch('/api/admin/story-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.success) {
        setSettings(data.settings);
        setError(null);
        // Show success message or toast
      } else {
        setError(data.error || 'Failed to save settings');
      }
    } catch (err) {
      setError('Network error while saving settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof StorySettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  if (loading) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300">
        <CardContent className="py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-400" />
            <p className="text-white/70">Loading story settings...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !settings) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border border-red-500/30 hover:bg-white/20 transition-all duration-300">
        <CardContent className="py-12">
          <div className="text-center">
            <XCircle className="h-8 w-8 mx-auto mb-4 text-red-400" />
            <p className="text-red-400 mb-4">{error || 'Failed to load settings'}</p>
            <Button onClick={fetchSettings} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Story Feature Header */}
      <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <BookOpen className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  AI Story Generation
                  <Crown className="h-4 w-4 text-yellow-400" />
                  <Badge className={cn(
                    "ml-2",
                    settings.isEnabled 
                      ? "bg-green-500/20 text-green-300 border-green-500/30" 
                      : "bg-red-500/20 text-red-300 border-red-500/30"
                  )}>
                    {settings.isEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </CardTitle>
                <p className="text-white/70 text-sm">
                  Transform analysis results into engaging narrative timelines (Pro Feature)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={fetchSettings}
                variant="outline"
                size="sm"
                className="bg-white/5 border-white/20 text-white hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={saveSettings}
                disabled={saving}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Total Stories</p>
                  <p className="text-2xl font-bold text-white">{stats.totalStories}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Success Rate</p>
                  <p className="text-2xl font-bold text-white">{stats.successRate}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Active Users</p>
                  <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Pro Users</p>
                  <p className="text-2xl font-bold text-white">{stats.proUsers}</p>
                </div>
                <Crown className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settings Configuration */}
      <Card className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Story Feature Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white font-medium">Enable Story Feature</Label>
              <p className="text-sm text-white/70">Allow users to generate AI stories from analyses</p>
            </div>
            <Switch
              checked={settings.isEnabled}
              onCheckedChange={(checked) => updateSetting('isEnabled', checked)}
            />
          </div>

          {/* Free Trial Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white font-medium">Free Trial Duration (Days)</Label>
              <Input
                type="number"
                min="0"
                value={settings.freeTrialDays}
                onChange={(e) => updateSetting('freeTrialDays', parseInt(e.target.value))}
                className="bg-white/10 border-white/20 text-white mt-2"
              />
            </div>
            <div>
              <Label className="text-white font-medium">Max Free Stories</Label>
              <Input
                type="number"
                min="0"  
                value={settings.maxFreeStories}
                onChange={(e) => updateSetting('maxFreeStories', parseInt(e.target.value))}
                className="bg-white/10 border-white/20 text-white mt-2"
              />
            </div>
          </div>

          {/* Enhanced AI Provider Settings */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Provider Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Provider Selection */}
              <div>
                <Label className="text-white font-medium">Default AI Provider</Label>
                <Select
                  value={settings.defaultProvider}
                  onValueChange={(value) => updateSetting('defaultProvider', value)}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_PROVIDERS.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        <div className="flex items-center gap-2">
                          <span>{provider.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {provider.models.filter(m => m.available).length} models
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedProviderConfig && (
                  <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-300 text-sm">
                      <Info className="h-4 w-4" />
                      <span>API Key: {selectedProviderConfig.apiKeyName}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Model Selection */}
              <div>
                <Label className="text-white font-medium">Default Model</Label>
                <Select
                  value={settings.defaultModel}
                  onValueChange={(value) => updateSetting('defaultModel', value)}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white mt-2">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <span>{model.name}</span>
                            <Badge 
                              variant={model.tier === "free" ? "secondary" : model.tier === "both" ? "outline" : "destructive"} 
                              className="text-xs"
                            >
                              {model.tier}
                            </Badge>
                          </div>
                          {model.contextWindow && (
                            <span className="text-xs text-gray-400 ml-2">
                              {(model.contextWindow / 1000).toFixed(0)}k context
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Model Details */}
                {settings.defaultModel && availableModels.find(m => m.id === settings.defaultModel) && (
                  <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    {(() => {
                      const selectedModel = availableModels.find(m => m.id === settings.defaultModel);
                      return selectedModel ? (
                        <div className="space-y-2">
                          <p className="text-purple-300 text-sm font-medium">{selectedModel.name}</p>
                          <p className="text-gray-400 text-xs">{selectedModel.description}</p>
                          <div className="flex items-center gap-4 text-xs">
                            {selectedModel.contextWindow && (
                              <div className="flex items-center gap-1">
                                <Zap className="h-3 w-3" />
                                <span>Context: {(selectedModel.contextWindow / 1000).toFixed(0)}k tokens</span>
                              </div>
                            )}
                            {selectedModel.rpm && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>Rate: {selectedModel.rpm} RPM</span>
                              </div>
                            )}
                            <Badge variant="outline" className={cn(
                              "text-xs",
                              selectedModel.tier === "free" && "border-green-500/30 text-green-300",
                              selectedModel.tier === "paid" && "border-red-500/30 text-red-300",
                              selectedModel.tier === "both" && "border-blue-500/30 text-blue-300"
                            )}>
                              {selectedModel.tier === "free" ? "Free" : selectedModel.tier === "paid" ? "Paid" : "Free + Paid"}
                            </Badge>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>

              {/* Allowed Providers */}
              <div>
                <Label className="text-white font-medium">Allowed Providers</Label>
                <p className="text-sm text-gray-400 mb-3">Select which AI providers users can choose from</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {AI_PROVIDERS.map((provider) => (
                    <div key={provider.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={settings.allowedProviders?.includes(provider.id) || false}
                          onCheckedChange={(checked) => {
                            const currentProviders = settings.allowedProviders || [];
                            const newProviders = checked 
                              ? [...currentProviders, provider.id]
                              : currentProviders.filter(p => p !== provider.id);
                            updateSetting('allowedProviders', newProviders);
                          }}
                        />
                        <div>
                          <p className="text-white font-medium text-sm">{provider.name}</p>
                          <p className="text-gray-400 text-xs">
                            {provider.models.filter(m => m.available).length} available models
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {provider.models.filter(m => m.tier === "free").length} free
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white font-medium">Request Timeout (Seconds)</Label>
                  <Input
                    type="number"
                    min="30"
                    max="300"
                    value={settings.timeoutSeconds}
                    onChange={(e) => updateSetting('timeoutSeconds', parseInt(e.target.value))}
                    className="bg-white/10 border-white/20 text-white mt-2"
                  />
                  <p className="text-xs text-gray-400 mt-1">Maximum time to wait for AI response</p>
                </div>
                <div>
                  <Label className="text-white font-medium">Prompt Version</Label>
                  <Input
                    value={settings.promptVersion}
                    onChange={(e) => updateSetting('promptVersion', e.target.value)}
                    className="bg-white/10 border-white/20 text-white mt-2"
                    placeholder="e.g., v2.1"
                  />
                  <p className="text-xs text-gray-400 mt-1">Version identifier for prompt tracking</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Prompt */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-white font-medium">System Prompt Template</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpandedPrompt(!expandedPrompt)}
                className="bg-white/5 border-white/20 text-white hover:bg-white/10"
              >
                {expandedPrompt ? 'Collapse' : 'Expand'}
              </Button>
            </div>
            <Textarea
              value={settings.systemPrompt}
              onChange={(e) => updateSetting('systemPrompt', e.target.value)}
              className={cn(
                "bg-white/10 border-white/20 text-white resize-none",
                expandedPrompt ? "h-48" : "h-24"
              )}
              placeholder="Enter the system prompt for story generation..."
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-white/50">
                This prompt guides how AI transforms analysis results into stories
              </p>
              <Badge className="bg-blue-600/20 border-blue-500/30 text-blue-200">
                Version: {settings.promptVersion}
              </Badge>
            </div>
          </div>

          {/* Feature Access Settings */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-400" />
                Feature Access Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white font-medium">Pro Feature Only</Label>
                  <p className="text-sm text-gray-400">Require pro subscription to generate stories</p>
                </div>
                <Switch
                  checked={settings.isProFeature}
                  onCheckedChange={(checked) => updateSetting('isProFeature', checked)}
                />
              </div>
              
              {!settings.isProFeature && (
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-amber-300 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>Story generation will be available to all users (Free + Pro)</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Last Updated Info */}
          {settings.updater && (
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-white/50">
                Last updated by {settings.updater.name} ({settings.updater.email}) on{' '}
                {new Date(settings.updatedAt).toLocaleString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}