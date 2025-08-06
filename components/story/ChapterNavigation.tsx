"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ChevronUp, 
  ChevronDown, 
  BookOpen, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Eye,
  EyeOff,
  Menu,
  X
} from "lucide-react";
import { themeConfig } from "@/lib/theme-config";
import { cn } from "@/lib/utils";

interface StoryChapter {
  id: string;
  title: string;
  timestamp: string;
  content: string;
  insights: string[];
  mood?: 'positive' | 'negative' | 'neutral';
  keyPoints: string[];
}

interface ChapterNavigationProps {
  chapters: StoryChapter[];
  activeChapterId?: string;
  onChapterClick: (chapterId: string) => void;
  className?: string;
}

export default function ChapterNavigation({ 
  chapters, 
  activeChapterId, 
  onChapterClick,
  className 
}: ChapterNavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsSticky(scrollTop > 200);
    };

    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      // Auto-collapse on mobile when sticky
      if (mobile && isSticky) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkMobile);
    };
  }, [isSticky]);

  const getMoodIcon = (mood?: string) => {
    switch (mood) {
      case 'positive':
        return <TrendingUp className="h-3 w-3 text-green-400" />;
      case 'negative':
        return <TrendingDown className="h-3 w-3 text-red-400" />;
      default:
        return <Minus className="h-3 w-3 text-gray-400" />;
    }
  };

  const getMoodColor = (mood?: string) => {
    switch (mood) {
      case 'positive':
        return 'bg-green-500/10 border-green-500/20';
      case 'negative':
        return 'bg-red-500/10 border-red-500/20';
      default:
        return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  const handleChapterClick = (chapterId: string) => {
    onChapterClick(chapterId);
    // Close mobile menu after selection
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  if (chapters.length === 0) {
    return null;
  }

  // Mobile floating button when sticky
  if (isMobile && isSticky) {
    return (
      <>
        {/* Mobile floating menu button */}
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn(
              "w-12 h-12 rounded-full shadow-lg",
              "bg-purple-600 hover:bg-purple-700 text-white",
              "border-2 border-purple-400/30"
            )}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile overlay menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="fixed bottom-20 right-4 left-4 max-h-[70vh]" onClick={(e) => e.stopPropagation()}>
              <Card className={cn(
                themeConfig.colors.glass.background,
                themeConfig.colors.glass.border,
                themeConfig.colors.glass.shadow,
                "border backdrop-blur-xl"
              )}>
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-medium text-white">Chapters</span>
                    <Badge variant="outline" className="bg-purple-500/20 border-purple-500/30 text-purple-200 text-xs">
                      {chapters.length}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-gray-400 hover:text-white hover:bg-white/10 p-1 h-6 w-6"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <CardContent className="p-0">
                  <ScrollArea className="p-2 max-h-[50vh]">
                    <div className="space-y-2">
                      {chapters.map((chapter, index) => {
                        const isActive = activeChapterId === chapter.id;
                        
                        return (
                          <Button
                            key={chapter.id}
                            variant="ghost"
                            className={cn(
                              "w-full justify-start text-left h-auto p-3",
                              "hover:bg-white/10 transition-colors",
                              "touch-manipulation", // Better touch handling
                              isActive && "bg-purple-500/20 border border-purple-500/30"
                            )}
                            onClick={() => handleChapterClick(chapter.id)}
                          >
                            <div className="flex items-start gap-3 w-full">
                              {/* Chapter Number */}
                              <div className={cn(
                                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold", // Larger for touch
                                isActive 
                                  ? "bg-purple-500 text-white" 
                                  : "bg-white/10 text-gray-300"
                              )}>
                                {index + 1}
                              </div>
                              
                              {/* Chapter Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-sm font-medium text-white truncate">
                                    {chapter.title}
                                  </h4>
                                  {getMoodIcon(chapter.mood)}
                                </div>
                                
                                <p className="text-xs text-gray-400 mb-2">
                                  {chapter.timestamp}
                                </p>
                                
                                {/* Quick Stats */}
                                <div className="flex items-center gap-2 text-xs">
                                  {chapter.keyPoints.length > 0 && (
                                    <Badge className={cn("text-xs py-0 px-1", getMoodColor(chapter.mood))}>
                                      {chapter.keyPoints.length} points
                                    </Badge>
                                  )}
                                  {chapter.insights.length > 0 && (
                                    <Badge className="bg-yellow-500/10 border-yellow-500/20 text-yellow-200 text-xs py-0 px-1">
                                      {chapter.insights.length} insights
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop/tablet version
  return (
    <div 
      className={cn(
        "transition-all duration-300",
        isSticky ? "fixed top-4 right-4 z-50" : "sticky top-4",
        className
      )}
    >
      <Card className={cn(
        themeConfig.colors.glass.background,
        themeConfig.colors.glass.border,
        themeConfig.colors.glass.shadow,
        "border backdrop-blur-xl",
        themeConfig.animation.transition,
        "hover:bg-white/[0.15]",
        isSticky ? (isMobile ? "w-full max-w-xs" : "w-80") : "w-full max-w-sm"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium text-white">Chapters</span>
            <Badge variant="outline" className="bg-purple-500/20 border-purple-500/30 text-purple-200 text-xs">
              {chapters.length}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-white hover:bg-white/10 p-1 h-6 w-6"
          >
            {isCollapsed ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          </Button>
        </div>

        {!isCollapsed && (
          <CardContent className="p-0">
            <ScrollArea className={cn("p-2", isSticky ? "max-h-[60vh]" : "max-h-96")}>
              <div className="space-y-2">
                {chapters.map((chapter, index) => {
                  const isActive = activeChapterId === chapter.id;
                  
                  return (
                    <Button
                      key={chapter.id}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-left h-auto p-3",
                        "hover:bg-white/10 transition-colors",
                        "touch-manipulation", // Better touch handling
                        isActive && "bg-purple-500/20 border border-purple-500/30"
                      )}
                      onClick={() => handleChapterClick(chapter.id)}
                    >
                      <div className="flex items-start gap-3 w-full">
                        {/* Chapter Number */}
                        <div className={cn(
                          "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                          isActive 
                            ? "bg-purple-500 text-white" 
                            : "bg-white/10 text-gray-300"
                        )}>
                          {index + 1}
                        </div>
                        
                        {/* Chapter Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium text-white truncate">
                              {chapter.title}
                            </h4>
                            {getMoodIcon(chapter.mood)}
                          </div>
                          
                          <p className="text-xs text-gray-400 mb-2">
                            {chapter.timestamp}
                          </p>
                          
                          {/* Quick Stats */}
                          <div className="flex items-center gap-2 text-xs">
                            {chapter.keyPoints.length > 0 && (
                              <Badge className={cn("text-xs py-0 px-1", getMoodColor(chapter.mood))}>
                                {chapter.keyPoints.length} points
                              </Badge>
                            )}
                            {chapter.insights.length > 0 && (
                              <Badge className="bg-yellow-500/10 border-yellow-500/20 text-yellow-200 text-xs py-0 px-1">
                                {chapter.insights.length} insights
                              </Badge>
                            )}
                          </div>
                          
                          {/* Content Preview */}
                          {isActive && (
                            <p className="text-xs text-gray-300 mt-2 line-clamp-2">
                              {chapter.content.substring(0, 100)}...
                            </p>
                          )}
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        )}
      </Card>
    </div>
  );
}