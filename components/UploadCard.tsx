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
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Sparkles, Layers, Clock } from "lucide-react";
import { motion } from "framer-motion";
import {
  getSelectedModel,
  getApiKey,
  getSelectedAnalysisTemplate,
} from "@/lib/settings";
import { getModelInfo, getProviderConfig } from "@/lib/ai-providers";
import { getTemplatesForUser } from "@/app/actions/templates";

import { useEnhancedLanguage } from "@/components/EnhancedLanguageProvider";
import BackgroundAnalysis from "@/components/BackgroundAnalysis";

interface UploadCardProps {
  onFileSelect: (file: File) => void;
  onAnalyze: () => void;
  onBackgroundAnalysis?: (result: any) => void;
  loading?: boolean;
  error?: string | null;
}

export default function UploadCard({
  onFileSelect,
  onAnalyze,
  onBackgroundAnalysis,
  loading = false,
  error = null,
}: UploadCardProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { translations: t } = useEnhancedLanguage();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentModel, setCurrentModel] = useState<{
    name: string;
    provider: string;
  } | null>(null);
  const [modelLoading, setModelLoading] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<{
    name: string;
    icon: string;
  } | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [showBackgroundOption, setShowBackgroundOption] = useState(false);
  const [fileContent, setFileContent] = useState<string>("");

  useEffect(() => {
    const selection = getSelectedModel();
    setModelLoading(true);
    getModelInfo(selection.modelId).then((modelInfo) => {
      const providerConfig = getProviderConfig(selection.provider);
      if (modelInfo && providerConfig) {
        setCurrentModel({
          name: modelInfo.name,
          provider: providerConfig.name,
        });
        // Check if API key exists for the current provider
        const apiKey = getApiKey(providerConfig.apiKeyName);
        setHasApiKey(!!apiKey);
      }
      setModelLoading(false);
    });
    // Load templates if user is authenticated
    if (userId) {
      loadTemplates();
    }
  }, [userId]);

  const loadTemplates = async () => {
    try {
      const result = await getTemplatesForUser();
      if (result.success && result.data) {
        // Get current template selection
        const selectedTemplateId = getSelectedAnalysisTemplate();

        // Update template selection if needed
        const currentTemplate = result.data.find(
          (t) => t.id === selectedTemplateId,
        );
        if (currentTemplate) {
          setCurrentTemplate({
            name: currentTemplate.name,
            icon: currentTemplate.icon,
          });
        }
      }
    } catch (error) {
      console.error("Failed to load templates:", error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "text/plain") {
      setSelectedFile(file);
      onFileSelect(file);

      // Read file content for background processing
      const content = await file.text();
      setFileContent(content);
      setShowBackgroundOption(true);
    } else {
      alert("Please select a .txt file");
    }
  };

  const startBackgroundAnalysis = async () => {
    if (!selectedFile || !fileContent) return;

    const templateId = getSelectedAnalysisTemplate();
    const modelSelection = getSelectedModel();

    // This would integrate with the BackgroundAnalysis component
    // For now, we'll show the background analysis UI
    setShowBackgroundOption(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-screen p-4"
    >
      <div className="w-full max-w-lg space-y-4">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">{t.appTitle}</CardTitle>
            <CardDescription className="text-lg mt-2">
              {t.appDescription}
            </CardDescription>

            {/* Current Configuration */}
            <div className="space-y-3 mt-4">
              {modelLoading ? (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  Loading model...
                </div>
              ) : (
                currentModel && (
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Sparkles className="h-3 w-3" />
                      {currentModel.provider}
                    </Badge>
                    <Badge variant="outline">{currentModel.name}</Badge>
                  </div>
                )
              )}

              {currentTemplate && (
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Layers className="h-3 w-3" />
                    Analysis Type
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <span>{currentTemplate.icon}</span>
                    {currentTemplate.name}
                  </Badge>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="file-upload" className="text-base font-medium">
                {t.selectChatFile}
              </Label>
              <div className="relative">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".txt"
                  onChange={handleFileChange}
                  className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Upload className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            {selectedFile && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-secondary/20 p-4 rounded-lg flex items-center space-x-3"
              >
                <FileText className="h-5 w-5 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(2)} {t.fileSizeKB}
                  </p>
                </div>
              </motion.div>
            )}

            {!hasApiKey && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg"
              >
                {t.noApiKey}
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-3">
              <Button
                onClick={onAnalyze}
                disabled={!selectedFile || !hasApiKey || loading}
                className="w-full"
              >
                {loading ? t.analyzing : t.analyzeConversation}
              </Button>

              {showBackgroundOption && selectedFile && hasApiKey && (
                <div className="space-y-2">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Analysis will run in the background. You'll be notified when
                    complete.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Background Analysis Component */}
        {showBackgroundOption && (
          <BackgroundAnalysis
            onAnalysisComplete={onBackgroundAnalysis}
            onError={(error) =>
              console.error("Background analysis error:", error)
            }
          />
        )}
      </div>
    </motion.div>
  );
}
