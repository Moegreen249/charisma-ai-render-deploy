"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteModule } from "@/app/actions/module";
import { X, Trash2 } from "lucide-react";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";

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

interface DeleteModuleDialogProps {
  module: AnalysisModule;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function DeleteModuleDialog({
  module,
  onSuccess,
  onCancel,
}: DeleteModuleDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await deleteModule(module.id);

      if (result.success) {
        onSuccess();
      } else {
        setError('error' in result ? result.error : 'Failed to delete module');
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const isBuiltIn = module.isBuiltIn;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete Module
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {isBuiltIn ? (
            <div className="space-y-4">
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-yellow-600 dark:text-yellow-400">
                <strong>Cannot Delete Built-in Module</strong>
                <p className="text-sm mt-1">
                  This is a system-defined module and cannot be deleted. You can disable it instead.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button onClick={onCancel}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to delete the module:
                </p>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{module.icon}</span>
                    <div>
                      <p className="font-medium">{module.name}</p>
                      {module.description && (
                        <p className="text-sm text-muted-foreground">
                          {module.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-red-600 dark:text-red-400">
                  This action cannot be undone. The module will be permanently removed.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" onClick={onCancel} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Trash2 className="h-4 w-4" />
                  Delete Module
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 