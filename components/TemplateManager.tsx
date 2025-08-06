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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Plus, Copy, Trash2, Save, X, FileText, Lock, Target,  } from "lucide-react";
import Edit from "lucide-react/dist/esm/icons/edit";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import { motion, AnimatePresence } from "framer-motion";
import { getTemplatesForUser } from "@/app/actions/templates";
import type { AnalysisTemplate } from "@/lib/analysis-templates";
import {
  createUserTemplate,
  updateUserTemplate,
  deleteUserTemplate,
} from "@/app/actions/user-templates";
import { themeConfig } from "@/lib/theme-config";
import { cn } from "@/lib/utils";

interface TemplateManagerProps {
  onTemplateChange?: () => void;
}

interface TemplateFormData {
  name: string;
  description: string;
  category: string;
  icon: string;
  systemPrompt: string;
  analysisPrompt: string;
}

const defaultFormData: TemplateFormData = {
  name: "",
  description: "",
  category: "custom",
  icon: "🎯",
  systemPrompt: "",
  analysisPrompt: `You are an expert analyst. Your task is to analyze the provided chat conversation.

IMPORTANT INSTRUCTIONS:
1. First, detect the language used in the conversation automatically from the context
2. Respond in the SAME LANGUAGE as the conversation
3. Provide objective observations rather than judgments. Be constructive and insightful.

Analyze the conversation and provide insights.

You MUST respond with a valid JSON object that exactly matches this structure:
{
  "detectedLanguage": "Name of the detected language",
  "personality": {
    "traits": ["trait1", "trait2", ...],
    "summary": "A concise summary of the overall personality profile"
  },
  "emotionalArc": [
    {
      "timestamp": "Beginning/Middle/End or specific reference",
      "emotion": "The emotion name",
      "intensity": 0.0 to 1.0,
      "context": "What triggered this emotion"
    }
  ],
  "topics": [
    {
      "name": "Topic name",
      "keywords": ["keyword1", "keyword2"],
      "relevance": 0.0 to 1.0
    }
  ],
  "communicationPatterns": [
    {
      "pattern": "Pattern name",
      "examples": ["example quote 1", "example quote 2"],
      "impact": "How this pattern affects the conversation"
    }
  ],
  "overallSummary": "A comprehensive summary of the conversation dynamics"
}

Chat Conversation:
---
\${chatContent}
---

Respond ONLY with the JSON object.`,
};

export default function TemplateManager({
  onTemplateChange,
}: TemplateManagerProps) {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const [templates, setTemplates] = useState<AnalysisTemplate[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<AnalysisTemplate | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>(defaultFormData);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      loadTemplates();
    }
  }, [userId]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const result = await getTemplatesForUser();
      if (result.success && result.data) {
        setTemplates(result.data);
      } else {
        setError(result.error || "Failed to load templates");
      }
    } catch (error) {
      setError("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template: AnalysisTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || "",
      category: template.category || "custom",
      icon: template.icon || "🎯",
      systemPrompt: template.systemPrompt || "",
      analysisPrompt: template.analysisPrompt || "",
    });
    setIsEditing(true);
  };

  const handleDuplicate = (template: AnalysisTemplate) => {
    setEditingTemplate(null);
    setFormData({
      name: `${template.name} (Copy)`,
      description: template.description || "",
      category: "custom",
      icon: template.icon || "🎯",
      systemPrompt: template.systemPrompt || "",
      analysisPrompt: template.analysisPrompt || "",
    });
    setIsEditing(true);
  };

  const handleDelete = async (template: AnalysisTemplate) => {
    if (template.isBuiltIn || !template.id) {
      setError("Built-in templates cannot be deleted.");
      return;
    }
    setLoading(true);
    try {
      const result = await deleteUserTemplate(template.id);
      if (result.success) {
        if (userId) await loadTemplates();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        if (onTemplateChange) onTemplateChange();
      } else {
        setError(result.error || "Failed to delete template");
      }
    } catch (error) {
      setError("Failed to delete template");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError("Template name is required");
      return;
    }
    if (!formData.analysisPrompt.trim()) {
      setError("Analysis prompt is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const formDataObj = new FormData();
      formDataObj.append("name", formData.name);
      formDataObj.append("description", formData.description);
      formDataObj.append("category", formData.category);
      formDataObj.append("icon", formData.icon);
      formDataObj.append("systemPrompt", formData.systemPrompt);
      formDataObj.append("analysisPrompt", formData.analysisPrompt);
      let result;
      if (editingTemplate && editingTemplate.id) {
        result = await updateUserTemplate(editingTemplate.id, formDataObj);
      } else {
        result = await createUserTemplate(formDataObj);
      }
      if (result.success) {
        if (userId) await loadTemplates();
        setIsEditing(false);
        setEditingTemplate(null);
        setFormData(defaultFormData);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        if (onTemplateChange) onTemplateChange();
      } else {
        setError(result.error || "Failed to save template");
      }
    } catch (error) {
      setError("Failed to save template");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingTemplate(null);
    setFormData(defaultFormData);
    setError("");
  };

  const handleTestTemplate = () => {
    // This would open a test dialog or navigate to test page
    setError("Template testing feature coming soon!");
  };

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setFormData(defaultFormData);
    setIsEditing(true);
    setError("");
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        <span className="ml-2 text-white">Loading templates...</span>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="p-8 text-center text-gray-400">
        Please sign in to manage your custom templates.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className={cn("text-3xl font-bold mb-2", themeConfig.typography.gradient)}>
          Template Management
        </h2>
        <p className="text-gray-300 mb-6">
          Create and manage your custom analysis templates
        </p>
        <Button 
          onClick={handleCreateNew} 
          className={cn(
            "gap-2",
            "bg-gradient-to-r",
            themeConfig.colors.gradients.button,
            "text-white font-medium",
            "hover:opacity-90",
            themeConfig.animation.transition
          )}
        >
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      </div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert className="bg-green-500/10 border-green-500/20 text-green-300">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Template saved successfully!</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert className="bg-red-500/10 border-red-500/20 text-red-300">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Form */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className={cn(
            themeConfig.colors.glass.background,
            themeConfig.colors.glass.border,
            themeConfig.colors.glass.shadow,
            "border"
          )}>
            <CardHeader>
              <CardTitle className="text-white">
                {editingTemplate ? "Edit Template" : "Create New Template"}
              </CardTitle>
              <CardDescription className="text-gray-300">
                Configure your custom analysis template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name" className="text-white">Template Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter template name"
                    className={cn(
                      "mt-2",
                      "bg-white/10 border-white/20 text-white placeholder:text-gray-400",
                      "focus:bg-white/20 focus:border-purple-400",
                      themeConfig.animation.transition
                    )}
                  />
                </div>
                <div>
                  <Label htmlFor="category" className="text-white">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger className={cn(
                      "mt-2",
                      "bg-white/10 border-white/20 text-white",
                      "focus:bg-white/20 focus:border-purple-400",
                      themeConfig.animation.transition
                    )}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-white/20 text-white">
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="clinical">Clinical</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="icon" className="text-white">Icon</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) =>
                      setFormData({ ...formData, icon: e.target.value })
                    }
                    placeholder="🎯"
                    maxLength={10}
                    className={cn(
                      "mt-2",
                      "bg-white/10 border-white/20 text-white placeholder:text-gray-400",
                      "focus:bg-white/20 focus:border-purple-400",
                      themeConfig.animation.transition
                    )}
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-white">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Brief description of the template"
                    className={cn(
                      "mt-2",
                      "bg-white/10 border-white/20 text-white placeholder:text-gray-400",
                      "focus:bg-white/20 focus:border-purple-400",
                      themeConfig.animation.transition
                    )}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="systemPrompt" className="text-white">System Prompt</Label>
                <Textarea
                  id="systemPrompt"
                  value={formData.systemPrompt}
                  onChange={(e) =>
                    setFormData({ ...formData, systemPrompt: e.target.value })
                  }
                  placeholder="Enter the system prompt for the AI"
                  rows={3}
                  className={cn(
                    "mt-2",
                    "bg-white/10 border-white/20 text-white placeholder:text-gray-400",
                    "focus:bg-white/20 focus:border-purple-400",
                    themeConfig.animation.transition
                  )}
                />
              </div>

              <div>
                <Label htmlFor="analysisPrompt" className="text-white">Analysis Prompt</Label>
                <Textarea
                  id="analysisPrompt"
                  value={formData.analysisPrompt}
                  onChange={(e) =>
                    setFormData({ ...formData, analysisPrompt: e.target.value })
                  }
                  placeholder="Enter the analysis prompt template"
                  rows={10}
                  className={cn(
                    "mt-2",
                    "bg-white/10 border-white/20 text-white placeholder:text-gray-400",
                    "focus:bg-white/20 focus:border-purple-400",
                    themeConfig.animation.transition
                  )}
                />
                <p className="text-sm text-gray-400 mt-2">
                  Use $&#123;chatContent&#125; to reference the conversation
                  content
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-4">
                <Button 
                  onClick={handleSave} 
                  disabled={loading}
                  className={cn(
                    "gap-2",
                    "bg-gradient-to-r",
                    themeConfig.colors.gradients.button,
                    "text-white font-medium",
                    "hover:opacity-90",
                    themeConfig.animation.transition
                  )}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Template
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  className={cn(
                    "border-white/20 text-white hover:bg-white/10",
                    themeConfig.animation.transition
                  )}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleTestTemplate}
                  className={cn(
                    "border-purple-400/20 text-purple-400 hover:bg-purple-500/10",
                    themeConfig.animation.transition
                  )}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Test Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Template List */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-white">Your Templates</h3>
        <div className="grid gap-6">
          {templates.map((template) => (
            <motion.div
              key={template.id || `builtin-${template.name}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group"
            >
              <Card className={cn(
                "hover:shadow-lg transition-all duration-300",
                themeConfig.colors.glass.background,
                themeConfig.colors.glass.border,
                themeConfig.colors.glass.shadow,
                "border"
              )}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl p-2 rounded-lg bg-white/10">{template.icon}</div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-white text-lg">{template.name}</h4>
                          {template.isBuiltIn && (
                            <Badge className="text-xs bg-blue-500/20 border-blue-500/30 text-blue-200">
                              <Lock className="h-3 w-3 mr-1" />
                              Built-in
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className="text-xs capitalize border-white/20 text-white bg-white/5"
                          >
                            {template.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-300">
                          {template.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!template.isBuiltIn && template.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(template)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDuplicate(template)}
                        className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      {!template.isBuiltIn && template.id && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className={cn(
                            themeConfig.colors.glass.background,
                            themeConfig.colors.glass.border,
                            "border text-white"
                          )}>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">
                                Delete Template
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-300">
                                Are you sure you want to delete "{template.name}
                                "? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(template)}
                                className="bg-red-600 text-white hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
