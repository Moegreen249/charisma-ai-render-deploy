"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Sparkles, Layers, X, File, Image, Video, Music, Archive, Code } from "lucide-react";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import { motion, AnimatePresence } from "framer-motion";
import { themeConfig } from "@/lib/theme-config";
import { cn } from "@/lib/utils";
import {
  getSelectedModel,
  getApiKey,
  getSelectedAnalysisTemplate,
} from "@/lib/settings";
import { getStaticModelInfo, getProviderConfig } from "@/lib/ai-providers-client";
import { getTemplatesForUser } from "@/app/actions/templates";

import { useEnhancedLanguage } from "@/components/EnhancedLanguageProvider";
import BackgroundAnalysis from "@/components/BackgroundAnalysis";

interface UploadCardProps {
  onFileSelect: (file: File) => void;
  onAnalyze: () => void;
  onBackgroundAnalysis?: (result: unknown) => void;
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
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadHistory, setUploadHistory] = useState<File[]>([]);
  const [fileValidationError, setFileValidationError] = useState<string | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      const selection = await getSelectedModel();
      setModelLoading(true);
      try {
        const modelInfo = getStaticModelInfo(selection.modelId);
        const providerConfig = getProviderConfig(selection.provider);
        if (modelInfo && providerConfig) {
          setCurrentModel({
            name: modelInfo.name,
            provider: providerConfig.name,
          });
          // Check if API key exists for the current provider
          const apiKey = await getApiKey(providerConfig.apiKeyName);
          setHasApiKey(!!apiKey);
        }
      } catch (error) {
        console.error("Failed to load model info:", error);
      } finally {
        setModelLoading(false);
      }
    };
    loadModel();
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
        const selectedTemplateId = await getSelectedAnalysisTemplate();

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

  // File type icon mapping
  const getFileIcon = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'txt':
        return <FileText className="h-5 w-5 text-purple-400" />;
      case 'pdf':
        return <File className="h-5 w-5 text-red-400" />;
      case 'doc':
      case 'docx':
        return <File className="h-5 w-5 text-blue-400" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="h-5 w-5 text-green-400" />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <Video className="h-5 w-5 text-orange-400" />;
      case 'mp3':
      case 'wav':
        return <Music className="h-5 w-5 text-pink-400" />;
      case 'zip':
      case 'rar':
        return <Archive className="h-5 w-5 text-yellow-400" />;
      case 'js':
      case 'ts':
      case 'html':
      case 'css':
        return <Code className="h-5 w-5 text-cyan-400" />;
      default:
        return <File className="h-5 w-5 text-gray-400" />;
    }
  };

  // File validation
  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['text/plain'];
    
    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }
    
    if (!allowedTypes.includes(file.type)) {
      return 'Only .txt files are supported';
    }
    
    return null;
  };

  // Simulate upload progress
  const simulateUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setUploadProgress(i);
    }
    
    setIsUploading(false);
    setUploadProgress(0);
  };

  const handleFileSelect = async (file: File) => {
    const validationError = validateFile(file);
    setFileValidationError(validationError);
    
    if (validationError) {
      return;
    }

    // Add to upload history
    setUploadHistory(prev => {
      const newHistory = [file, ...prev.filter(f => f.name !== file.name)];
      return newHistory.slice(0, 5); // Keep only last 5 files
    });

    // Simulate upload progress
    await simulateUpload(file);
    
    setSelectedFile(file);
    onFileSelect(file);
    setShowBackgroundOption(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileSelect(file);
    }
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFileSelect(files[0]);
    }
  }, []);

  const removeFile = () => {
    setSelectedFile(null);
    setShowBackgroundOption(false);
    setFileValidationError(null);
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
        <Card className={cn(
          "w-full",
          themeConfig.colors.glass.background,
          themeConfig.colors.glass.border,
          themeConfig.colors.glass.shadow,
          "border"
        )}>
          <CardHeader className="text-center">
            <CardTitle className={cn("text-3xl font-bold", themeConfig.typography.gradient)}>{t.appTitle}</CardTitle>
            <CardDescription className="text-lg mt-2 text-gray-300">
              {t.appDescription}
            </CardDescription>

            {/* Current Configuration */}
            <div className="space-y-3 mt-4">
              {modelLoading ? (
                <div className="flex items-center justify-center gap-2 text-gray-400">
                  Loading model...
                </div>
              ) : (
                currentModel && (
                  <div className="flex items-center justify-center gap-2">
                    <Badge className="gap-1 bg-purple-600/20 border-purple-500/30 text-purple-200">
                      <Sparkles className="h-3 w-3" />
                      {currentModel.provider}
                    </Badge>
                    <Badge variant="outline" className="border-white/20 text-white">{currentModel.name}</Badge>
                  </div>
                )
              )}

              {currentTemplate && (
                <div className="flex items-center justify-center gap-2">
                  <Badge className="gap-1 bg-blue-600/20 border-blue-500/30 text-blue-200">
                    <Layers className="h-3 w-3" />
                    Analysis Type
                  </Badge>
                  <Badge variant="outline" className="gap-1 border-white/20 text-white">
                    <span>{currentTemplate.icon}</span>
                    {currentTemplate.name}
                  </Badge>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enhanced Drag and Drop Area */}
            <div className="space-y-4">
              <Label className="text-base font-medium text-white">
                {t.selectChatFile}
              </Label>
              
              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300",
                  isDragOver
                    ? "border-purple-400 bg-purple-400/10 scale-105"
                    : "border-white/30 hover:border-white/50 hover:bg-white/5",
                  "cursor-pointer group"
                )}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  accept=".txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <div className="space-y-4">
                  <div className={cn(
                    "mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
                    isDragOver 
                      ? "bg-purple-500/20 text-purple-400" 
                      : "bg-white/10 text-gray-400 group-hover:text-white group-hover:bg-white/20"
                  )}>
                    <Upload className="h-8 w-8" />
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-white font-medium">
                      {isDragOver ? "Drop your file here" : "Drag & drop your file here"}
                    </p>
                    <p className="text-gray-400 text-sm">
                      or click to browse files
                    </p>
                    <p className="text-xs text-gray-500">
                      Supports: .txt files up to 10MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload Progress */}
              <AnimatePresence>
                {isUploading && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white">Uploading...</span>
                      <span className="text-gray-400">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* File Validation Error */}
              <AnimatePresence>
                {fileValidationError && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-300 text-sm p-3 rounded-lg"
                  >
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{fileValidationError}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Selected File Preview Card */}
            <AnimatePresence>
              {selectedFile && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white/10 border border-white/20 p-4 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getFileIcon(selectedFile)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-white">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {(selectedFile.size / 1024).toFixed(2)} KB • {selectedFile.type || 'Unknown type'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <button
                        onClick={removeFile}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                        title="Remove file"
                      >
                        <X className="h-4 w-4 text-gray-400 hover:text-white" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Upload History */}
            <AnimatePresence>
              {uploadHistory.length > 0 && !selectedFile && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-gray-300">
                      Recent Files
                    </Label>
                    <button
                      onClick={() => setUploadHistory([])}
                      className="text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {uploadHistory.map((file, index) => (
                      <motion.div
                        key={`${file.name}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center space-x-3 p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                        onClick={() => handleFileSelect(file)}
                      >
                        {getFileIcon(file)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-white">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        <div className="text-xs text-gray-500">
                          Click to reuse
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!hasApiKey && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm p-3 rounded-lg"
              >
                {t.noApiKey}
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm p-3 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-3">
              <Button
                onClick={onAnalyze}
                disabled={!selectedFile || !hasApiKey || loading}
                className={cn(
                  "w-full",
                  "bg-gradient-to-r",
                  themeConfig.colors.gradients.button,
                  "text-white font-medium",
                  "hover:opacity-90",
                  themeConfig.animation.transition,
                  themeConfig.animation.hover
                )}
              >
                {loading ? t.analyzing : t.analyzeConversation}
              </Button>

              {showBackgroundOption && selectedFile && hasApiKey && (
                <div className="space-y-2">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/20" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 text-center">
                    Analysis will run in the background. You&apos;ll be notified
                    when complete.
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
