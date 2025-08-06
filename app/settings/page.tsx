"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { UnifiedLayout } from "@/components/layout/UnifiedLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Key, Eye, EyeOff, ExternalLink, Check, X, FileText, Settings, Sparkles, Copy, Search, Bell, Globe, Shield, Palette, Database, RefreshCw, Download, Upload, Trash2, Save, CreditCard, Crown, Zap } from "lucide-react";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import { motion } from "framer-motion";
import Link from "next/link";
import { themeConfig } from "@/lib/theme-config";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  AI_PROVIDERS,
  getProviderConfig,
  getStaticModelInfo,
  getStaticModelsByProvider,
  type AIProvider,
} from "@/lib/ai-providers-client";
import { LanguageSwitcher } from "@/components/EnhancedLanguageProvider";
import { SubscriptionCard } from "@/components/subscription/SubscriptionCard";

import {
  getApiKey,
  setApiKey,
  clearApiKey,
  getSelectedModel,
  setSelectedModel,
  getSelectedAnalysisTemplate,
  setSelectedAnalysisTemplate,
  getSettings,
  saveNotificationSettings,
  savePreferences,
} from "@/lib/settings";
import {
  getTemplatesForUser,
  getBuiltInTemplates,
} from "@/app/actions/templates";
import type { AnalysisTemplate } from "@/lib/analysis-templates";
import TemplateManager from "@/components/TemplateManager";
import { fetchVertexAiModelsServer } from "@/app/actions/vertexModels";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [selectedProvider, setSelectedProvider] = useState<string>("google");
  const [selectedModelId, setSelectedModelId] =
    useState<string>("gemini-1.5-pro");
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    "communication-analysis",
  );
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"ai" | "templates" | "language" | "notifications" | "preferences" | "subscription">(
    "ai",
  );
  const [templates, setTemplates] = useState<AnalysisTemplate[]>([]);
  const [providerModels, setProviderModels] = useState<Record<string, any[]>>(
    {},
  );
  const [modelsLoading, setModelsLoading] = useState<Record<string, boolean>>(
    {},
  );
  const [modelDescriptions, setModelDescriptions] = useState<
    Record<string, string>
  >({});

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    newsletter: true,
    updates: true,
    security: true
  });
  const [preferences, setPreferences] = useState({
    theme: 'dark',
    language: 'en',
    timezone: 'UTC',
    autoSave: true,
    compactMode: false
  });
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  // Subscription state
  const [subscription, setSubscription] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load model selection
        const selection = await getSelectedModel();
        setSelectedProvider(selection.provider);
        setSelectedModelId(selection.modelId);

        // Load selected analysis template
        const template = await getSelectedAnalysisTemplate();
        setSelectedTemplate(template);

        // Load API keys
        const keys: Record<string, string> = {};
        for (const provider of AI_PROVIDERS) {
          const key = await getApiKey(provider.apiKeyName);
          if (key) {
            keys[provider.apiKeyName] = key;
          }
        }
        setApiKeys(keys);

        // Load full settings for notifications and preferences
        const settings = await getSettings();
        if (settings.notifications) {
          setNotifications(settings.notifications);
        }
        if (settings.preferences) {
          setPreferences(settings.preferences);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Load subscription data when user is authenticated
  useEffect(() => {
    const loadSubscription = async () => {
      if (session?.user?.id) {
        try {
          setSubscriptionLoading(true);
          const response = await fetch('/api/subscription');
          const data = await response.json();
          
          if (data.success) {
            setSubscription(data.subscription);
          }
        } catch (error) {
          console.error('Failed to load subscription:', error);
        } finally {
          setSubscriptionLoading(false);
        }
      }
    };

    loadSubscription();
  }, [session?.user?.id]);

  // Load templates when user is authenticated
  useEffect(() => {
    const loadTemplates = async () => {
      if (session?.user?.id) {
        try {
          const result = await getTemplatesForUser();
          if (result.success && result.data) {
            setTemplates(result.data);
          }
        } catch (error) {
          console.error("Failed to load templates:", error);
        }
      } else {
        // Load built-in templates for non-authenticated users
        try {
          const result = await getBuiltInTemplates();
          if (result.success && result.data) {
            setTemplates(result.data);
          }
        } catch (error) {
          console.error("Failed to load built-in templates:", error);
        }
      }
    };

    loadTemplates();
  }, [session?.user?.id]); // Only depend on session, not selectedTemplate

  // Load models for all providers on mount
  useEffect(() => {
    AI_PROVIDERS.forEach(async (provider) => {
      setModelsLoading((prev) => ({ ...prev, [provider.id]: true }));
      let models: any[] = [];
      if (provider.id === "google-vertex-ai") {
        models = await fetchVertexAiModelsServer();
      } else {
        models = provider.models.filter((m) => m.available);
      }
      setProviderModels((prev) => ({ ...prev, [provider.id]: models }));
      setModelsLoading((prev) => ({ ...prev, [provider.id]: false }));
    });
  }, []);

  // Update model description when selectedModelId changes
  useEffect(() => {
    let cancelled = false;
    async function fetchDescription() {
      if (selectedModelId) {
        const model = getStaticModelInfo(selectedModelId);
        if (!cancelled && model) {
          setModelDescriptions((prev) => ({
            ...prev,
            [selectedModelId]: model.description,
          }));
        }
      }
    }
    fetchDescription();
    return () => {
      cancelled = true;
    };
  }, [selectedModelId]);

  const handleApiKeyChange = (keyName: string, value: string) => {
    setApiKeys((prev) => ({ ...prev, [keyName]: value }));
  };

  const handleSaveApiKey = async (keyName: string) => {
    const value = apiKeys[keyName];
    if (value && value.trim()) {
      setAutoSaveStatus('saving');
      try {
        await setApiKey(keyName, value.trim());
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      } catch (error) {
        console.error('Failed to save API key:', error);
        setAutoSaveStatus('idle');
      }
    }
  };

  const handleClearApiKey = async (keyName: string) => {
    setAutoSaveStatus('saving');
    try {
      await clearApiKey(keyName);
      setApiKeys((prev) => ({ ...prev, [keyName]: "" }));
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to clear API key:', error);
      setAutoSaveStatus('idle');
    }
  };

  const handleModelChange = async (modelId: string) => {
    const modelInfo = getStaticModelInfo(modelId);
    if (modelInfo) {
      setSelectedModelId(modelId);
      setSelectedProvider(modelInfo.provider);
      setAutoSaveStatus('saving');
      try {
        await setSelectedModel(modelInfo.provider, modelId);
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      } catch (error) {
        console.error('Failed to save model selection:', error);
        setAutoSaveStatus('idle');
      }
    }
  };

  const handleTemplateChange = async (templateId: string) => {
    setSelectedTemplate(templateId);
    setAutoSaveStatus('saving');
    try {
      await setSelectedAnalysisTemplate(templateId);
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save template selection:', error);
      setAutoSaveStatus('idle');
    }
  };

  const handleTemplateManagerChange = () => {
    // Refresh template list when templates are modified
    // This will be handled by the useEffect that depends on session
  };

  const handleNotificationChange = async (key: string, value: boolean) => {
    const updatedNotifications = { ...notifications, [key]: value };
    setNotifications(updatedNotifications);
    setAutoSaveStatus('saving');
    try {
      await saveNotificationSettings(updatedNotifications);
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      setAutoSaveStatus('idle');
    }
  };

  const handlePreferenceChange = async (key: string, value: any) => {
    const updatedPreferences = { ...preferences, [key]: value };
    setPreferences(updatedPreferences);
    setAutoSaveStatus('saving');
    try {
      await savePreferences(updatedPreferences);
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setAutoSaveStatus('idle');
    }
  };

  // Subscription handlers
  const handleUpgrade = async () => {
    try {
      window.open('/api/subscription/upgrade', '_blank');
    } catch (error) {
      console.error('Failed to redirect to upgrade:', error);
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await fetch('/api/subscription/billing-portal', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success && data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Failed to access billing portal:', error);
    }
  };

  const handleCancelSubscription = async () => {
    if (confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      try {
        const response = await fetch('/api/subscription', {
          method: 'DELETE',
        });
        const data = await response.json();
        
        if (data.success) {
          setSubscription(data.subscription);
        }
      } catch (error) {
        console.error('Failed to cancel subscription:', error);
      }
    }
  };

  const currentProvider = getProviderConfig(selectedProvider as AIProvider);

  return (
    <UnifiedLayout variant="default">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-white"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <Badge className={cn("mb-4 bg-white/10 text-white border-white/20")}>
              <Settings className="w-4 h-4 mr-2" />
              Configuration
            </Badge>
            <h1 className={cn("text-3xl font-bold mb-2", themeConfig.typography.gradient)}>
              Settings
            </h1>
            <p className="text-gray-300">
              Manage your AI providers, models, and analysis templates
            </p>
            {saved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="mt-4"
              >
                <Badge className={cn("gap-2", "bg-green-500/20 border-green-500/30 text-green-300")}>
                  <Check className="h-3 w-3" />
                  Saved Successfully
                </Badge>
              </motion.div>
            )}
          </div>



          {/* Auto-save Status */}
          {autoSaveStatus !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 text-center"
            >
              <Badge className={cn(
                "gap-2",
                autoSaveStatus === 'saving'
                  ? "bg-blue-500/20 border-blue-500/30 text-blue-300"
                  : "bg-green-500/20 border-green-500/30 text-green-300"
              )}>
                {autoSaveStatus === 'saving' ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Auto-saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    Auto-saved
                  </>
                )}
              </Badge>
            </motion.div>
          )}

          {/* Settings Categories - Smaller Blog Style Navigation */}
          <div className="mb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 max-w-4xl mx-auto">
              <button
                onClick={() => setActiveTab("ai")}
                className={cn(
                  "group relative overflow-hidden",
                  "bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20",
                  "hover:border-white/30 transition-all duration-300",
                  "hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10",
                  activeTab === "ai" && "border-purple-500/50 bg-purple-500/10"
                )}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    "bg-gradient-to-r from-purple-600 to-blue-600",
                    "group-hover:scale-110 transition-transform duration-300"
                  )}>
                    <Key className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-sm group-hover:text-purple-300 transition-colors">
                      AI Config
                    </h3>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Models & Keys
                    </p>
                  </div>
                  <div
                    className="w-2 h-2 rounded-full bg-purple-500"
                  ></div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("templates")}
                className={cn(
                  "group relative overflow-hidden",
                  "bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20",
                  "hover:border-white/30 transition-all duration-300",
                  "hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10",
                  activeTab === "templates" && "border-blue-500/50 bg-blue-500/10"
                )}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    "bg-gradient-to-r from-blue-600 to-cyan-600",
                    "group-hover:scale-110 transition-transform duration-300"
                  )}>
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-sm group-hover:text-blue-300 transition-colors">
                      Templates
                    </h3>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Analysis Types
                    </p>
                  </div>
                  <div
                    className="w-2 h-2 rounded-full bg-blue-500"
                  ></div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("language")}
                className={cn(
                  "group relative overflow-hidden",
                  "bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20",
                  "hover:border-white/30 transition-all duration-300",
                  "hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/10",
                  activeTab === "language" && "border-green-500/50 bg-green-500/10"
                )}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    "bg-gradient-to-r from-green-600 to-emerald-600",
                    "group-hover:scale-110 transition-transform duration-300"
                  )}>
                    <Globe className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-sm group-hover:text-green-300 transition-colors">
                      Language
                    </h3>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Localization
                    </p>
                  </div>
                  <div
                    className="w-2 h-2 rounded-full bg-green-500"
                  ></div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("notifications")}
                className={cn(
                  "group relative overflow-hidden",
                  "bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20",
                  "hover:border-white/30 transition-all duration-300",
                  "hover:scale-[1.02] hover:shadow-lg hover:shadow-yellow-500/10",
                  activeTab === "notifications" && "border-yellow-500/50 bg-yellow-500/10"
                )}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    "bg-gradient-to-r from-yellow-600 to-orange-600",
                    "group-hover:scale-110 transition-transform duration-300"
                  )}>
                    <Bell className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-sm group-hover:text-yellow-300 transition-colors">
                      Notifications
                    </h3>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Alerts & Updates
                    </p>
                  </div>
                  <div
                    className="w-2 h-2 rounded-full bg-yellow-500"
                  ></div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("preferences")}
                className={cn(
                  "group relative overflow-hidden",
                  "bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20",
                  "hover:border-white/30 transition-all duration-300",
                  "hover:scale-[1.02] hover:shadow-lg hover:shadow-pink-500/10",
                  activeTab === "preferences" && "border-pink-500/50 bg-pink-500/10"
                )}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    "bg-gradient-to-r from-pink-600 to-rose-600",
                    "group-hover:scale-110 transition-transform duration-300"
                  )}>
                    <Palette className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-sm group-hover:text-pink-300 transition-colors">
                      Preferences
                    </h3>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Theme & UI
                    </p>
                  </div>
                  <div
                    className="w-2 h-2 rounded-full bg-pink-500"
                  ></div>
                </div>
              </button>

              {session?.user && (
                <button
                  onClick={() => setActiveTab("subscription")}
                  className={cn(
                    "group relative overflow-hidden",
                    "bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20",
                    "hover:border-white/30 transition-all duration-300",
                    "hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/10",
                    activeTab === "subscription" && "border-amber-500/50 bg-amber-500/10"
                  )}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      "bg-gradient-to-r from-amber-600 to-yellow-600",
                      "group-hover:scale-110 transition-transform duration-300"
                    )}>
                      <Crown className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-sm group-hover:text-amber-300 transition-colors">
                        Subscription
                      </h3>
                      <p className="text-gray-400 text-xs mt-0.5">
                        Plan & Billing
                      </p>
                    </div>
                    <div
                      className="w-2 h-2 rounded-full bg-amber-500"
                    ></div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Settings Content */}
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "ai" | "templates" | "language" | "notifications" | "preferences" | "subscription")
            }
            className="space-y-8"
          >

            <TabsContent value="ai" className="space-y-6">
              {/* Analysis Template Selection */}
              <Card className={cn(
                themeConfig.colors.glass.background,
                themeConfig.colors.glass.border,
                themeConfig.colors.glass.shadow,
                "border"
              )}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <FileText className="h-5 w-5" />
                    Analysis Template
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Choose the type of analysis you want to perform on your
                    conversations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="template-select" className="text-white">Analysis Type</Label>
                      <Select
                        value={selectedTemplate}
                        onValueChange={handleTemplateChange}
                      >
                        <SelectTrigger id="template-select" className={cn(
                          "mt-2",
                          "bg-white/10 border-white/20 text-white",
                          "focus:bg-white/20 focus:border-purple-400",
                          themeConfig.animation.transition
                        )}>
                          <SelectValue
                            placeholder="Select an analysis template"
                            className="text-white placeholder:text-gray-400"
                          />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-white/20 text-white">
                          {[
                            "general",
                            "personal",
                            "business",
                            "clinical",
                            "custom",
                          ].map((category) => {
                            const categoryTemplates = templates.filter(
                              (template) => template.category === category,
                            );
                            if (categoryTemplates.length === 0) return null;

                            return (
                              <div key={category}>
                                <div className="px-2 py-1.5 text-sm font-semibold text-gray-400 capitalize">
                                  {category} Analysis
                                </div>
                                {categoryTemplates.map((template) => (
                                  <SelectItem
                                    key={template.id}
                                    value={template.id}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span>{template.icon}</span>
                                      <div>
                                        <div className="font-medium">
                                          {template.name}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                          {template.description}
                                        </div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </div>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    {selectedTemplate && (
                      <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-200">
                        <Sparkles className="h-4 w-4" />
                        <AlertDescription>
                          {
                            templates.find((t) => t.id === selectedTemplate)
                              ?.description
                          }
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Model Selection */}
              <Card className={cn(
                themeConfig.colors.glass.background,
                themeConfig.colors.glass.border,
                themeConfig.colors.glass.shadow,
                "border"
              )}>
                <CardHeader>
                  <CardTitle className="text-white">AI Model Selection</CardTitle>
                  <CardDescription className="text-gray-300">
                    Choose your preferred AI model for conversation analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="model-select" className="text-white">Active Model</Label>
                      <Select
                        value={selectedModelId}
                        onValueChange={handleModelChange}
                      >
                        <SelectTrigger id="model-select" className={cn(
                          "mt-2",
                          "bg-white/10 border-white/20 text-white",
                          "focus:bg-white/20 focus:border-purple-400",
                          themeConfig.animation.transition
                        )}>
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-white/20 text-white">
                          {AI_PROVIDERS.map((provider) => {
                            const availableProviderModels =
                              providerModels[provider.id] || [];
                            if (modelsLoading[provider.id]) {
                              return (
                                <div
                                  key={provider.id}
                                  className="px-2 py-1.5 text-sm text-gray-400"
                                >
                                  Loading models...
                                </div>
                              );
                            }
                            if (availableProviderModels.length === 0) return null;
                            return (
                              <div key={provider.id}>
                                <div className="px-2 py-1.5 text-sm font-semibold text-gray-400">
                                  {provider.name}
                                </div>
                                {availableProviderModels.map((model) => (
                                  <SelectItem key={model.id} value={model.id}>
                                    <div className="flex items-center justify-between w-full">
                                      <div className="flex items-center gap-2">
                                        <span>{model.name}</span>
                                        {model.tier === "free" && (
                                          <Badge
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            Free
                                          </Badge>
                                        )}
                                        {model.tier === "both" && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            Free + Paid
                                          </Badge>
                                        )}
                                      </div>
                                      <span className="text-xs text-gray-400 ml-2">
                                        {model.contextWindow &&
                                          `${(model.contextWindow / 1000).toFixed(0)}k context`}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </div>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    {currentProvider && (
                      <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-200">
                        <AlertDescription>
                          {modelDescriptions[selectedModelId] || ""}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* API Keys Management */}
              <Card className={cn(
                themeConfig.colors.glass.background,
                themeConfig.colors.glass.border,
                themeConfig.colors.glass.shadow,
                "border"
              )}>
                <CardHeader>
                  <CardTitle className="text-white">API Keys</CardTitle>
                  <CardDescription className="text-gray-300">
                    Configure your API keys for different AI providers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Provider Selection */}
                  <div className="mb-6">
                    <Label className="text-white">Select Provider</Label>
                    <Select
                      value={selectedProvider}
                      onValueChange={setSelectedProvider}
                    >
                      <SelectTrigger className="mt-2 bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-white/20 text-white">
                        {AI_PROVIDERS.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* API Key Configuration for Selected Provider */}
                  {AI_PROVIDERS.map((provider) =>
                    provider.id === selectedProvider && (
                      <div key={provider.id} className="space-y-4">
                        {provider.id === "google-vertex-ai" ? (
                          <div className="space-y-2">
                            <Label htmlFor="vertex-ai-key" className="text-white">
                              Vertex AI API Key
                            </Label>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <Input
                                  id="vertex-ai-key"
                                  type={
                                    showKeys[provider.apiKeyName]
                                      ? "text"
                                      : "password"
                                  }
                                  placeholder="Paste your Vertex AI API key here"
                                  value={apiKeys[provider.apiKeyName] || ""}
                                  onChange={(e) =>
                                    handleApiKeyChange(
                                      provider.apiKeyName,
                                      e.target.value,
                                    )
                                  }
                                  className={cn(
                                    "bg-white/10 border-white/20 text-white placeholder:text-gray-400",
                                    "focus:bg-white/20 focus:border-purple-400",
                                    themeConfig.animation.transition
                                  )}
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-0 top-0 h-full px-3"
                                  onClick={() =>
                                    setShowKeys((prev) => ({
                                      ...prev,
                                      [provider.apiKeyName]:
                                        !prev[provider.apiKeyName],
                                    }))
                                  }
                                >
                                  {showKeys[provider.apiKeyName] ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                              <Button
                                onClick={() =>
                                  handleSaveApiKey(provider.apiKeyName)
                                }
                                disabled={!apiKeys[provider.apiKeyName]}
                                className={cn(
                                  "bg-purple-600 hover:bg-purple-700",
                                  "text-white",
                                  themeConfig.animation.transition
                                )}
                              >
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() =>
                                  handleClearApiKey(provider.apiKeyName)
                                }
                                disabled={!apiKeys[provider.apiKeyName]}
                                className={cn(
                                  "border-white/20 text-white hover:bg-white/10",
                                  themeConfig.animation.transition
                                )}
                              >
                                Clear
                              </Button>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Get your Vertex AI API key from{" "}
                              <a
                                href="https://makersuite.google.com/app/apikey"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-400 hover:text-purple-300 underline"
                              >
                                Google AI Studio
                              </a>
                              .
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Label htmlFor={`${provider.id}-key`} className="text-white">API Key</Label>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <Input
                                  id={`${provider.id}-key`}
                                  type={
                                    showKeys[provider.apiKeyName]
                                      ? "text"
                                      : "password"
                                  }
                                  placeholder={provider.apiKeyPlaceholder}
                                  value={apiKeys[provider.apiKeyName] || ""}
                                  onChange={(e) =>
                                    handleApiKeyChange(
                                      provider.apiKeyName,
                                      e.target.value,
                                    )
                                  }
                                  className={cn(
                                    "bg-white/10 border-white/20 text-white placeholder:text-gray-400",
                                    "focus:bg-white/20 focus:border-purple-400",
                                    themeConfig.animation.transition
                                  )}
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-0 top-0 h-full px-3"
                                  onClick={() =>
                                    setShowKeys((prev) => ({
                                      ...prev,
                                      [provider.apiKeyName]:
                                        !prev[provider.apiKeyName],
                                    }))
                                  }
                                >
                                  {showKeys[provider.apiKeyName] ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                              <Button
                                onClick={() =>
                                  handleSaveApiKey(provider.apiKeyName)
                                }
                                disabled={!apiKeys[provider.apiKeyName]?.trim()}
                                className={cn(
                                  "bg-purple-600 hover:bg-purple-700",
                                  "text-white",
                                  themeConfig.animation.transition
                                )}
                              >
                                Save
                              </Button>
                              <Button
                                onClick={() =>
                                  handleClearApiKey(provider.apiKeyName)
                                }
                                variant="outline"
                                disabled={!apiKeys[provider.apiKeyName]?.trim()}
                                className={cn(
                                  "border-red-400/20 text-red-400 hover:bg-red-500/10",
                                  themeConfig.animation.transition
                                )}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}

                        <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-200">
                          <Key className="h-4 w-4" />
                          <AlertDescription>
                            <div className="space-y-2">
                              <p>
                                Get your API key from{" "}
                                <a
                                  href={provider.getApiKeyUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-400 hover:text-purple-300 underline inline-flex items-center gap-1"
                                >
                                  {provider.name} Console
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </p>
                              <div className="text-xs space-y-1">
                                {provider.models
                                  .filter((m) => m.available)
                                  .map((model) => (
                                    <div
                                      key={model.id}
                                      className="flex justify-between"
                                    >
                                      <span>{model.name}</span>
                                      <div className="flex gap-2">
                                        {model.tier === "free" && (
                                          <Badge
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            Free
                                          </Badge>
                                        )}
                                        {model.tier === "both" && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            Free + Paid
                                          </Badge>
                                        )}
                                        {model.tier === "paid" && (
                                          <Badge
                                            variant="destructive"
                                            className="text-xs"
                                          >
                                            Paid Only
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </AlertDescription>
                        </Alert>
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="templates">
              <TemplateManager onTemplateChange={handleTemplateManagerChange} />
            </TabsContent>

            <TabsContent value="language" className="space-y-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                  <Globe className="h-6 w-6 text-purple-400" />
                  Language & Localization
                </h2>
                <p className="text-gray-300">
                  Choose your preferred language and configure RTL support for Arabic
                </p>
              </div>

              {/* Language Switcher */}
              <Card className={cn(
                themeConfig.colors.glass.background,
                themeConfig.colors.glass.border,
                themeConfig.colors.glass.shadow,
                "border"
              )}>
                <CardHeader>
                  <CardTitle className="text-white">Language Selection</CardTitle>
                  <CardDescription className="text-gray-300">
                    Select your preferred language for the interface
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <LanguageSwitcher />
                  </div>
                </CardContent>
              </Card>

              {/* Supported Languages */}
              <Card className={cn(
                themeConfig.colors.glass.background,
                themeConfig.colors.glass.border,
                themeConfig.colors.glass.shadow,
                "border"
              )}>
                <CardHeader>
                  <CardTitle className="text-white">Supported Languages</CardTitle>
                  <CardDescription className="text-gray-300">
                    Available languages and their features
                  </CardDescription>
                </CardHeader>
                <CardContent>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-white text-center">
                        Supported Languages
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        <div className={cn(
                          "p-6 rounded-xl",
                          "bg-white/10 border border-white/20",
                          "hover:bg-white/15 transition-all duration-300",
                          themeConfig.animation.transition
                        )}>
                          <div className="flex items-center gap-4">
                            <span className="text-3xl">🇺🇸</span>
                            <div>
                              <div className="font-semibold text-white text-lg">English</div>
                              <div className="text-sm text-gray-300">
                                Full feature support
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className={cn(
                          "p-6 rounded-xl",
                          "bg-white/10 border border-white/20",
                          "hover:bg-white/15 transition-all duration-300",
                          themeConfig.animation.transition
                        )}>
                          <div className="flex items-center gap-4">
                            <span className="text-3xl">🇸🇦</span>
                            <div>
                              <div className="font-semibold text-white text-lg">العربية (Arabic)</div>
                              <div className="text-sm text-gray-300">
                                RTL layout with full support
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-white text-center">Features</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5">
                          <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                          <span className="text-sm text-white">
                            Automatic language detection from analysis results
                          </span>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5">
                          <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                          <span className="text-sm text-white">
                            Right-to-left (RTL) layout for Arabic
                          </span>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5">
                          <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                          <span className="text-sm text-white">
                            Professional psychological and business terminology
                          </span>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5">
                          <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                          <span className="text-sm text-white">
                            Cultural adaptation for Arabic-speaking users
                          </span>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 md:col-span-2">
                          <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                          <span className="text-sm text-white">
                            Language preference persistence across sessions
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card className={cn(
                themeConfig.colors.glass.background,
                themeConfig.colors.glass.border,
                themeConfig.colors.glass.shadow,
                "border"
              )}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Bell className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Choose how you want to be notified about important updates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Email Notifications */}
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Email Notifications</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-white">Analysis Complete</Label>
                          <p className="text-sm text-gray-400">Get notified when your analysis is ready</p>
                        </div>
                        <Switch
                          checked={notifications.email}
                          onCheckedChange={(checked) =>
                            handleNotificationChange('email', checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-white">Newsletter</Label>
                          <p className="text-sm text-gray-400">Weekly insights and product updates</p>
                        </div>
                        <Switch
                          checked={notifications.newsletter}
                          onCheckedChange={(checked) =>
                            handleNotificationChange('newsletter', checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-white">Product Updates</Label>
                          <p className="text-sm text-gray-400">New features and improvements</p>
                        </div>
                        <Switch
                          checked={notifications.updates}
                          onCheckedChange={(checked) =>
                            handleNotificationChange('updates', checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-white">Security Alerts</Label>
                          <p className="text-sm text-gray-400">Important security notifications</p>
                        </div>
                        <Switch
                          checked={notifications.security}
                          onCheckedChange={(checked) =>
                            handleNotificationChange('security', checked)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-white/10" />

                  {/* Push Notifications */}
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Push Notifications</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-white">Browser Notifications</Label>
                          <p className="text-sm text-gray-400">Real-time notifications in your browser</p>
                        </div>
                        <Switch
                          checked={notifications.push}
                          onCheckedChange={(checked) =>
                            handleNotificationChange('push', checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-white">SMS Notifications</Label>
                          <p className="text-sm text-gray-400">Critical alerts via SMS</p>
                        </div>
                        <Switch
                          checked={notifications.sms}
                          onCheckedChange={(checked) =>
                            handleNotificationChange('sms', checked)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={() => {
                        setAutoSaveStatus('saving');
                        setTimeout(() => {
                          setAutoSaveStatus('saved');
                          setTimeout(() => setAutoSaveStatus('idle'), 2000);
                        }, 1000);
                      }}
                      className={cn(
                        "bg-purple-600 hover:bg-purple-700",
                        "text-white",
                        themeConfig.animation.transition
                      )}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Notification Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              <Card className={cn(
                themeConfig.colors.glass.background,
                themeConfig.colors.glass.border,
                themeConfig.colors.glass.shadow,
                "border"
              )}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Palette className="h-5 w-5" />
                    General Preferences
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Customize your experience and interface settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Theme Settings */}
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Appearance</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-white">Dark Theme</Label>
                          <p className="text-sm text-gray-400">Use dark mode interface</p>
                        </div>
                        <Switch
                          checked={preferences.theme === 'dark'}
                          onCheckedChange={(checked) =>
                            handlePreferenceChange('theme', checked ? 'dark' : 'light')
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-white">Compact Mode</Label>
                          <p className="text-sm text-gray-400">Reduce spacing for more content</p>
                        </div>
                        <Switch
                          checked={preferences.compactMode}
                          onCheckedChange={(checked) =>
                            handlePreferenceChange('compactMode', checked)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-white/10" />

                  {/* Behavior Settings */}
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Behavior</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-white">Auto-save</Label>
                          <p className="text-sm text-gray-400">Automatically save changes</p>
                        </div>
                        <Switch
                          checked={preferences.autoSave}
                          onCheckedChange={(checked) =>
                            handlePreferenceChange('autoSave', checked)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <Button
                      onClick={() => {
                        setAutoSaveStatus('saving');
                        setTimeout(() => {
                          setAutoSaveStatus('saved');
                          setTimeout(() => setAutoSaveStatus('idle'), 2000);
                        }, 1000);
                      }}
                      className={cn(
                        "bg-purple-600 hover:bg-purple-700",
                        "text-white",
                        themeConfig.animation.transition
                      )}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Preferences
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPreferences({
                          theme: 'dark',
                          language: 'en',
                          timezone: 'UTC',
                          autoSave: true,
                          compactMode: false
                        });
                        setNotifications({
                          email: true,
                          push: false,
                          sms: false,
                          newsletter: true,
                          updates: true,
                          security: true
                        });
                      }}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset to Defaults
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Subscription Tab */}
            <TabsContent value="subscription" className="space-y-6">
              {subscriptionLoading ? (
                <Card className={cn(
                  themeConfig.colors.glass.background,
                  themeConfig.colors.glass.border,
                  themeConfig.colors.glass.shadow,
                  "border"
                )}>
                  <CardContent className="py-12">
                    <div className="text-center">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-400" />
                      <p className="text-white/70">Loading subscription details...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : subscription ? (
                <SubscriptionCard
                  subscription={subscription}
                  onUpgrade={handleUpgrade}
                  onManageBilling={handleManageBilling}
                  onCancelSubscription={handleCancelSubscription}
                />
              ) : (
                <Card className={cn(
                  themeConfig.colors.glass.background,
                  themeConfig.colors.glass.border,
                  themeConfig.colors.glass.shadow,
                  "border"
                )}>
                  <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mb-4">
                      <Crown className="w-6 h-6 text-amber-400" />
                    </div>
                    <CardTitle className="text-white">Get Started with CharismaAI Pro</CardTitle>
                    <CardDescription className="text-gray-300">
                      Unlock unlimited story generation and advanced features
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Free Plan */}
                      <Card className="bg-white/5 border-white/10">
                        <CardHeader className="text-center pb-4">
                          <CardTitle className="text-white text-lg">Free</CardTitle>
                          <div className="text-2xl font-bold text-white">$0<span className="text-sm text-gray-400">/month</span></div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Check className="w-4 h-4 text-green-400" />
                            <span>3 stories per month</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Check className="w-4 h-4 text-green-400" />
                            <span>Basic analysis templates</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Check className="w-4 h-4 text-green-400" />
                            <span>100 API calls per month</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Pro Plan */}
                      <Card className="bg-gradient-to-b from-purple-500/20 to-blue-500/20 border-purple-500/30 relative">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-purple-600 text-white">Most Popular</Badge>
                        </div>
                        <CardHeader className="text-center pb-4">
                          <CardTitle className="text-white text-lg">Pro</CardTitle>
                          <div className="text-2xl font-bold text-white">$29<span className="text-sm text-gray-400">/month</span></div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Check className="w-4 h-4 text-green-400" />
                            <span>Unlimited stories</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Check className="w-4 h-4 text-green-400" />
                            <span>All analysis templates</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Check className="w-4 h-4 text-green-400" />
                            <span>10,000 API calls per month</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Check className="w-4 h-4 text-green-400" />
                            <span>Priority support</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Enterprise Plan */}
                      <Card className="bg-white/5 border-white/10">
                        <CardHeader className="text-center pb-4">
                          <CardTitle className="text-white text-lg">Enterprise</CardTitle>
                          <div className="text-2xl font-bold text-white">$99<span className="text-sm text-gray-400">/month</span></div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Check className="w-4 h-4 text-green-400" />
                            <span>Everything in Pro</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Check className="w-4 h-4 text-green-400" />
                            <span>Unlimited API calls</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Check className="w-4 h-4 text-green-400" />
                            <span>API access</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Check className="w-4 h-4 text-green-400" />
                            <span>Custom integrations</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="text-center pt-4">
                      <Button
                        onClick={handleUpgrade}
                        className={cn(
                          "bg-gradient-to-r from-purple-600 to-blue-600",
                          "hover:from-purple-700 hover:to-blue-700",
                          "text-white font-medium px-8 py-3",
                          "transform hover:scale-105 transition-all duration-300"
                        )}
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade to Pro
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </UnifiedLayout>
  );
}
