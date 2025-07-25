"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
import {
  ArrowLeft,
  Key,
  Eye,
  EyeOff,
  ExternalLink,
  Check,
  X,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  AI_PROVIDERS,
  getProviderConfig,
  getModelInfo,
  getAvailableModelsByProvider,
  type AIProvider,
} from "@/lib/ai-providers";
import { LanguageSwitcher } from "@/components/EnhancedLanguageProvider";

import {
  getApiKey,
  setApiKey,
  clearApiKey,
  getSelectedModel,
  setSelectedModel,
  getSelectedAnalysisTemplate,
  setSelectedAnalysisTemplate,
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
  const [activeTab, setActiveTab] = useState<"ai" | "templates" | "language">(
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

  // Load settings on mount
  useEffect(() => {
    const selection = getSelectedModel();
    setSelectedProvider(selection.provider);
    setSelectedModelId(selection.modelId);

    // Load selected analysis template
    const template = getSelectedAnalysisTemplate();
    setSelectedTemplate(template);

    // Load API keys
    const keys: Record<string, string> = {};
    AI_PROVIDERS.forEach((provider) => {
      const key = getApiKey(provider.apiKeyName);
      if (key) {
        keys[provider.apiKeyName] = key;
      }
    });
    setApiKeys(keys);
  }, []);

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
        const model = await getModelInfo(selectedModelId);
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

  const handleSaveApiKey = (keyName: string) => {
    const value = apiKeys[keyName];
    if (value && value.trim()) {
      setApiKey(keyName, value.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleClearApiKey = (keyName: string) => {
    clearApiKey(keyName);
    setApiKeys((prev) => ({ ...prev, [keyName]: "" }));
  };

  const handleModelChange = async (modelId: string) => {
    const modelInfo = await getModelInfo(modelId);
    if (modelInfo) {
      setSelectedModelId(modelId);
      setSelectedProvider(modelInfo.provider);
      setSelectedModel(modelInfo.provider, modelId);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    setSelectedAnalysisTemplate(templateId);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTemplateManagerChange = () => {
    // Refresh template list when templates are modified
    // This will be handled by the useEffect that depends on session
  };

  const currentProvider = getProviderConfig(selectedProvider as AIProvider);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background p-4"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">
                Manage your AI providers, models, and analysis templates
              </p>
            </div>
          </div>
          {saved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Badge variant="default" className="gap-1">
                <Check className="h-3 w-3" />
                Saved
              </Badge>
            </motion.div>
          )}
        </div>

        {/* Settings Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "ai" | "templates" | "language")
          }
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ai">AI Configuration</TabsTrigger>
            <TabsTrigger value="templates">Template Management</TabsTrigger>
            <TabsTrigger value="language">Language & Localization</TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-6">
            {/* Analysis Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Analysis Template
                </CardTitle>
                <CardDescription>
                  Choose the type of analysis you want to perform on your
                  conversations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="template-select">Analysis Type</Label>
                    <Select
                      value={selectedTemplate}
                      onValueChange={handleTemplateChange}
                    >
                      <SelectTrigger id="template-select" className="mt-2">
                        <SelectValue placeholder="Select an analysis template" />
                      </SelectTrigger>
                      <SelectContent>
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
                              <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground capitalize">
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
                                      <div className="text-xs text-muted-foreground">
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
                    <Alert>
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
            <Card>
              <CardHeader>
                <CardTitle>AI Model Selection</CardTitle>
                <CardDescription>
                  Choose your preferred AI model for conversation analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="model-select">Active Model</Label>
                    <Select
                      value={selectedModelId}
                      onValueChange={handleModelChange}
                    >
                      <SelectTrigger id="model-select" className="mt-2">
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        {AI_PROVIDERS.map((provider) => {
                          const availableProviderModels =
                            providerModels[provider.id] || [];
                          if (modelsLoading[provider.id]) {
                            return (
                              <div
                                key={provider.id}
                                className="px-2 py-1.5 text-sm text-muted-foreground"
                              >
                                Loading models...
                              </div>
                            );
                          }
                          if (availableProviderModels.length === 0) return null;
                          return (
                            <div key={provider.id}>
                              <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
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
                                    <span className="text-xs text-muted-foreground ml-2">
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
                    <Alert>
                      <AlertDescription>
                        {modelDescriptions[selectedModelId] || ""}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* API Keys Management */}
            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>
                  Configure your API keys for different AI providers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={selectedProvider}>
                  <TabsList className="grid grid-cols-3 w-full">
                    {AI_PROVIDERS.map((provider) => (
                      <TabsTrigger key={provider.id} value={provider.id}>
                        {provider.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {AI_PROVIDERS.map((provider) => (
                    <TabsContent
                      key={provider.id}
                      value={provider.id}
                      className="space-y-4"
                    >
                      {provider.id === "google-vertex-ai" ? (
                        <div className="space-y-2">
                          <Label htmlFor="vertex-ai-key">
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
                              variant="secondary"
                              onClick={() =>
                                handleSaveApiKey(provider.apiKeyName)
                              }
                              disabled={!apiKeys[provider.apiKeyName]}
                            >
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() =>
                                handleClearApiKey(provider.apiKeyName)
                              }
                              disabled={!apiKeys[provider.apiKeyName]}
                            >
                              Clear
                            </Button>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Get your Vertex AI API key from{" "}
                            <a
                              href="https://makersuite.google.com/app/apikey"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Google AI Studio
                            </a>
                            .
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor={`${provider.id}-key`}>API Key</Label>
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
                            >
                              Save
                            </Button>
                            <Button
                              onClick={() =>
                                handleClearApiKey(provider.apiKeyName)
                              }
                              variant="destructive"
                              disabled={!apiKeys[provider.apiKeyName]?.trim()}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      <Alert>
                        <Key className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-2">
                            <p>
                              Get your API key from{" "}
                              <a
                                href={provider.getApiKeyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline inline-flex items-center gap-1"
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
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <TemplateManager onTemplateChange={handleTemplateManagerChange} />
          </TabsContent>

          <TabsContent value="language" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🌐 Language & Localization
                </CardTitle>
                <CardDescription>
                  Choose your preferred language and configure RTL support for
                  Arabic
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <LanguageSwitcher />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">
                      Supported Languages
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🇺🇸</span>
                          <div>
                            <div className="font-medium">English</div>
                            <div className="text-sm text-muted-foreground">
                              Full feature support
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🇸🇦</span>
                          <div>
                            <div className="font-medium">العربية (Arabic)</div>
                            <div className="text-sm text-muted-foreground">
                              RTL layout with full support
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Features</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">
                          Automatic language detection from analysis results
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">
                          Right-to-left (RTL) layout for Arabic
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">
                          Professional psychological and business terminology
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">
                          Cultural adaptation for Arabic-speaking users
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">
                          Language preference persistence
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}
