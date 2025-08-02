'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  Shield,
  RefreshCw,
  Save,
  Play,
  Loader2,
  TestTube,
} from 'lucide-react';
import { BrainIcon } from '@/components/icons/Brain';
import { ConfigIcon } from '@/components/icons/Config';
import { CPUIcon } from '@/components/icons/CPU';
import { ChatIcon } from '@/components/icons/Chat';
import { WritingIcon } from '@/components/icons/Writing';
import { StoryIcon } from '@/components/icons/Story';
import { motion, AnimatePresence } from 'framer-motion';

// Helper function to get environment variable name for each provider
function getEnvVarName(providerId: string): string {
  switch (providerId) {
    case 'google-gemini':
      return 'GOOGLE_GEMINI_API_KEY';
    case 'openai':
      return 'OPENAI_API_KEY';
    case 'anthropic':
      return 'ANTHROPIC_API_KEY';
    case 'vertex-ai':
      return 'GOOGLE_VERTEX_AI_CREDENTIALS';
    default:
      return `${providerId.toUpperCase().replace('-', '_')}_API_KEY`;
  }
}

interface AIProviderConfig {
  id: string;
  name: string;
  models: string[];
  apiKeySet: boolean;
  apiKeySource?: 'environment' | 'admin';
  adminApiKey?: string;
  isEnabled: boolean;
  priority: number;
  features: string[];
  status: 'active' | 'inactive' | 'error';
  lastTested?: string;
  errorMessage?: string;
}

interface AIFeatureConfig {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  defaultProvider: string;
  fallbackProviders: string[];
  settings: Record<string, any>;
}

interface TestResult {
  providerId: string;
  model: string;
  success: boolean;
  error: string | null;
  responseTime: number;
  response: string | null;
}

export function AIConfigPanel() {
  const [providers, setProviders] = useState<AIProviderConfig[]>([]);
  const [features, setFeatures] = useState<AIFeatureConfig[]>([]);
  const [globalConfig, setGlobalConfig] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [isTesting, setIsTesting] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/ai-config');
      if (!response.ok) throw new Error('Failed to load AI configuration');
      
      const data = await response.json();
      setProviders(data.providers || []);
      setFeatures(data.features || []);
      setGlobalConfig(data.globalConfig || {});
    } catch (error) {
      console.error('Error loading AI config:', error);
      showMessage('error', 'Failed to load AI configuration');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const saveProviderConfig = async (providerId: string, config: Partial<AIProviderConfig>) => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/admin/ai-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'provider',
          id: providerId,
          config,
        }),
      });

      if (!response.ok) throw new Error('Failed to save provider configuration');
      
      setProviders(prev => prev.map(p => 
        p.id === providerId ? { ...p, ...config } : p
      ));
      
      showMessage('success', `${config.name || providerId} configuration saved`);
    } catch (error) {
      console.error('Error saving provider config:', error);
      showMessage('error', 'Failed to save provider configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const saveFeatureConfig = async (featureId: string, config: Partial<AIFeatureConfig>) => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/admin/ai-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'feature',
          id: featureId,
          config,
        }),
      });

      if (!response.ok) throw new Error('Failed to save feature configuration');
      
      setFeatures(prev => prev.map(f => 
        f.id === featureId ? { ...f, ...config } : f
      ));
      
      showMessage('success', `${config.name || featureId} configuration saved`);
    } catch (error) {
      console.error('Error saving feature config:', error);
      showMessage('error', 'Failed to save feature configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const saveAdminApiKey = async (providerId: string, apiKey: string) => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/admin/ai-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'api_key',
          id: providerId,
          apiKey: apiKey.trim(),
        }),
      });

      if (!response.ok) throw new Error('Failed to save admin API key');
      
      // Update local state
      setProviders(prev => prev.map(provider => 
        provider.id === providerId 
          ? { 
              ...provider, 
              apiKeySet: true, 
              apiKeySource: 'admin',
              adminApiKey: apiKey.trim() 
            }
          : provider
      ));

      showMessage('success', 'Admin API key saved successfully');
      
      // Reload configuration to get updated status
      await loadConfig();
    } catch (error) {
      console.error('Error saving admin API key:', error);
      showMessage('error', 'Failed to save admin API key');
    } finally {
      setIsSaving(false);
    }
  };

  const testProvider = async (providerId: string, model?: string) => {
    try {
      setIsTesting(prev => ({ ...prev, [providerId]: true }));
      
      const response = await fetch('/api/admin/ai-config/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId, model }),
      });

      if (!response.ok) throw new Error('Failed to test provider');
      
      const data = await response.json();
      setTestResults(prev => ({ ...prev, [providerId]: data.testResult }));
      
      if (data.testResult.success) {
        showMessage('success', `${providerId} test successful`);
      } else {
        showMessage('error', `${providerId} test failed: ${data.testResult.error}`);
      }
    } catch (error) {
      console.error('Error testing provider:', error);
      showMessage('error', 'Failed to test provider');
    } finally {
      setIsTesting(prev => ({ ...prev, [providerId]: false }));
    }
  };

  const getStatusIcon = (status: string, providerId: string) => {
    const testResult = testResults[providerId];
    
    if (isLoading) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (testResult) {
      return testResult.success 
        ? <CheckCircle className="w-4 h-4 text-green-500" />
        : <XCircle className="w-4 h-4 text-red-500" />;
    }
    
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getFeatureIcon = (featureId: string) => {
    switch (featureId) {
      case 'charisma-feelings':
        return <BrainIcon className="w-5 h-5" />;
      case 'writing-assistant':
        return <WritingIcon className="w-5 h-5" />;
      case 'story-generation':
        return <StoryIcon className="w-5 h-5" />;
      case 'chat-analysis':
        return <ChatIcon className="w-5 h-5" />;
      case 'content-moderation':
        return <Shield className="w-5 h-5" />;
      default:
        return <CPUIcon className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4 text-center">Loading AI configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <BrainIcon className="w-5 h-5" />
                AI Configuration Center
              </CardTitle>
              <CardDescription className="text-white/70">
                Centralized management for all AI providers and features
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-500/20 text-purple-200 border-purple-400/30">
                <Zap className="w-3 h-3 mr-1" />
                {providers.filter(p => p.status === 'active').length} Active
              </Badge>
              <Button
                onClick={loadConfig}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert className={`${
              message.type === 'success' 
                ? 'bg-green-500/20 border-green-500/30 text-green-300' 
                : 'bg-red-500/20 border-red-500/30 text-red-300'
            } backdrop-blur-md`}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <Tabs defaultValue="providers" className="space-y-6">
        <TabsList className="bg-white/10 backdrop-blur-sm border border-white/20">
          <TabsTrigger value="providers" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
            <ConfigIcon className="w-4 h-4 mr-2" />
            Providers
          </TabsTrigger>
          <TabsTrigger value="features" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
            <CPUIcon className="w-4 h-4 mr-2" />
            Features
          </TabsTrigger>
          <TabsTrigger value="global" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
            <BrainIcon className="w-4 h-4 mr-2" />
            Global Settings
          </TabsTrigger>
        </TabsList>

        {/* Providers Tab */}
        <TabsContent value="providers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {providers.map((provider) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/[0.15] transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(provider.status, provider.id)}
                        <div>
                          <CardTitle className="text-white text-lg">{provider.name}</CardTitle>
                          <CardDescription className="text-white/60">
                            {provider.apiKeySet ? 'API Key Configured' : 'No API Key'}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={`${
                            provider.status === 'active' 
                              ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                              : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                          }`}
                        >
                          {provider.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => testProvider(provider.id)}
                          disabled={!provider.apiKeySet || isLoading || isLoading}
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          {isLoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <TestTube className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* API Key Configuration */}
                    <div className="space-y-3">
                      <Label className="text-white">API Key Configuration</Label>
                      
                      {/* Status */}
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                        {provider.apiKeySet ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 text-sm">
                              {provider.apiKeySource === 'environment' ? 'Environment Variable' : 'Admin Configured'}
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-400" />
                            <span className="text-red-400 text-sm">Not Configured</span>
                          </>
                        )}
                      </div>

                      {/* Admin API Key Input */}
                      <div className="space-y-2">
                        <Label className="text-white text-sm">Admin API Key (Override)</Label>
                        <div className="flex gap-2">
                          <Input
                            type="password"
                            placeholder="Enter admin API key to override environment..."
                            value={provider.adminApiKey || ''}
                            onChange={(e) => {
                              // Update local state
                              setProviders(prev => prev.map(p => 
                                p.id === provider.id 
                                  ? { ...p, adminApiKey: e.target.value }
                                  : p
                              ));
                            }}
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          />
                          <Button
                            size="sm"
                            onClick={() => saveAdminApiKey(provider.id, provider.adminApiKey || '')}
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-400">
                          Admin keys override environment variables for system features only
                        </p>
                      </div>

                      {!provider.apiKeySet && (
                        <div className="text-xs text-amber-300 space-y-1">
                          <p>Or set environment variable:</p>
                          <code className="bg-black/30 px-2 py-1 rounded text-xs">
                            {getEnvVarName(provider.id)}=your_api_key_here
                          </code>
                        </div>
                      )}
                    </div>

                    {/* Enable/Disable Toggle */}
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Enable Provider</Label>
                      <Switch
                        checked={provider.isEnabled}
                        onCheckedChange={(enabled) => 
                          saveProviderConfig(provider.id, { isEnabled: enabled })
                        }
                        disabled={!provider.apiKeySet || isSaving}
                      />
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                      <Label className="text-white">Priority (1 = highest)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={provider.priority}
                        onChange={(e) => {
                          const priority = parseInt(e.target.value);
                          if (!isNaN(priority)) {
                            saveProviderConfig(provider.id, { priority });
                          }
                        }}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>

                    {/* Models */}
                    <div className="space-y-2">
                      <Label className="text-white">Available Models</Label>
                      <div className="flex flex-wrap gap-1">
                        {provider.models.map((model) => (
                          <Badge 
                            key={model}
                            className="bg-blue-500/20 text-blue-200 border-blue-400/30 text-xs"
                          >
                            {model}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-2">
                      <Label className="text-white">Supported Features</Label>
                      <div className="flex flex-wrap gap-1">
                        {provider.features.map((feature) => (
                          <Badge 
                            key={feature}
                            className="bg-purple-500/20 text-purple-200 border-purple-400/30 text-xs"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Test Results */}
                    {testResults[provider.id] && (
                      <div className="space-y-2">
                        <Label className="text-white">Last Test Result</Label>
                        <div className={`p-2 rounded text-xs ${
                          testResults[provider.id].success
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          <div>Status: {testResults[provider.id].success ? 'Success' : 'Failed'}</div>
                          <div>Response Time: {testResults[provider.id].responseTime}ms</div>
                          {testResults[provider.id].error && (
                            <div>Error: {testResults[provider.id].error}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {features.map((feature) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/[0.15] transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getFeatureIcon(feature.id)}
                        <div>
                          <CardTitle className="text-white text-lg">{feature.name}</CardTitle>
                          <CardDescription className="text-white/60">
                            {feature.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge 
                        className={`${
                          feature.isEnabled 
                            ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                            : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                        }`}
                      >
                        {feature.isEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Enable/Disable Toggle */}
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Enable Feature</Label>
                      <Switch
                        checked={feature.isEnabled}
                        onCheckedChange={(enabled) => 
                          saveFeatureConfig(feature.id, { isEnabled: enabled })
                        }
                        disabled={isSaving}
                      />
                    </div>

                    {/* Default Provider */}
                    <div className="space-y-2">
                      <Label className="text-white">Default Provider</Label>
                      <Select
                        value={feature.defaultProvider}
                        onValueChange={(provider) =>
                          saveFeatureConfig(feature.id, { defaultProvider: provider })
                        }
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {providers
                            .filter(p => p.apiKeySet && p.isEnabled)
                            .map((provider) => (
                              <SelectItem key={provider.id} value={provider.id}>
                                {provider.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Fallback Providers */}
                    <div className="space-y-2">
                      <Label className="text-white">Fallback Providers</Label>
                      <div className="flex flex-wrap gap-1">
                        {feature.fallbackProviders.map((providerId) => {
                          const provider = providers.find(p => p.id === providerId);
                          return provider ? (
                            <Badge 
                              key={providerId}
                              className="bg-orange-500/20 text-orange-200 border-orange-400/30 text-xs"
                            >
                              {provider.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>

                    {/* Feature Settings */}
                    {Object.keys(feature.settings).length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-white">Settings</Label>
                        <div className="bg-black/20 rounded p-2 text-xs text-white/80 font-mono">
                          {JSON.stringify(feature.settings, null, 2)}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Global Settings Tab */}
        <TabsContent value="global" className="space-y-6">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Global AI Configuration</CardTitle>
              <CardDescription className="text-white/70">
                System-wide AI settings that apply to all features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Enable AI Services</Label>
                    <Switch
                      checked={globalConfig.enableAI}
                      onCheckedChange={(enabled) => 
                        setGlobalConfig(prev => ({ ...prev, enableAI: enabled }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Default Timeout (ms)</Label>
                    <Input
                      type="number"
                      value={globalConfig.defaultTimeout || 30000}
                      onChange={(e) => 
                        setGlobalConfig(prev => ({ 
                          ...prev, 
                          defaultTimeout: parseInt(e.target.value) || 30000 
                        }))
                      }
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Retry Attempts</Label>
                    <Input
                      type="number"
                      min="0"
                      max="5"
                      value={globalConfig.retryAttempts || 3}
                      onChange={(e) => 
                        setGlobalConfig(prev => ({ 
                          ...prev, 
                          retryAttempts: parseInt(e.target.value) || 3 
                        }))
                      }
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Enable Fallback</Label>
                    <Switch
                      checked={globalConfig.enableFallback}
                      onCheckedChange={(enabled) => 
                        setGlobalConfig(prev => ({ ...prev, enableFallback: enabled }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-white">Enable Logging</Label>
                    <Switch
                      checked={globalConfig.enableLogging}
                      onCheckedChange={(enabled) => 
                        setGlobalConfig(prev => ({ ...prev, enableLogging: enabled }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-white">Enable Rate Limiting</Label>
                    <Switch
                      checked={globalConfig.enableRateLimiting}
                      onCheckedChange={(enabled) => 
                        setGlobalConfig(prev => ({ ...prev, enableRateLimiting: enabled }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/20">
                <Button
                  onClick={() => {
                    // Save global config
                    fetch('/api/admin/ai-config', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        type: 'global',
                        id: 'global',
                        config: globalConfig,
                      }),
                    }).then(() => {
                      showMessage('success', 'Global configuration saved');
                    }).catch(() => {
                      showMessage('error', 'Failed to save global configuration');
                    });
                  }}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Global Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}