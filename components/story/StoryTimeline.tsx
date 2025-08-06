"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { themeConfig } from "@/lib/theme-config";
import { cn } from "@/lib/utils";
import { BookOpen, Clock, Lightbulb, TrendingUp, TrendingDown, Minus } from "lucide-react";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import ChapterNavigation from "./ChapterNavigation";

interface StoryChapter {
  id: string;
  title: string;
  timestamp: string;
  content: string;
  insights: string[];
  mood?: 'positive' | 'negative' | 'neutral';
  keyPoints: string[];
}

interface StoryContent {
  title: string;
  overview: string;
  chapters: StoryChapter[];
  conclusion: string;
  timeline: {
    start: string;
    end: string;
    duration: string;
  };
  keyInsights: string[];
}

interface StoryTimelineProps {
  storyContent: StoryContent;
}

export default function StoryTimeline({ storyContent }: StoryTimelineProps) {
  const [activeChapterId, setActiveChapterId] = useState<string | undefined>(
    storyContent.chapters.length > 0 ? storyContent.chapters[0].id : undefined
  );

  const handleChapterClick = (chapterId: string) => {
    setActiveChapterId(chapterId);
    const element = document.getElementById(`chapter-${chapterId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const chapterElements = storyContent.chapters.map(chapter => 
        document.getElementById(`chapter-${chapter.id}`)
      ).filter(Boolean);

      let currentChapter = storyContent.chapters[0]?.id;
      
      for (const element of chapterElements) {
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            const chapterId = element.id.replace('chapter-', '');
            currentChapter = chapterId;
            break;
          }
        }
      }
      
      if (currentChapter !== activeChapterId) {
        setActiveChapterId(currentChapter);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [storyContent.chapters, activeChapterId]);
  const getMoodIcon = (mood?: string) => {
    switch (mood) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-400" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getMoodColor = (mood?: string) => {
    switch (mood) {
      case 'positive':
        return 'border-l-green-400 bg-green-500/5';
      case 'negative':
        return 'border-l-red-400 bg-red-500/5';
      default:
        return 'border-l-gray-400 bg-gray-500/5';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
      {/* Main Story Content */}
      <div className="flex-1 space-y-6 lg:space-y-8">
      {/* Story Overview */}
      <Card className={cn(
        themeConfig.colors.glass.background,
        themeConfig.colors.glass.border,
        themeConfig.colors.glass.shadow,
        "border backdrop-blur-xl",
        themeConfig.animation.transition,
        "hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10"
      )}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <BookOpen className="h-5 w-5" />
            Story Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 text-lg leading-relaxed">
            {storyContent.overview}
          </p>
          
          {/* Timeline Summary */}
          <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-white">Timeline</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm">
              <div className="flex flex-col sm:block">
                <span className="text-gray-400">Start: </span>
                <span className="text-white font-medium">{storyContent.timeline.start}</span>
              </div>
              <div className="flex flex-col sm:block">
                <span className="text-gray-400">End: </span>
                <span className="text-white font-medium">{storyContent.timeline.end}</span>
              </div>
              <div className="flex flex-col sm:block">
                <span className="text-gray-400">Duration: </span>
                <span className="text-white font-medium">{storyContent.timeline.duration}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Story Chapters Timeline */}
      <div className="relative">
        {/* Timeline Line - responsive positioning */}
        <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-purple-400 via-blue-400 to-green-400 opacity-30"></div>
        
        <div className="space-y-6 sm:space-y-8">
          {storyContent.chapters.map((chapter, index) => (
            <div key={chapter.id} id={`chapter-${chapter.id}`} className="relative">
              {/* Timeline Node - responsive positioning */}
              <div className="absolute left-2.5 sm:left-6 w-3 h-3 sm:w-4 sm:h-4 bg-purple-500 rounded-full border-2 border-white shadow-lg z-10"></div>
              
              {/* Chapter Content - responsive margin */}
              <div className="ml-8 sm:ml-16">
                <Card className={cn(
                  themeConfig.colors.glass.background,
                  themeConfig.colors.glass.border,
                  themeConfig.colors.glass.shadow,
                  "border backdrop-blur-xl border-l-4",
                  themeConfig.animation.transition,
                  "hover:bg-white/[0.15] hover:shadow-lg hover:shadow-purple-500/5",
                  getMoodColor(chapter.mood)
                )}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white text-lg">
                          {chapter.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="bg-white/10 border-white/20 text-white">
                            {chapter.timestamp}
                          </Badge>
                          <div className="flex items-center gap-1">
                            {getMoodIcon(chapter.mood)}
                            <span className="text-xs text-gray-400 capitalize">
                              {chapter.mood || 'neutral'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-purple-600/20 border-purple-500/30 text-purple-200">
                        Chapter {index + 1}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {chapter.content}
                      </p>
                    </div>

                    {/* Key Points */}
                    {chapter.keyPoints.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          Key Points
                        </h4>
                        <ul className="space-y-2">
                          {chapter.keyPoints.map((point, pointIndex) => (
                            <li key={pointIndex} className="flex items-start gap-2 text-sm text-gray-300">
                              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Insights */}
                    {chapter.insights.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-yellow-400" />
                          Insights
                        </h4>
                        <div className="grid gap-2">
                          {chapter.insights.map((insight, insightIndex) => (
                            <div key={insightIndex} className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-sm text-yellow-100">
                              {insight}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Story Conclusion */}
      <Card className={cn(
        themeConfig.colors.glass.background,
        themeConfig.colors.glass.border,
        themeConfig.colors.glass.shadow,
        "border backdrop-blur-xl border-l-4 border-l-green-400 bg-green-500/5",
        themeConfig.animation.transition,
        "hover:bg-white/[0.15] hover:shadow-lg hover:shadow-green-500/5"
      )}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <CheckCircle className="h-5 w-5 text-green-400" />
            Conclusion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
            {storyContent.conclusion}
          </p>
        </CardContent>
      </Card>

      {/* Key Insights Summary */}
      {storyContent.keyInsights.length > 0 && (
        <Card className={cn(
          themeConfig.colors.glass.background,
          themeConfig.colors.glass.border,
          themeConfig.colors.glass.shadow,
          "border backdrop-blur-xl",
          themeConfig.animation.transition,
          "hover:bg-white/[0.15] hover:shadow-lg hover:shadow-purple-500/5"
        )}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Lightbulb className="h-5 w-5 text-yellow-400" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              {storyContent.keyInsights.map((insight, index) => (
                <div key={index} className="p-3 sm:p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-purple-100 text-sm leading-relaxed">
                      {insight}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      </div>

      {/* Chapter Navigation Sidebar - now responsive */}
      <div className="w-full lg:w-80">
        <ChapterNavigation
          chapters={storyContent.chapters}
          activeChapterId={activeChapterId}
          onChapterClick={handleChapterClick}
        />
      </div>
    </div>
  );
}