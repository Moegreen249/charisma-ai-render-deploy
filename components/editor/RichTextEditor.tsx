'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Link,
  Image,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Palette,
  Eye,
  Undo,
  Redo,
  Save,
  FileText,
  Download,
  Upload,
  Maximize,
  Minimize,
  Zap,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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

  const aiSuggestions = [
    { label: "Improve Grammar", action: "grammar" },
    { label: "Make More Engaging", action: "engage" },
    { label: "Simplify Language", action: "simplify" },
    { label: "Add Examples", action: "examples" },
    { label: "Create Outline", action: "outline" },
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
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-300" />
                <span className="text-purple-300 font-medium">AI Writing Assistant</span>
                {selectedText && (
                  <Badge className="bg-purple-500/20 text-purple-200 border-purple-400/30 text-xs">
                    "{selectedText.slice(0, 20)}..." selected
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {aiSuggestions.map((suggestion) => (
                <Button
                  key={suggestion.action}
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // AI suggestion implementation would go here
                    console.log(`AI action: ${suggestion.action}`, selectedText || 'full text');
                  }}
                  className="bg-purple-500/20 border-purple-400/30 text-purple-200 hover:bg-purple-500/30 text-xs"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  {suggestion.label}
                </Button>
              ))}
            </div>
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