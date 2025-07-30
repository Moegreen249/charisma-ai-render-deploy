"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createModule, updateModule } from "@/app/actions/module";
import { X, Save, Loader2 } from "lucide-react";

interface AnalysisModule {
  id: string;
  name: string;
  description?: string;
  instructionPrompt: string;
  expectedJsonHint: string;
  category: string;
  icon: string;
  isActive: boolean;
  isBuiltIn: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ModuleFormProps {
  module?: AnalysisModule;
  onSuccess: (module: AnalysisModule) => void;
  onCancel: () => void;
}

const CATEGORIES = [
  "general",
  "emotional",
  "pattern",
  "personality",
  "content",
  "overall",
];

const ICONS = ["✨", "🧠", "💭", "🎯", "📊", "🔍", "💡", "⚡", "🌟", "🎨"];

export default function ModuleForm({ module, onSuccess, onCancel }: ModuleFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!module;
  const isBuiltIn = module?.isBuiltIn || false;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);

    try {
      let result;
      if (isEditing) {
        result = await updateModule(module.id, formData);
      } else {
        result = await createModule(formData);
      }

      if (result.success) {
        onSuccess(result.data);
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: "An unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const validateJson = (jsonString: string) => {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value && !validateJson(value)) {
      setErrors(prev => ({ ...prev, expectedJsonHint: "Invalid JSON format" }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.expectedJsonHint;
        return newErrors;
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl">
            {isEditing ? "Edit Module" : "Create New Module"}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* General Error */}
            {errors.general && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400 text-sm">
                {errors.general}
              </div>
            )}

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Module Name *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={module?.name}
                disabled={isBuiltIn}
                required
                placeholder="e.g., Emotional Arc Tracking"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={module?.description}
                placeholder="What this module analyzes..."
                rows={2}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue={module?.category || "general"} disabled={isBuiltIn}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Icon */}
            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <Select name="icon" defaultValue={module?.icon || "✨"} disabled={isBuiltIn}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICONS.map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      <span className="flex items-center gap-2">
                        <span>{icon}</span>
                        <span className="text-muted-foreground">{icon}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Instruction Prompt */}
            <div className="space-y-2">
              <Label htmlFor="instructionPrompt">Instruction Prompt *</Label>
              <Textarea
                id="instructionPrompt"
                name="instructionPrompt"
                defaultValue={module?.instructionPrompt}
                disabled={isBuiltIn}
                required
                placeholder="The specific AI instruction text for this module..."
                rows={4}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                This is the prompt that will be sent to the AI to generate insights for this module.
              </p>
            </div>

            {/* Expected JSON Hint */}
            <div className="space-y-2">
              <Label htmlFor="expectedJsonHint">Expected JSON Schema *</Label>
              <Textarea
                id="expectedJsonHint"
                name="expectedJsonHint"
                defaultValue={module?.expectedJsonHint}
                disabled={isBuiltIn}
                required
                placeholder='{"type": "chart", "title": "Example", "content": [], "metadata": {}}'
                rows={6}
                className="font-mono text-sm"
                onChange={handleJsonChange}
              />
              {errors.expectedJsonHint && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {errors.expectedJsonHint}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                JSON example showing the expected structure for insights generated by this module.
              </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                name="isActive"
                defaultChecked={module?.isActive ?? true}
              />
              <Label htmlFor="isActive" className="text-sm">
                Module is active
              </Label>
            </div>

            {/* Built-in Warning */}
            {isBuiltIn && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-yellow-600 dark:text-yellow-400 text-sm">
                <strong>Built-in Module:</strong> Some fields cannot be modified for system-defined modules.
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? "Update Module" : "Create Module"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 