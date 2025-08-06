"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SkeletonCard } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Zap, Settings, Plus, Trash2, Save, Clock, DollarSign, Activity, RefreshCw } from "lucide-react";
import Edit from "lucide-react/dist/esm/icons/edit";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import type { 
  AIModelConfiguration, 
  ModelProvider, 
  ModelConfig,
  RateLimitConfig,
  FallbackConfig 
} from "@/lib/admin-service";

interface ModelConfigPanelProps {
  loading?: boolean;
  onRefresh?: () => void;
}

export function ModelConfigPanel({ loading, onRefresh }: ModelConfigPanelProps) {
  const [config, setConfig] = useState<AIModelConfiguration | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [editingModel, setEditingModel] = useState<ModelConfig | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch model configuration
  const fetchModelConfig = async () => {
    try {
      const response = await fetch('/api/admin/models/config');
      if (!response.ok) {
        throw new Error('Failed to fetch model configuration');
      }
      const data = await response.json();
      setConfig(data);
      if (data.providers.length > 0 && !selectedProvider) {
        setSelectedProvider(data.providers[0].id);
      }
    } catch (err) {
      console.error('Error fetching model config:', err);
      setError('Failed to load model configuration');
    }
  };

  useEffect(() => {
    fetchModelConfig();
  }, []);

  // Save model configuration
  const saveModelConfig = async (updatedConfig: Partial<AIModelConfiguration>) => {
    try {
      setSaving(true);
      setError(null);
      
      const response = await fetch('/api/admin/models/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedConfig),
      });

      if (!response.ok) {
        throw new Error('Failed to save model configuration');
      }

      await fetchModelConfig();
      setSuccess('Configuration saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving model config:', err);
      setError('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  // Toggle provider status
  const toggleProvider = async (providerId: string, enabled: boolean) => {
    if (!config) return;

    const updatedProviders = config.providers.map(provider =>
      provider.id === providerId ? { ...provider, enabled } : provider
    );

    await saveModelConfig({ providers: updatedProviders });
  };

  // Save model changes
  const saveModel = async (model: ModelConfig) => {
    if (!config || !selectedProvider) return;

    const provider = config.providers.find(p => p.id === selectedProvider);
    if (!provider) return;

    const updatedModels = editingModel
      ? provider.models.map(m => m.id === model.id ? model : m)
      : [...provider.models, model];

    const updatedProviders = config.providers.map(p =>
      p.id === selectedProvider ? { ...p, models: updatedModels } : p
    );

    await saveModelConfig({ providers: updatedProviders });
    setEditingModel(null);
    setIsDialogOpen(false);
  };

  // Delete model
  const deleteModel = async (modelId: string) => {
    if (!config || !selectedProvider) return;

    const provider = config.providers.find(p => p.id === selectedProvider);
    if (!provider) return;

    const updatedModels = provider.models.filter(m => m.id !== modelId);
    const updatedProviders = config.providers.map(p =>
      p.id === selectedProvider ? { ...p, models: updatedModels } : p
    );

    await saveModelConfig({ providers: updatedProviders });
  };

  if (loading || !config) {
    return (
      <div className="space-y-6">
        <SkeletonCard className="h-[200px]" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonCard className="h-[400px]" />
          <SkeletonCard className="h-[400px]" />
        </div>
      </div>
    );
  }

  const selectedProviderData = config.providers.find(p => p.id === selectedProvider);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">AI Model Configuration</h2>
          <p className="text-white/70">Manage AI providers and model settings</p>
        </div>
        <Button
          onClick={onRefresh}
          variant="outline"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert className="bg-red-500/20 border-red-500/30 text-white">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-500/20 border-green-500/30 text-white">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="providers" className="space-y-6">
        <TabsList className="bg-white/10 border-white/20">
          <TabsTrigger value="providers" className="data-[state=active]:bg-purple-600">
            AI Providers
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600">
            Global Settings
          </TabsTrigger>
          <TabsTrigger value="limits" className="data-[state=active]:bg-purple-600">
            Rate Limits
          </TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-6">
          {/* Provider Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {config.providers.map((provider) => (
              <Card key={provider.id} className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-white/90">{provider.name}</CardTitle>
                    <Switch
                      checked={provider.enabled}
                      onCheckedChange={(enabled) => toggleProvider(provider.id, enabled)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/60">Models</span>
                      <span className="text-white">{provider.models.length}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-white/60">Active</span>
                      <span className="text-white">
                        {provider.models.filter(m => m.enabled).length}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-white/60">Timeout</span>
                      <span className="text-white">{provider.timeout / 1000}s</span>
                    </div>
                    <Badge 
                      className={`w-full justify-center ${
                        provider.enabled 
                          ? 'bg-green-500/20 text-green-300 border-green-500/30'
                          : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                      }`}
                    >
                      {provider.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Provider Selection and Model Management */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Provider Selection */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Select Provider
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {config.providers.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedProviderData && (
                  <div className="mt-4 space-y-3">
                    <div className="space-y-2">
                      <Label className="text-white/90">Provider Status</Label>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={selectedProviderData.enabled}
                          onCheckedChange={(enabled) => toggleProvider(selectedProvider, enabled)}
                        />
                        <span className="text-white/70">
                          {selectedProviderData.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/90">Timeout (ms)</Label>
                      <Input
                        type="number"
                        value={selectedProviderData.timeout}
                        onChange={(e) => {
                          const updatedProviders = config.providers.map(p =>
                            p.id === selectedProvider 
                              ? { ...p, timeout: parseInt(e.target.value) }
                              : p
                          );
                          saveModelConfig({ providers: updatedProviders });
                        }}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Model List */}
            <Card className="lg:col-span-2 bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Models
                    {selectedProviderData && (
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                        {selectedProviderData.name}
                      </Badge>
                    )}
                  </CardTitle>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        onClick={() => setEditingModel(null)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Model
                      </Button>
                    </DialogTrigger>
                    <ModelDialog
                      model={editingModel}
                      onSave={saveModel}
                      onCancel={() => {
                        setEditingModel(null);
                        setIsDialogOpen(false);
                      }}
                    />
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {selectedProviderData ? (
                  <div className="space-y-3">
                    {selectedProviderData.models.map((model) => (
                      <div
                        key={model.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="font-medium text-white">{model.name}</h4>
                            <Badge 
                              className={`${
                                model.enabled 
                                  ? 'bg-green-500/20 text-green-300 border-green-500/30'
                                  : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                              }`}
                            >
                              {model.enabled ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-white/60">
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              ${model.costPerToken.toFixed(6)}/token
                            </span>
                            <span className="flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              {model.maxTokens.toLocaleString()} max tokens
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {model.timeout / 1000}s timeout
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={model.enabled}
                            onCheckedChange={(enabled) => {
                              const updatedModel = { ...model, enabled };
                              saveModel(updatedModel);
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white/60 hover:text-white hover:bg-white/10"
                            onClick={() => {
                              setEditingModel(model);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={() => deleteModel(model.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {selectedProviderData.models.length === 0 && (
                      <div className="text-center py-8 text-white/60">
                        No models configured for this provider
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-white/60">
                    Select a provider to manage models
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Default Settings */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Default Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white/90">Default Provider</Label>
                  <Select 
                    value={config.defaultProvider} 
                    onValueChange={(value) => saveModelConfig({ defaultProvider: value })}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {config.providers.filter(p => p.enabled).map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white/90">Default Model</Label>
                  <Select 
                    value={config.defaultModel} 
                    onValueChange={(value) => saveModelConfig({ defaultModel: value })}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {config.providers
                        .find(p => p.id === config.defaultProvider)
                        ?.models.filter(m => m.enabled)
                        .map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Fallback Configuration */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Fallback Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-white/90">Enable Fallback</Label>
                  <Switch
                    checked={config.fallbackOptions.enabled}
                    onCheckedChange={(enabled) => 
                      saveModelConfig({ 
                        fallbackOptions: { ...config.fallbackOptions, enabled }
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/90">Max Retries</Label>
                  <Input
                    type="number"
                    value={config.fallbackOptions.maxRetries}
                    onChange={(e) => 
                      saveModelConfig({ 
                        fallbackOptions: { 
                          ...config.fallbackOptions, 
                          maxRetries: parseInt(e.target.value) 
                        }
                      })
                    }
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/90">Retry Delay (ms)</Label>
                  <Input
                    type="number"
                    value={config.fallbackOptions.retryDelay}
                    onChange={(e) => 
                      saveModelConfig({ 
                        fallbackOptions: { 
                          ...config.fallbackOptions, 
                          retryDelay: parseInt(e.target.value) 
                        }
                      })
                    }
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="limits" className="space-y-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Rate Limiting Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white/90">Requests per Minute</Label>
                    <Input
                      type="number"
                      value={config.rateLimits.requestsPerMinute}
                      onChange={(e) => 
                        saveModelConfig({ 
                          rateLimits: { 
                            ...config.rateLimits, 
                            requestsPerMinute: parseInt(e.target.value) 
                          }
                        })
                      }
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/90">Requests per Hour</Label>
                    <Input
                      type="number"
                      value={config.rateLimits.requestsPerHour}
                      onChange={(e) => 
                        saveModelConfig({ 
                          rateLimits: { 
                            ...config.rateLimits, 
                            requestsPerHour: parseInt(e.target.value) 
                          }
                        })
                      }
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white/90">Requests per Day</Label>
                    <Input
                      type="number"
                      value={config.rateLimits.requestsPerDay}
                      onChange={(e) => 
                        saveModelConfig({ 
                          rateLimits: { 
                            ...config.rateLimits, 
                            requestsPerDay: parseInt(e.target.value) 
                          }
                        })
                      }
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/90">Concurrent Requests</Label>
                    <Input
                      type="number"
                      value={config.rateLimits.concurrentRequests}
                      onChange={(e) => 
                        saveModelConfig({ 
                          rateLimits: { 
                            ...config.rateLimits, 
                            concurrentRequests: parseInt(e.target.value) 
                          }
                        })
                      }
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Model Dialog Component
function ModelDialog({ 
  model, 
  onSave, 
  onCancel 
}: { 
  model: ModelConfig | null; 
  onSave: (model: ModelConfig) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState<ModelConfig>(
    model || {
      id: '',
      name: '',
      enabled: true,
      costPerToken: 0,
      maxTokens: 4096,
      timeout: 30000,
      parameters: { temperature: 0.7, top_p: 1 }
    }
  );

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <DialogContent className="bg-gray-900 border-white/20 text-white">
      <DialogHeader>
        <DialogTitle>{model ? 'Edit Model' : 'Add New Model'}</DialogTitle>
        <DialogDescription className="text-white/70">
          Configure the AI model settings and parameters.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Model ID</Label>
            <Input
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              className="bg-white/10 border-white/20 text-white"
              placeholder="gpt-4"
            />
          </div>
          <div className="space-y-2">
            <Label>Model Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-white/10 border-white/20 text-white"
              placeholder="GPT-4"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Cost per Token</Label>
            <Input
              type="number"
              step="0.000001"
              value={formData.costPerToken}
              onChange={(e) => setFormData({ ...formData, costPerToken: parseFloat(e.target.value) })}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label>Max Tokens</Label>
            <Input
              type="number"
              value={formData.maxTokens}
              onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Timeout (ms)</Label>
          <Input
            type="number"
            value={formData.timeout}
            onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) })}
            className="bg-white/10 border-white/20 text-white"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.enabled}
            onCheckedChange={(enabled) => setFormData({ ...formData, enabled })}
          />
          <Label>Enable this model</Label>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Model
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}