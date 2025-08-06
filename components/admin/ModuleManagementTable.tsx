"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Lightbulb, Settings } from "lucide-react";
import Edit from "lucide-react/dist/esm/icons/edit";
import ModuleForm from "./ModuleForm";
import DeleteModuleDialog from "./DeleteModuleDialog";

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

interface ModuleManagementTableProps {
  initialModules: AnalysisModule[];
}

export default function ModuleManagementTable({
  initialModules,
}: ModuleManagementTableProps) {
  const [modules, setModules] = useState<AnalysisModule[]>(initialModules);
  const [showForm, setShowForm] = useState(false);
  const [editingModule, setEditingModule] = useState<AnalysisModule | null>(null);
  const [deletingModule, setDeletingModule] = useState<AnalysisModule | null>(null);
  const [loading, setLoading] = useState(false);

  const handleModuleCreated = (newModule: AnalysisModule) => {
    setModules([...modules, newModule]);
    setShowForm(false);
  };

  const handleModuleUpdated = (updatedModule: AnalysisModule) => {
    setModules(modules.map(m => m.id === updatedModule.id ? updatedModule : m));
    setEditingModule(null);
  };

  const handleModuleDeleted = (moduleId: string) => {
    setModules(modules.filter(m => m.id !== moduleId));
    setDeletingModule(null);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      emotional: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
      pattern: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      personality: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
      content: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      overall: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
      general: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
    };
    return colors[category.toLowerCase()] || colors.general;
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Analysis Modules</h2>
          <p className="text-sm text-muted-foreground">
            Manage reusable AI analysis components
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Module
        </Button>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module) => (
          <Card key={module.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{module.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{module.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="outline" 
                        className={getCategoryColor(module.category)}
                      >
                        {module.category}
                      </Badge>
                      <Badge 
                        variant={module.isActive ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {module.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {module.isBuiltIn && (
                        <Badge variant="outline" className="text-xs">
                          Built-in
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingModule(module)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {!module.isBuiltIn && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingModule(module)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {module.description && (
                <p className="text-sm text-muted-foreground mb-3">
                  {module.description}
                </p>
              )}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lightbulb className="h-3 w-3" />
                  <span className="truncate">
                    {module.instructionPrompt.length > 100
                      ? `${module.instructionPrompt.substring(0, 100)}...`
                      : module.instructionPrompt}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Settings className="h-3 w-3" />
                  <span>JSON Schema: {module.expectedJsonHint.length > 50 ? `${module.expectedJsonHint.substring(0, 50)}...` : module.expectedJsonHint}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {modules.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No modules yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first analysis module to get started with the Prompt Engineering Studio.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Module
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Module Form Dialog */}
      {showForm && (
        <ModuleForm
          onSuccess={handleModuleCreated}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Edit Module Form Dialog */}
      {editingModule && (
        <ModuleForm
          module={editingModule}
          onSuccess={handleModuleUpdated}
          onCancel={() => setEditingModule(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingModule && (
        <DeleteModuleDialog
          module={deletingModule}
          onSuccess={() => handleModuleDeleted(deletingModule.id)}
          onCancel={() => setDeletingModule(null)}
        />
      )}
    </div>
  );
} 