"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { X, Send, Copy, ThumbsUp, ThumbsDown, Download, Share2, Sparkles, MessageCircle, Clock, User, Bot } from "lucide-react";
import MoreHorizontal from "lucide-react/dist/esm/icons/more-horizontal";
import { motion, AnimatePresence } from "framer-motion";
import { themeConfig } from "@/lib/theme-config";
import { cn } from "@/lib/utils";
import type { AnalysisResult } from "@/app/actions/analyze";
import {
  getSelectedModel,
  getApiKey,
  getSelectedAnalysisTemplate,
} from "@/lib/settings";
import { getProviderConfig } from "@/lib/ai-providers-client";
import { getTemplateById } from "@/app/actions/templates";

interface CoachChatProps {
  analysisData?: AnalysisResult | null;
  onClose: () => void;
}

interface Message {
  role: "user" | "assistant" | "error";
  content: string;
  timestamp?: Date;
  id?: string;
}

export default function CoachChat({ analysisData, onClose }: CoachChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [templateInfo, setTemplateInfo] = useState<{
    name: string;
    icon: string;
  } | null>(null);

  // Initialize with template-specific greeting
  useEffect(() => {
    const loadTemplate = async () => {
      const templateId = await getSelectedAnalysisTemplate();
      if (templateId) {
        try {
          const result = await getTemplateById(templateId);
          if (result.success && result.data) {
            setTemplateInfo({ name: result.data.name, icon: result.data.icon });
          }
        } catch (error) {
          console.error("Failed to load template:", error);
        }
      }
    };

    loadTemplate();
  }, []);

  useEffect(() => {
    if (templateInfo && analysisData) {
      const greetingMessage = `Hello! I'm your AI communication coach specializing in ${templateInfo.name} ${templateInfo.icon}. I've analyzed your conversation${analysisData?.detectedLanguage ? ` (detected language: ${analysisData.detectedLanguage})` : ""} and I'm here to help you understand the insights better. What would you like to know?`;

      setMessages([
        {
          role: "assistant",
          content: greetingMessage,
          timestamp: new Date(),
          id: `msg-${Date.now()}`,
        },
      ]);
    } else {
      setMessages([
        {
          role: "assistant",
          content:
            "Hello! I'm your AI communication coach. I've analyzed your conversation and I'm here to help you understand the insights better. What would you like to know?",
          timestamp: new Date(),
          id: `msg-${Date.now()}`,
        },
      ]);
    }
  }, [analysisData, templateInfo]);

  const suggestedQuestions = templateInfo
    ? [
        `What are my main strengths in ${templateInfo.name.toLowerCase()}?`,
        `How can I improve my ${templateInfo.name.toLowerCase()} style?`,
        `What patterns did you notice specific to ${templateInfo.name.toLowerCase()}?`,
        "What emotions were most prominent in our conversation?",
        `How can I be more effective in similar ${templateInfo.name.toLowerCase()} situations?`,
      ]
    : [
        "What are my main communication strengths?",
        "How can I improve my communication style?",
        "What patterns did you notice in my conversation?",
        "What emotions were most prominent in our chat?",
        "How can I be more effective in similar conversations?",
      ];
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isStreamingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      isStreamingRef.current = false;
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, streamingMessage]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !analysisData) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    setStreamingMessage("");
    isStreamingRef.current = true;

    try {
      // Get current model selection and API key
      const selection = await getSelectedModel();
      const providerConfig = getProviderConfig(selection.provider);

      if (!providerConfig) {
        throw new Error("Invalid provider configuration.");
      }

      const apiKey = await getApiKey(providerConfig.apiKeyName);
      if (!apiKey) {
        throw new Error(`No API key configured for ${providerConfig.name}.`);
      }

      // Prepare the request
      const requestBody = {
        messages: [...messages, { role: "user", content: userMessage }],
        analysisData,
        provider: selection.provider,
        modelId: selection.modelId,
        apiKey,
      };

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      // Call the streaming API
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulatedResponse += chunk;

          if (isStreamingRef.current) {
            setStreamingMessage(accumulatedResponse);
          }
        }
      }

      // Finalize the response
      if (isStreamingRef.current) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: accumulatedResponse },
        ]);
        setStreamingMessage("");
      }
    } catch (error) {
      console.error("Coach chat error:", error);
      // Don't add error as a regular message, show it in a better way
      setMessages((prev) => [
        ...prev,
        {
          role: "error",
          content:
            error instanceof Error ? error.message : "Unknown error occurred",
        },
      ]);
    } finally {
      setIsLoading(false);
      isStreamingRef.current = false;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl"
        >
          <Card className="h-[85vh] max-h-screen flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b shrink-0">
              <CardTitle>AI Communication Coach</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col min-h-0">
              <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      } group`}
                    >
                      <div className="flex items-start space-x-2 max-w-[85%]">
                        {/* Avatar */}
                        {message.role !== "user" && (
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                            message.role === "error" 
                              ? "bg-red-500/20 text-red-400" 
                              : "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                          )}>
                            {message.role === "error" ? "⚠️" : <Bot className="h-4 w-4" />}
                          </div>
                        )}
                        
                        <div className="flex-1">
                          {/* Message Bubble */}
                          <div
                            className={cn(
                              "rounded-2xl px-4 py-3 relative group/message",
                              message.role === "user"
                                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white ml-auto"
                                : message.role === "error"
                                  ? "bg-red-500/10 border border-red-500/20 text-red-300"
                                  : "bg-white/10 backdrop-blur-md border border-white/20 text-white"
                            )}
                          >
                            {message.role === "error" && (
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="destructive" className="text-xs">
                                  Error
                                </Badge>
                              </div>
                            )}
                            
                            <div 
                              className="text-sm whitespace-pre-wrap leading-relaxed"
                              dir="auto"
                              style={{
                                unicodeBidi: 'plaintext',
                                textAlign: 'start',
                                lineHeight: '1.6',
                                wordBreak: 'break-word',
                                textRendering: 'optimizeLegibility'
                              }}
                            >
                              {message.content}
                            </div>
                            
                            {/* Timestamp */}
                            {message.timestamp && showTimestamps && (
                              <div className="flex items-center gap-1 mt-2 text-xs opacity-60">
                                <Clock className="h-3 w-3" />
                                {message.timestamp.toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                            )}
                            
                            {/* Message Actions */}
                            {message.role === "assistant" && (
                              <div className="opacity-0 group-hover/message:opacity-100 transition-opacity absolute -bottom-8 left-0 flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20"
                                  onClick={() => navigator.clipboard.writeText(message.content)}
                                >
                                  <Copy className="h-3 w-3 mr-1" />
                                  Copy
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20"
                                >
                                  <ThumbsUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20"
                                >
                                  <ThumbsDown className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                            
                            {message.role === "error" && (
                              <p className="text-xs mt-2 opacity-70">
                                Please try again or check your API settings.
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* User Avatar */}
                        {message.role === "user" && (
                          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                            <User className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {/* Show streaming message */}
                  {streamingMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="max-w-[80%] bg-muted rounded-lg px-4 py-2">
                        <p className="text-sm whitespace-pre-wrap">
                          {streamingMessage}
                        </p>
                        <motion.div
                          className="w-2 h-4 bg-foreground/50 inline-block ml-1"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                        />
                      </div>
                    </motion.div>
                  )}
                  {/* Show loading indicator when starting */}
                  {isLoading && !streamingMessage && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-muted rounded-lg px-4 py-2">
                        <div className="flex space-x-2">
                          <motion.div
                            className="w-2 h-2 bg-foreground/50 rounded-full"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-foreground/50 rounded-full"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{
                              repeat: Infinity,
                              duration: 1.5,
                              delay: 0.2,
                            }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-foreground/50 rounded-full"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{
                              repeat: Infinity,
                              duration: 1.5,
                              delay: 0.4,
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>
              <div className="border-t">
                {/* Suggested Questions - only show if conversation just started */}
                {messages.length === 1 && (
                  <div className="p-4 border-b bg-muted/20">
                    <p className="text-sm font-medium text-muted-foreground mb-3">
                      💡 Try asking:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedQuestions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => setInput(question)}
                          disabled={isLoading}
                          className="text-xs px-3 py-2 bg-background hover:bg-primary/10 hover:text-primary rounded-lg border border-border/50 transition-all duration-200 disabled:opacity-50 hover:border-primary/20"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="p-4 bg-background">
                  <div className="flex space-x-3">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me about your communication patterns..."
                      disabled={isLoading}
                      className="flex-1 min-h-[44px]"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      size="icon"
                      className="h-[44px] w-[44px] shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
