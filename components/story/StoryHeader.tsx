"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Crown, Share2, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoryHeaderProps {
  title: string;
  status: string;
  onShare?: () => void;
  onDownload?: () => void;
}

export default function StoryHeader({ title, status, onShare, onDownload }: StoryHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Badge className="bg-purple-600/20 border-purple-500/30 text-purple-200">
          <BookOpen className="w-4 h-4 mr-2" />
          <Crown className="w-3 h-3 mr-1 text-yellow-400" />
          AI Story
        </Badge>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
      </div>
      
      <div className="flex items-center gap-2">
        {onShare && (
          <Button
            variant="outline"
            size="sm"
            onClick={onShare}
            className="bg-white/5 border-white/20 text-white hover:bg-white/10"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        )}
        {onDownload && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDownload}
            className="bg-white/5 border-white/20 text-white hover:bg-white/10"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
      </div>
    </div>
  );
}