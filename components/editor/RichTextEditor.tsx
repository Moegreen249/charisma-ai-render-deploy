'use client';

import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { useDebounce, usePerformance } from '@/hooks/usePerformance';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Quote, Link, Image, Code, Heading1, Heading2, Heading3, Type, Palette, Eye, Undo, Redo, Save, FileText, Download, Upload, Maximize, Minimize, Zap, Sparkles,  } from "lucide-react";
import Wand2 from "lucide-react/dist/esm/icons/wand-2";
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { reportError, reportNetworkError } from '@/lib/error-management';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  height?: string;
  features?: {
    aiAssistant?: boolean;
    templates?: boolean;
    export?: boolean;
    fullscreen?: boolean;
  };
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Start writing your article...",
  className,
  height = "500px",
  features = {
    aiAssistant: true,
    templates: true,
    export: true,
    fullscreen: true,
  }
}: RichTextEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState<{[key: string]: string}>({});
  const [aiProviders, setAiProviders] = useState<any>({});
  const [selectedProvider, setSelectedProvider] = useState('google-gemini');
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const [currentFormat, setCurrentFormat] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
  });

  useEffect(() => {
    // Update word count
    const text = value.replace(/<[^>]*>/g, '');
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [value]);

  // Load AI providers on mount
  useEffect(() => {
    const loadAiProviders = async () => {
      if (!features.aiAssistant) return;
      
      setIsLoadingProviders(true);
      try {
        const response = await fetch('/api/admin/blog/ai-assistant');
        if (response.ok) {
          const data = await response.json();
          setAiProviders(data.providers);
          setSelectedProvider(data.defaultProvider);
          
          // Set default model for selected provider
          const defaultProvider = data.providers?.[data.defaultProvider];
          const defaultModel = defaultProvider?.models?.[0];
          if (defaultModel) {
            setSelectedModel(defaultModel);
          }
        }
      } catch (error) {
        console.error('Failed to load AI providers:', error);
      } finally {
        setIsLoadingProviders(false);
      }
    };

    loadAiProviders();
  }, [features.aiAssistant]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    updateFormatState();
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const updateFormatState = () => {
    setCurrentFormat({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikethrough: document.queryCommandState('strikeThrough'),
    });
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      setSelectedText(selection.toString());
    } else {
      setSelectedText('');
    }
  };

  const insertTemplate = (template: string) => {
    const templates = {
      introduction: `
        <h2>Introduction</h2>
        <p>Welcome to this comprehensive guide where we'll explore...</p>
      `,
      conclusion: `
        <h2>Conclusion</h2>
        <p>In conclusion, we've covered the key points including...</p>
        <p>What are your thoughts? Share them in the comments below!</p>
      `,
      callToAction: `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; color: white; text-align: center; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">Ready to Get Started?</h3>
          <p style="margin: 0 0 15px 0;">Join thousands of others who have already transformed their approach.</p>
          <button style="background: white; color: #667eea; border: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; cursor: pointer;">Get Started Today</button>
        </div>
      `,
      codeBlock: `
        <pre style="background: #1a1a1a; color: #fff; padding: 20px; border-radius: 8px; overflow-x: auto; margin: 20px 0;">
          <code>// Your code here
function example() {
  return "Hello, World!";
}</code>
        </pre>
      `,
    };
    
    if (editorRef.current) {
      editorRef.current.innerHTML += templates[template as keyof typeof templates];
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleAiSuggestion = async (action: string) => {
    if (!value && !selectedText) {
      alert('Please write some content or select text first.');
      return;
    }

    setIsAiLoading(true);
    try {
      const response = await fetch('/api/admin/blog/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          text: value,
          selectedText: selectedText || undefined,
          provider: selectedProvider,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('AI Assistant API Error:', response.status, errorData);
        
        // Report network error to global error management
        reportNetworkError(
          errorData.error || `AI Assistant API returned ${response.status}`,
          '/api/admin/blog/ai-assistant',
          response.status >= 500 ? 'HIGH' : 'MEDIUM'
        );
        
        throw new Error(errorData.error || `Failed to get AI suggestion (${response.status})`);
      }

      const result = await response.json();
      
      // Store the result for user to review
      setAiResults(prev => ({
        ...prev,
        [action]: result.improvedText
      }));

      console.log(`AI suggestion generated with ${result.provider} (${result.model}):`, result.improvedText.slice(0, 100) + '...');

    } catch (error) {
      console.error('AI suggestion error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Report error to global error management system
      if (errorMessage.includes('API key')) {
        reportError('AI_PROVIDER', 'HIGH', 'AI service configuration missing', {
          endpoint: '/api/admin/blog/ai-assistant',
          description: 'AI provider API keys not configured',
          metadata: { action, provider: selectedProvider, model: selectedModel },
        });
        alert('AI service not configured. Please contact your administrator to set up AI provider API keys.');
      } else if (errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
        reportError('AUTHENTICATION', 'MEDIUM', 'Unauthorized AI assistant access', {
          endpoint: '/api/admin/blog/ai-assistant',
          description: 'User not authenticated for AI features',
          metadata: { action },
        });
        alert('Please log in as an admin to use AI features.');
      } else if (errorMessage.includes('Forbidden') || errorMessage.includes('403')) {
        reportError('AUTHENTICATION', 'MEDIUM', 'Insufficient privileges for AI assistant', {
          endpoint: '/api/admin/blog/ai-assistant',
          description: 'User lacks admin privileges for AI features',
          metadata: { action },
        });
        alert('You need admin privileges to use AI features.');
      } else {
        reportError('AI_PROVIDER', 'MEDIUM', `AI suggestion failed: ${errorMessage}`, {
          endpoint: '/api/admin/blog/ai-assistant',
          description: 'Failed to process AI request',
          requestData: { action, provider: selectedProvider, model: selectedModel },
          metadata: { textLength: value.length, hasSelectedText: !!selectedText },
        });
        alert(`Failed to get AI suggestion: ${errorMessage}`);
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  const applyAiSuggestion = (action: string) => {
    const suggestion = aiResults[action];
    if (!suggestion) return;

    if (selectedText && editorRef.current) {
      // Replace selected text
      const content = editorRef.current.innerHTML;
      const newContent = content.replace(selectedText, suggestion);
      editorRef.current.innerHTML = newContent;
      onChange(newContent);
    } else {
      // Replace entire content
      if (editorRef.current) {
        editorRef.current.innerHTML = suggestion;
        onChange(suggestion);
      }
    }

    // Clear the suggestion after applying
    setAiResults(prev => {
      const newResults = { ...prev };
      delete newResults[action];
      return newResults;
    });
    setSelectedText('');
  };

  const aiSuggestions = [
    { label: "Improve Grammar", action: "grammar", icon: "📝" },
    { label: "Make More Engaging", action: "engage", icon: "✨" },
    { label: "Simplify Language", action: "simplify", icon: "🎯" },
    { label: "Add Examples", action: "examples", icon: "💡" },
    { label: "Create Outline", action: "outline", icon: "📋" },
    { label: "Expand Content", action: "expand", icon: "📈" },
    { label: "Make Shorter", action: "shorten", icon: "✂️" },
    { label: "More Professional", action: "professional", icon: "👔" },
    { label: "More Casual", action: "casual", icon: "😊" },
    { label: "SEO Optimize", action: "seo", icon: "🔍" },
  ];

  const formatButtons = [
    { icon: Bold, command: 'bold', active: currentFormat.bold, tooltip: 'Bold (Ctrl+B)' },
    { icon: Italic, command: 'italic', active: currentFormat.italic, tooltip: 'Italic (Ctrl+I)' },
    { icon: Underline, command: 'underline', active: currentFormat.underline, tooltip: 'Underline (Ctrl+U)' },
    { icon: Strikethrough, command: 'strikeThrough', active: currentFormat.strikethrough, tooltip: 'Strikethrough' },
  ];

  const alignmentButtons = [
    { icon: AlignLeft, command: 'justifyLeft', tooltip: 'Align Left' },
    { icon: AlignCenter, command: 'justifyCenter', tooltip: 'Align Center' },
    { icon: AlignRight, command: 'justifyRight', tooltip: 'Align Right' },
    { icon: AlignJustify, command: 'justifyFull', tooltip: 'Justify' },
  ];

  const headingButtons = [
    { icon: Heading1, command: 'formatBlock', value: 'H1', tooltip: 'Heading 1' },
    { icon: Heading2, command: 'formatBlock', value: 'H2', tooltip: 'Heading 2' },
    { icon: Heading3, command: 'formatBlock', value: 'H3', tooltip: 'Heading 3' },
    { icon: Type, command: 'formatBlock', value: 'P', tooltip: 'Paragraph' },
  ];

  return (
    <div className={cn(
      "w-full",
      isFullscreen && "fixed inset-0 z-50 bg-gray-900 p-4",
      className
    )}>
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 overflow-hidden">
        {/* Toolbar */}
        <div className="border-b border-white/20 p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Professional Editor</span>
              <Badge className="bg-purple-500/20 text-purple-200 border-purple-400/30">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Enhanced
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-white/60">
              <span>{wordCount} words</span>
              <Separator orientation="vertical" className="h-4 bg-white/20" />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsPreview(!isPreview)}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <Eye className="w-4 h-4 mr-1" />
                {isPreview ? 'Edit' : 'Preview'}
              </Button>
              {features.fullscreen && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </Button>
              )}
            </div>
          </div>

          {!isPreview && (
            <div className="flex flex-wrap items-center gap-1">
              {/* Format Buttons */}
              <div className="flex items-center gap-1 mr-2">
                {formatButtons.map((btn) => (
                  <Button
                    key={btn.command}
                    size="sm"
                    variant="ghost"
                    onClick={() => execCommand(btn.command)}
                    className={cn(
                      "w-8 h-8 p-0 text-white/70 hover:text-white hover:bg-white/10",
                      btn.active && "bg-white/20 text-white"
                    )}
                    title={btn.tooltip}
                  >
                    <btn.icon className="w-4 h-4" />
                  </Button>
                ))}
              </div>

              <Separator orientation="vertical" className="h-6 bg-white/20 mr-2" />

              {/* Heading Buttons */}
              <div className="flex items-center gap-1 mr-2">
                {headingButtons.map((btn) => (
                  <Button
                    key={btn.value || btn.command}
                    size="sm"
                    variant="ghost"
                    onClick={() => execCommand(btn.command, btn.value)}
                    className="w-8 h-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
                    title={btn.tooltip}
                  >
                    <btn.icon className="w-4 h-4" />
                  </Button>
                ))}
              </div>

              <Separator orientation="vertical" className="h-6 bg-white/20 mr-2" />

              {/* Alignment Buttons */}
              <div className="flex items-center gap-1 mr-2">
                {alignmentButtons.map((btn) => (
                  <Button
                    key={btn.command}
                    size="sm"
                    variant="ghost"
                    onClick={() => execCommand(btn.command)}
                    className="w-8 h-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
                    title={btn.tooltip}
                  >
                    <btn.icon className="w-4 h-4" />
                  </Button>
                ))}
              </div>

              <Separator orientation="vertical" className="h-6 bg-white/20 mr-2" />

              {/* List Buttons */}
              <div className="flex items-center gap-1 mr-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => execCommand('insertUnorderedList')}
                  className="w-8 h-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
                  title="Bullet List"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => execCommand('insertOrderedList')}
                  className="w-8 h-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
                  title="Numbered List"
                >
                  <ListOrdered className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => execCommand('formatBlock', 'blockquote')}
                  className="w-8 h-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
                  title="Quote"
                >
                  <Quote className="w-4 h-4" />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-6 bg-white/20 mr-2" />

              {/* Insert Buttons */}
              <div className="flex items-center gap-1 mr-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const url = prompt('Enter link URL:');
                    if (url) execCommand('createLink', url);
                  }}
                  className="w-8 h-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
                  title="Insert Link"
                >
                  <Link className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const url = prompt('Enter image URL:');
                    if (url) execCommand('insertImage', url);
                  }}
                  className="w-8 h-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
                  title="Insert Image"
                >
                  <Image className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => insertTemplate('codeBlock')}
                  className="w-8 h-8 p-0 text-white/70 hover:text-white hover:bg-white/10"
                  title="Code Block"
                >
                  <Code className="w-4 h-4" />
                </Button>
              </div>

              {features.aiAssistant && (
                <>
                  <Separator orientation="vertical" className="h-6 bg-white/20 mr-2" />
                  
                  {/* AI Assistant */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsAiAssistantOpen(!isAiAssistantOpen)}
                    className="text-white/70 hover:text-white hover:bg-white/10 px-3"
                  >
                    <Wand2 className="w-4 h-4 mr-1" />
                    AI Assistant
                    {selectedProvider && !isLoadingProviders && (
                      <Badge className="ml-2 bg-purple-500/20 text-purple-200 border-purple-400/30 text-xs">
                        {(aiProviders && aiProviders[selectedProvider]?.name?.split(' ')[0]) || selectedProvider}
                      </Badge>
                    )}
                  </Button>
                </>
              )}

              {features.templates && (
                <>
                  <Separator orientation="vertical" className="h-6 bg-white/20 mr-2" />
                  
                  {/* Templates */}
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => insertTemplate('introduction')}
                      className="text-white/70 hover:text-white hover:bg-white/10 px-2 text-xs"
                    >
                      Intro
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => insertTemplate('conclusion')}
                      className="text-white/70 hover:text-white hover:bg-white/10 px-2 text-xs"
                    >
                      Conclusion
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => insertTemplate('callToAction')}
                      className="text-white/70 hover:text-white hover:bg-white/10 px-2 text-xs"
                    >
                      CTA
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* AI Assistant Panel */}
        {isAiAssistantOpen && !isPreview && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-white/20 bg-purple-500/10 p-3"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-300" />
                <span className="text-purple-300 font-medium">AI Writing Assistant</span>
                {selectedText && (
                  <Badge className="bg-purple-500/20 text-purple-200 border-purple-400/30 text-xs">
                    "{selectedText.slice(0, 20)}..." selected
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isLoadingProviders ? (
                  <Badge className="bg-yellow-500/20 text-yellow-200 border-yellow-400/30 text-xs">
                    Loading...
                  </Badge>
                ) : (
                  <Badge className="bg-green-500/20 text-green-200 border-green-400/30 text-xs">
                    {(aiProviders && aiProviders[selectedProvider]?.name) || 'Ready'}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* AI Provider and Model Selection */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-purple-200 text-xs">AI Provider</Label>
                <Select 
                  value={selectedProvider} 
                  onValueChange={(value) => {
                    setSelectedProvider(value);
                    // Set first model of selected provider as default
                    const firstModel = aiProviders[value]?.models[0];
                    if (firstModel) {
                      setSelectedModel(firstModel);
                    }
                  }}
                  disabled={isLoadingProviders}
                >
                  <SelectTrigger className="bg-purple-500/20 border-purple-400/30 text-purple-200 text-xs h-8">
                    <SelectValue placeholder="Select Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(aiProviders).map(([key, provider]: [string, any]) => (
                      <SelectItem 
                        key={key} 
                        value={key}
                        disabled={!provider.available}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{provider.name}</span>
                          {!provider.available && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              No API Key
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-purple-200 text-xs">Model</Label>
                <Select 
                  value={selectedModel} 
                  onValueChange={setSelectedModel}
                  disabled={isLoadingProviders || !selectedProvider}
                >
                  <SelectTrigger className="bg-purple-500/20 border-purple-400/30 text-purple-200 text-xs h-8">
                    <SelectValue placeholder="Select Model" />
                  </SelectTrigger>
                  <SelectContent>
                    {(aiProviders && aiProviders[selectedProvider]?.models)?.map((model: string) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {aiSuggestions.map((suggestion) => (
                <Button
                  key={suggestion.action}
                  size="sm"
                  variant="outline"
                  onClick={() => handleAiSuggestion(suggestion.action)}
                  disabled={isAiLoading}
                  className="bg-purple-500/20 border-purple-400/30 text-purple-200 hover:bg-purple-500/30 text-xs"
                >
                  {isAiLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                    </motion.div>
                  ) : (
                    <span className="mr-1">{suggestion.icon}</span>
                  )}
                  {suggestion.label}
                </Button>
              ))}
            </div>
            
            {/* AI Results */}
            {Object.keys(aiResults).length > 0 && (
              <div className="mt-4 border-t border-purple-400/30 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-purple-300" />
                  <span className="text-purple-300 font-medium">AI Suggestions</span>
                </div>
                <div className="space-y-3">
                  {Object.entries(aiResults).map(([action, suggestion]) => (
                    <div key={action} className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-purple-200 text-sm font-medium">
                          {aiSuggestions.find(s => s.action === action)?.label}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => applyAiSuggestion(action)}
                            className="bg-green-500/20 border-green-400/30 text-green-200 hover:bg-green-500/30 text-xs"
                          >
                            Apply
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setAiResults(prev => {
                              const newResults = { ...prev };
                              delete newResults[action];
                              return newResults;
                            })}
                            className="bg-red-500/20 border-red-400/30 text-red-200 hover:bg-red-500/30 text-xs"
                          >
                            Dismiss
                          </Button>
                        </div>
                      </div>
                      <div className="text-white/80 text-sm max-h-32 overflow-y-auto bg-black/20 rounded p-2">
                        {suggestion}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Editor Content */}
        <CardContent className="p-0">
          {isPreview ? (
            <div 
              className="p-6 text-white prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: value }}
              style={{ minHeight: height }}
            />
          ) : (
            <div
              ref={editorRef}
              contentEditable
              className={cn(
                "p-6 text-white outline-none",
                "prose prose-invert max-w-none",
                "focus:ring-0 focus:outline-none"
              )}
              style={{ minHeight: height }}
              onInput={() => {
                if (editorRef.current) {
                  onChange(editorRef.current.innerHTML);
                }
              }}
              onMouseUp={handleTextSelection}
              onKeyUp={handleTextSelection}
              dangerouslySetInnerHTML={{ __html: value }}
              data-placeholder={placeholder}
            />
          )}
        </CardContent>

        {/* Footer */}
        <div className="border-t border-white/20 p-3 flex items-center justify-between text-sm text-white/60">
          <div className="flex items-center gap-4">
            <span>{wordCount} words</span>
            <span>• {Math.ceil(wordCount / 200)} min read</span>
          </div>
          
          {features.export && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <Save className="w-4 h-4 mr-1" />
                Auto-save
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}