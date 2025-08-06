"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { themeConfig } from "@/lib/theme-config";
import { cn } from "@/lib/utils";

// Story Grid Skeleton - matches the stories list page layout
export function StoryGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={i}
          className={cn(
            themeConfig.colors.glass.background,
            themeConfig.colors.glass.border,
            themeConfig.colors.glass.shadow,
            "border backdrop-blur-xl group relative overflow-hidden",
            themeConfig.animation.transition,
            "hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10"
          )}
          style={{
            animationDelay: `${i * 100}ms`,
            animation: "fadeInUp 0.6s ease-out forwards"
          }}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 space-y-2">
                {/* Story title */}
                <Skeleton className="h-4 w-3/4 bg-white/10" />
                {/* File name */}
                <Skeleton className="h-3 w-1/2 bg-white/10" />
              </div>
              {/* Status badge */}
              <Skeleton className="h-6 w-20 bg-white/10 rounded-full" />
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {/* Content preview */}
            <div className="mb-4 space-y-2">
              <Skeleton className="h-3 w-full bg-white/10" />
              <Skeleton className="h-3 w-4/5 bg-white/10" />
              <Skeleton className="h-3 w-3/5 bg-white/10" />
            </div>
            
            {/* Metadata */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 bg-white/10 rounded-full" />
                <Skeleton className="h-3 w-24 bg-white/10" />
                <Skeleton className="h-3 w-2 bg-white/10 rounded-full" />
                <Skeleton className="h-3 w-16 bg-white/10" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 bg-white/10 rounded-full" />
                <Skeleton className="h-3 w-20 bg-white/10" />
                <Skeleton className="h-3 w-2 bg-white/10 rounded-full" />
                <Skeleton className="h-3 w-16 bg-white/10" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 bg-white/10 rounded-full" />
                <Skeleton className="h-3 w-18 bg-white/10" />
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 flex-1 bg-white/10 rounded-md" />
              <Skeleton className="h-8 w-8 bg-white/10 rounded-md" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Story Metadata Skeleton - matches the individual story page metadata cards
export function StoryMetadataSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card
          key={i}
          className={cn(
            themeConfig.colors.glass.background,
            themeConfig.colors.glass.border,
            themeConfig.colors.glass.shadow,
            "border backdrop-blur-xl"
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-20 bg-white/10" />
            <Skeleton className="h-8 w-8 bg-white/10 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-5 w-24 bg-white/10 mb-1" />
            <Skeleton className="h-3 w-16 bg-white/10" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Story Timeline Skeleton - matches the timeline layout with chapters
export function StoryTimelineSkeleton({ chapterCount = 5 }: { chapterCount?: number }) {
  return (
    <div className="flex gap-8">
      {/* Main Story Content */}
      <div className="flex-1 space-y-8">
        {/* Story Overview Skeleton */}
        <Card 
          className={cn(
            themeConfig.colors.glass.background,
            themeConfig.colors.glass.border,
            themeConfig.colors.glass.shadow,
            "border backdrop-blur-xl",
            themeConfig.animation.transition,
            "hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10"
          )}
          style={{
            animation: "fadeInUp 0.6s ease-out forwards"
          }}
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 bg-white/10 rounded" />
              <Skeleton className="h-5 w-32 bg-white/10" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-6">
              <Skeleton className="h-4 w-full bg-white/10" />
              <Skeleton className="h-4 w-4/5 bg-white/10" />
              <Skeleton className="h-4 w-3/5 bg-white/10" />
            </div>
            
            {/* Timeline Summary */}
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Skeleton className="h-4 w-4 bg-white/10 rounded" />
                <Skeleton className="h-4 w-16 bg-white/10" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Skeleton className="h-3 w-8 bg-white/10 mb-1" />
                  <Skeleton className="h-4 w-24 bg-white/10" />
                </div>
                <div>
                  <Skeleton className="h-3 w-6 bg-white/10 mb-1" />
                  <Skeleton className="h-4 w-24 bg-white/10" />
                </div>
                <div>
                  <Skeleton className="h-3 w-12 bg-white/10 mb-1" />
                  <Skeleton className="h-4 w-24 bg-white/10" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Chapters Skeleton */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-purple-400 via-blue-400 to-green-400 opacity-30"></div>
          
          <div className="space-y-8">
            {Array.from({ length: chapterCount }).map((_, index) => (
              <div 
                key={index} 
                className="relative"
                style={{
                  animationDelay: `${(index + 1) * 200}ms`,
                  animation: "fadeInUp 0.6s ease-out forwards"
                }}
              >
                {/* Timeline Node */}
                <div className="absolute left-6 w-4 h-4 bg-purple-500 rounded-full border-2 border-white shadow-lg z-10 animate-pulse"></div>
                
                {/* Chapter Content */}
                <div className="ml-16">
                  <Card className={cn(
                    themeConfig.colors.glass.background,
                    themeConfig.colors.glass.border,
                    themeConfig.colors.glass.shadow,
                    "border backdrop-blur-xl border-l-4 border-l-gray-400 bg-gray-500/5",
                    themeConfig.animation.transition,
                    "hover:bg-white/[0.15] hover:shadow-lg hover:shadow-purple-500/5"
                  )}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-3/4 bg-white/10" />
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-20 bg-white/10 rounded-full" />
                            <div className="flex items-center gap-1">
                              <Skeleton className="h-3 w-3 bg-white/10 rounded" />
                              <Skeleton className="h-3 w-12 bg-white/10" />
                            </div>
                          </div>
                        </div>
                        <Skeleton className="h-6 w-20 bg-white/10 rounded-full" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Chapter content */}
                      <div className="space-y-2 mb-6">
                        <Skeleton className="h-4 w-full bg-white/10" />
                        <Skeleton className="h-4 w-5/6 bg-white/10" />
                        <Skeleton className="h-4 w-4/5 bg-white/10" />
                        <Skeleton className="h-4 w-3/4 bg-white/10" />
                      </div>

                      {/* Key Points */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Skeleton className="h-4 w-4 bg-white/10 rounded" />
                          <Skeleton className="h-4 w-20 bg-white/10" />
                        </div>
                        <div className="space-y-2">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <Skeleton className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                              <Skeleton className="h-3 w-4/5 bg-white/10" />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Insights */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Skeleton className="h-4 w-4 bg-white/10 rounded" />
                          <Skeleton className="h-4 w-16 bg-white/10" />
                        </div>
                        <div className="grid gap-2">
                          {Array.from({ length: 2 }).map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                              <div className="space-y-2">
                                <Skeleton className="h-3 w-full bg-yellow-400/20" />
                                <Skeleton className="h-3 w-3/4 bg-yellow-400/20" />
                              </div>
                            </Skeleton>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conclusion Skeleton */}
        <Card className={cn(
          themeConfig.colors.glass.background,
          themeConfig.colors.glass.border,
          themeConfig.colors.glass.shadow,
          "border backdrop-blur-xl border-l-4 border-l-green-400 bg-green-500/5"
        )}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 bg-white/10 rounded" />
              <Skeleton className="h-5 w-24 bg-white/10" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full bg-white/10" />
              <Skeleton className="h-4 w-4/5 bg-white/10" />
              <Skeleton className="h-4 w-3/5 bg-white/10" />
            </div>
          </CardContent>
        </Card>

        {/* Key Insights Summary Skeleton */}
        <Card className={cn(
          themeConfig.colors.glass.background,
          themeConfig.colors.glass.border,
          themeConfig.colors.glass.shadow,
          "border backdrop-blur-xl"
        )}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 bg-white/10 rounded" />
              <Skeleton className="h-5 w-28 bg-white/10" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-start gap-3">
                    <Skeleton className="w-6 h-6 bg-purple-500 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-full bg-white/10" />
                      <Skeleton className="h-3 w-4/5 bg-white/10" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chapter Navigation Sidebar Skeleton */}
      <div className="hidden lg:block w-80">
        <ChapterNavigationSkeleton chapterCount={chapterCount} />
      </div>
    </div>
  );
}

// Chapter Navigation Skeleton - matches the sidebar navigation
export function ChapterNavigationSkeleton({ chapterCount = 5 }: { chapterCount?: number }) {
  return (
    <div 
      className="sticky top-4"
      style={{
        animation: "fadeInUp 0.6s ease-out forwards",
        animationDelay: "400ms"
      }}
    >
      <Card className={cn(
        themeConfig.colors.glass.background,
        themeConfig.colors.glass.border,
        themeConfig.colors.glass.shadow,
        "border backdrop-blur-xl w-full max-w-sm",
        themeConfig.animation.transition,
        "hover:bg-white/[0.15]"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 bg-white/10 rounded" />
            <Skeleton className="h-4 w-16 bg-white/10" />
            <Skeleton className="h-5 w-6 bg-purple-500/20 rounded-full" />
          </div>
          <Skeleton className="h-6 w-6 bg-white/10 rounded" />
        </div>

        <CardContent className="p-0">
          <div className="p-2 space-y-2 max-h-96 overflow-hidden">
            {Array.from({ length: chapterCount }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-full p-3 rounded transition-colors",
                  "hover:bg-white/10",
                  index === 0 && "bg-purple-500/20 border border-purple-500/30"
                )}
                style={{
                  animationDelay: `${(index + 5) * 100}ms`,
                  animation: "fadeInUp 0.4s ease-out forwards"
                }}
              >
                <div className="flex items-start gap-3 w-full">
                  {/* Chapter Number */}
                  <Skeleton className={cn(
                    "flex-shrink-0 w-6 h-6 rounded-full",
                    index === 0 ? "bg-purple-500" : "bg-white/10"
                  )} />
                  
                  {/* Chapter Info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-3/4 bg-white/10" />
                      <Skeleton className="h-3 w-3 bg-white/10 rounded" />
                    </div>
                    
                    <Skeleton className="h-3 w-1/2 bg-white/10" />
                    
                    {/* Quick Stats */}
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-12 bg-gray-500/10 border border-gray-500/20 rounded-full" />
                      <Skeleton className="h-4 w-16 bg-yellow-500/10 border border-yellow-500/20 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Story Header Skeleton - matches the story page header
export function StoryHeaderSkeleton() {
  return (
    <div className="text-center mb-8">
      <Skeleton className="h-6 w-24 bg-white/10 rounded-full mx-auto mb-4" />
      <Skeleton className="h-8 w-3/4 bg-white/10 mx-auto mb-2" />
      <Skeleton className="h-4 w-1/2 bg-white/10 mx-auto mb-4" />
      <div className="flex items-center justify-center gap-4 mb-4">
        <Skeleton className="h-8 w-32 bg-white/10 rounded" />
        <Skeleton className="h-6 w-20 bg-white/10 rounded-full" />
        <Skeleton className="h-8 w-40 bg-white/10 rounded" />
      </div>
    </div>
  );
}

// Loading State Skeleton - matches the generating story state
export function StoryLoadingSkeleton() {
  return (
    <Card className={cn(
      themeConfig.colors.glass.background,
      themeConfig.colors.glass.border,
      themeConfig.colors.glass.shadow,
      "border backdrop-blur-xl"
    )}>
      <CardContent className="py-12">
        <div className="text-center">
          <div className="relative mx-auto mb-4 w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-purple-400/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-400 animate-spin"></div>
          </div>
          <Skeleton className="h-6 w-48 bg-white/10 mx-auto mb-2" />
          <Skeleton className="h-4 w-64 bg-white/10 mx-auto mb-4" />
          <Skeleton className="h-3 w-56 bg-white/10 mx-auto" />
          
          {/* Progress indicator */}
          <div className="mt-6 max-w-xs mx-auto">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>Generating...</span>
              <span>~2 min</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full animate-pulse" style={{ width: '45%' }}></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced Story Card Skeleton - for individual story cards with more detail
export function StoryCardSkeleton() {
  return (
    <Card className={cn(
      themeConfig.colors.glass.background,
      themeConfig.colors.glass.border,
      themeConfig.colors.glass.shadow,
      "border backdrop-blur-xl group relative overflow-hidden",
      themeConfig.animation.transition,
      "hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-4 w-3/4 bg-white/10" />
            <Skeleton className="h-3 w-1/2 bg-white/10" />
          </div>
          <Skeleton className="h-6 w-20 bg-white/10 rounded-full" />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Content preview with more realistic line lengths */}
        <div className="mb-4 space-y-2">
          <Skeleton className="h-3 w-full bg-white/10" />
          <Skeleton className="h-3 w-11/12 bg-white/10" />
          <Skeleton className="h-3 w-4/5 bg-white/10" />
        </div>
        
        {/* Metadata with icons */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 bg-white/10 rounded-full" />
            <Skeleton className="h-3 w-20 bg-white/10" />
            <Skeleton className="h-3 w-2 bg-white/10 rounded-full" />
            <Skeleton className="h-3 w-16 bg-white/10" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 bg-white/10 rounded-full" />
            <Skeleton className="h-3 w-16 bg-white/10" />
            <Skeleton className="h-3 w-2 bg-white/10 rounded-full" />
            <Skeleton className="h-3 w-12 bg-white/10" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 bg-white/10 rounded-full" />
            <Skeleton className="h-3 w-18 bg-white/10" />
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 flex-1 bg-purple-600/20 border border-purple-500/30 rounded-md" />
          <Skeleton className="h-8 w-8 bg-red-600/20 border border-red-500/30 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

// Story Filter Skeleton - for the filter controls
export function StoryFilterSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <div className="relative flex-1">
        <Skeleton className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/10 rounded" />
        <Skeleton className="h-10 w-full bg-white/5 border border-white/20 rounded-md pl-10" />
      </div>
      <div className="flex items-center gap-2 min-w-[180px]">
        <Skeleton className="h-4 w-4 bg-white/10 rounded" />
        <Skeleton className="h-10 flex-1 bg-white/5 border border-white/20 rounded-md" />
      </div>
      <Skeleton className="h-10 w-10 bg-white/5 border border-white/20 rounded-md" />
    </div>
  );
}

// Empty State Skeleton - for when there are no stories
export function StoryEmptyStateSkeleton() {
  return (
    <Card className={cn(
      themeConfig.colors.glass.background,
      themeConfig.colors.glass.border,
      "border backdrop-blur-xl"
    )}>
      <CardContent className="py-12">
        <div className="text-center">
          <Skeleton className="h-12 w-12 bg-white/10 rounded mx-auto mb-4" />
          <Skeleton className="h-6 w-48 bg-white/10 mx-auto mb-2" />
          <Skeleton className="h-4 w-64 bg-white/10 mx-auto mb-4" />
          <Skeleton className="h-10 w-40 bg-purple-600/20 border border-purple-500/30 rounded mx-auto" />
        </div>
      </CardContent>
    </Card>
  );
}

// Pagination Skeleton - matches the stories list pagination
export function PaginationSkeleton() {
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Skeleton className="h-8 w-20 bg-white/10 rounded" />
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-8 bg-white/10 rounded" />
        ))}
      </div>
      <Skeleton className="h-8 w-16 bg-white/10 rounded" />
    </div>
  );
}