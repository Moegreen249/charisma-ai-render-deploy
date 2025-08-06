'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Palette, Download, Upload, Copy, Check, RotateCcw, Save, Eye, Plus, Trash2, Sparkles, Monitor, Sun, Moon, Paintbrush, Settings, Zap, RefreshCw,  } from "lucide-react";
import Edit from "lucide-react/dist/esm/icons/edit";
import { 
  useThemeStore, 
  themePresets, 
  CustomTheme, 
  exportTheme, 
  importTheme,
  generateThemeCSS,
  applyThemeToDOM,
} from '@/lib/theme-customization';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

function ColorPicker({ label, value, onChange, description }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <Label className="text-white text-sm font-medium">{label}</Label>
      {description && (
        <p className="text-xs text-white/60">{description}</p>
      )}
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-12 rounded-lg border-2 border-white/20 bg-transparent cursor-pointer"
          />
          <div 
            className="absolute inset-1 rounded-md pointer-events-none"
            style={{ backgroundColor: value }}
          />
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="bg-white/10 border-white/20 text-white flex-1"
        />
      </div>
    </div>
  );
}

export function ThemeCustomizer() {
  const {
    currentTheme,
    customThemes,
    isLoading,
    setCurrentTheme,
    addCustomTheme,
    updateCustomTheme,
    deleteCustomTheme,
    resetToDefault,
    saveTheme,
  } = useThemeStore();

  const [editingTheme, setEditingTheme] = useState<CustomTheme | null>(null);
  const [previewTheme, setPreviewTheme] = useState<CustomTheme | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importJSON, setImportJSON] = useState('');
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const allThemes = [...themePresets, ...customThemes];

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCreateTheme = () => {
    const newTheme: CustomTheme = {
      ...currentTheme,
      id: `custom-${Date.now()}`,
      name: `Custom Theme ${customThemes.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingTheme(newTheme);
    setIsCreateDialogOpen(true);
  };

  const handleSaveTheme = async () => {
    if (!editingTheme) return;

    try {
      await saveTheme(editingTheme);
      setIsCreateDialogOpen(false);
      setEditingTheme(null);
      showMessage('success', 'Theme saved successfully!');
    } catch (error) {
      showMessage('error', 'Failed to save theme. Please try again.');
    }
  };

  const handleImportTheme = () => {
    try {
      const theme = importTheme(importJSON);
      addCustomTheme(theme);
      setIsImportDialogOpen(false);
      setImportJSON('');
      showMessage('success', 'Theme imported successfully!');
    } catch (error) {
      showMessage('error', 'Invalid theme JSON. Please check the format.');
    }
  };

  const handleExportTheme = () => {
    const themeJSON = exportTheme(currentTheme);
    navigator.clipboard.writeText(themeJSON);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showMessage('success', 'Theme exported to clipboard!');
  };

  const handlePreviewTheme = (theme: CustomTheme) => {
    setPreviewTheme(theme);
    applyThemeToDOM(theme);
  };

  const handleApplyTheme = (theme: CustomTheme) => {
    setCurrentTheme(theme);
    setPreviewTheme(null);
    showMessage('success', `Applied ${theme.name} theme!`);
  };

  const handleColorChange = (colorKey: keyof CustomTheme['colors'], value: string) => {
    if (!editingTheme) return;
    setEditingTheme({
      ...editingTheme,
      colors: {
        ...editingTheme.colors,
        [colorKey]: value,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const handleGradientChange = (gradientKey: keyof CustomTheme['gradients'], value: string) => {
    if (!editingTheme) return;
    setEditingTheme({
      ...editingTheme,
      gradients: {
        ...editingTheme.gradients,
        [gradientKey]: value,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  // Reset preview on unmount
  useEffect(() => {
    return () => {
      if (previewTheme) {
        applyThemeToDOM(currentTheme);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Advanced Theme Designer
              </CardTitle>
              <CardDescription className="text-white/70">
                Create and customize beautiful themes for your application
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-500/20 text-purple-200 border-purple-400/30">
                <Sparkles className="w-3 h-3 mr-1" />
                {allThemes.length} Themes
              </Badge>
              <Button
                onClick={handleCreateTheme}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Theme
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

      <Tabs defaultValue="gallery" className="space-y-6">
        <TabsList className="bg-white/10 backdrop-blur-sm border border-white/20">
          <TabsTrigger value="gallery" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
            <Monitor className="w-4 h-4 mr-2" />
            Theme Gallery
          </TabsTrigger>
          <TabsTrigger value="customize" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
            <Paintbrush className="w-4 h-4 mr-2" />
            Customize
          </TabsTrigger>
          <TabsTrigger value="manage" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
            <Settings className="w-4 h-4 mr-2" />
            Manage
          </TabsTrigger>
        </TabsList>

        {/* Theme Gallery */}
        <TabsContent value="gallery" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allThemes.map((theme) => (
              <motion.div
                key={theme.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={cn(
                  "relative overflow-hidden transition-all duration-300 cursor-pointer group",
                  "bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 hover:scale-105",
                  currentTheme.id === theme.id && "ring-2 ring-purple-500 bg-purple-500/10"
                )}>
                  <div className="absolute inset-0 opacity-20">
                    <div className={`h-full w-full bg-gradient-to-br ${theme.gradients.main}`} />
                  </div>
                  
                  <CardHeader className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white text-lg">{theme.name}</CardTitle>
                        <CardDescription className="text-white/60">
                          {theme.id.startsWith('custom-') ? 'Custom Theme' : 'Preset Theme'}
                        </CardDescription>
                      </div>
                      {currentTheme.id === theme.id && (
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                          <Check className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="relative z-10">
                    {/* Color Palette Preview */}
                    <div className="flex items-center gap-2 mb-4">
                      <div 
                        className="w-6 h-6 rounded-full border border-white/30"
                        style={{ backgroundColor: theme.colors.primary }}
                      />
                      <div 
                        className="w-6 h-6 rounded-full border border-white/30"
                        style={{ backgroundColor: theme.colors.secondary }}
                      />
                      <div 
                        className="w-6 h-6 rounded-full border border-white/30"
                        style={{ backgroundColor: theme.colors.accent }}
                      />
                      <div className="text-xs text-white/60 ml-2">
                        {new Date(theme.updatedAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApplyTheme(theme)}
                        className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20"
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Apply
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePreviewTheme(theme)}
                        className="bg-white/5 hover:bg-white/10 text-white border-white/20"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      {theme.id.startsWith('custom-') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteCustomTheme(theme.id)}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/30"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Customize Theme */}
        <TabsContent value="customize" className="space-y-6">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Color Customization</CardTitle>
              <CardDescription className="text-white/70">
                Customize colors for the current theme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ColorPicker
                  label="Primary Color"
                  value={currentTheme.colors.primary}
                  onChange={(value) => {
                    const updatedTheme = {
                      ...currentTheme,
                      colors: { ...currentTheme.colors, primary: value }
                    };
                    setCurrentTheme(updatedTheme);
                  }}
                  description="Main brand color used for buttons and highlights"
                />
                <ColorPicker
                  label="Secondary Color"
                  value={currentTheme.colors.secondary}
                  onChange={(value) => {
                    const updatedTheme = {
                      ...currentTheme,
                      colors: { ...currentTheme.colors, secondary: value }
                    };
                    setCurrentTheme(updatedTheme);
                  }}
                  description="Secondary brand color for accents"
                />
                <ColorPicker
                  label="Accent Color"
                  value={currentTheme.colors.accent}
                  onChange={(value) => {
                    const updatedTheme = {
                      ...currentTheme,
                      colors: { ...currentTheme.colors, accent: value }
                    };
                    setCurrentTheme(updatedTheme);
                  }}
                  description="Accent color for special elements"
                />
                <ColorPicker
                  label="Background"
                  value={currentTheme.colors.background}
                  onChange={(value) => {
                    const updatedTheme = {
                      ...currentTheme,
                      colors: { ...currentTheme.colors, background: value }
                    };
                    setCurrentTheme(updatedTheme);
                  }}
                  description="Main background color"
                />
                <ColorPicker
                  label="Surface"
                  value={currentTheme.colors.surface}
                  onChange={(value) => {
                    const updatedTheme = {
                      ...currentTheme,
                      colors: { ...currentTheme.colors, surface: value }
                    };
                    setCurrentTheme(updatedTheme);
                  }}
                  description="Card and surface backgrounds"
                />
                <ColorPicker
                  label="Text Color"
                  value={currentTheme.colors.text}
                  onChange={(value) => {
                    const updatedTheme = {
                      ...currentTheme,
                      colors: { ...currentTheme.colors, text: value }
                    };
                    setCurrentTheme(updatedTheme);
                  }}
                  description="Primary text color"
                />
              </div>
              
              <div className="flex items-center gap-4 mt-6 pt-6 border-t border-white/20">
                <Button
                  onClick={() => {
                    const updatedTheme = { ...currentTheme, updatedAt: new Date().toISOString() };
                    saveTheme(updatedTheme);
                  }}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={resetToDefault}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset to Default
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage Themes */}
        <TabsContent value="manage" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Export Theme
                </CardTitle>
                <CardDescription className="text-white/70">
                  Export your current theme as JSON
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleExportTheme}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied to Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Export Current Theme
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Import Theme
                </CardTitle>
                <CardDescription className="text-white/70">
                  Import a theme from JSON
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                      <Upload className="w-4 h-4 mr-2" />
                      Import Theme JSON
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Import Theme</DialogTitle>
                      <DialogDescription className="text-gray-300">
                        Paste your theme JSON below to import it.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Label htmlFor="theme-json" className="text-white">Theme JSON</Label>
                      <textarea
                        id="theme-json"
                        value={importJSON}
                        onChange={(e) => setImportJSON(e.target.value)}
                        className="w-full h-64 p-3 bg-gray-800 border border-gray-600 rounded-lg text-white font-mono text-sm resize-none"
                        placeholder="Paste your theme JSON here..."
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsImportDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleImportTheme}
                          disabled={!importJSON.trim()}
                          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                        >
                          Import Theme
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Theme Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Create Custom Theme</DialogTitle>
            <DialogDescription className="text-gray-300">
              Design your own custom theme with personalized colors and styling.
            </DialogDescription>
          </DialogHeader>
          {editingTheme && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="theme-name" className="text-white">Theme Name</Label>
                <Input
                  id="theme-name"
                  value={editingTheme.name}
                  onChange={(e) => setEditingTheme({ ...editingTheme, name: e.target.value })}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <Tabs defaultValue="colors" className="space-y-4">
                <TabsList className="bg-gray-800">
                  <TabsTrigger value="colors" className="data-[state=active]:bg-gray-700 text-white">Colors</TabsTrigger>
                  <TabsTrigger value="gradients" className="data-[state=active]:bg-gray-700 text-white">Gradients</TabsTrigger>
                </TabsList>

                <TabsContent value="colors" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ColorPicker
                      label="Primary"
                      value={editingTheme.colors.primary}
                      onChange={(value) => handleColorChange('primary', value)}
                    />
                    <ColorPicker
                      label="Secondary"
                      value={editingTheme.colors.secondary}
                      onChange={(value) => handleColorChange('secondary', value)}
                    />
                    <ColorPicker
                      label="Accent"
                      value={editingTheme.colors.accent}
                      onChange={(value) => handleColorChange('accent', value)}
                    />
                    <ColorPicker
                      label="Background"
                      value={editingTheme.colors.background}
                      onChange={(value) => handleColorChange('background', value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="gradients" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white">Main Gradient</Label>
                      <Input
                        value={editingTheme.gradients.main}
                        onChange={(e) => handleGradientChange('main', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                        placeholder="from-gray-900 via-purple-900 to-blue-900"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Button Gradient</Label>
                      <Input
                        value={editingTheme.gradients.button}
                        onChange={(e) => handleGradientChange('button', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                        placeholder="from-purple-600 to-blue-600"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveTheme}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Theme
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}