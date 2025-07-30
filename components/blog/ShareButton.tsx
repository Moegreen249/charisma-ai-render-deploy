'use client';

import { useState } from 'react';
import { Share2, Copy, Twitter, Facebook, Linkedin, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
// Using browser alert for now - can be replaced with proper toast library later

interface ShareButtonProps {
  title: string;
  url: string;
  description?: string;
  className?: string;
}

export function ShareButton({ title, url, description, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareData = {
    title,
    text: description || title,
    url,
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      // Show success feedback
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      console.error('Failed to copy link');
    }
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'noopener,noreferrer');
  };

  const handleLinkedInShare = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
  };

  // Check if native sharing is supported
  const isNativeShareSupported = typeof navigator !== 'undefined' && navigator.share;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={`border-white/20 text-white hover:bg-white/10 ${className}`}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-gray-800/95 backdrop-blur-lg border-white/20">
        {isNativeShareSupported && (
          <>
            <DropdownMenuItem 
              onClick={handleNativeShare}
              className="text-white hover:bg-white/10 cursor-pointer"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share via...
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/20" />
          </>
        )}
        
        <DropdownMenuItem 
          onClick={handleCopyLink}
          className="text-white hover:bg-white/10 cursor-pointer"
        >
          {copied ? (
            <Check className="h-4 w-4 mr-2 text-green-400" />
          ) : (
            <Copy className="h-4 w-4 mr-2" />
          )}
          {copied ? 'Copied!' : 'Copy link'}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-white/20" />
        
        <DropdownMenuItem 
          onClick={handleTwitterShare}
          className="text-white hover:bg-white/10 cursor-pointer"
        >
          <Twitter className="h-4 w-4 mr-2" />
          Share on Twitter
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleFacebookShare}
          className="text-white hover:bg-white/10 cursor-pointer"
        >
          <Facebook className="h-4 w-4 mr-2" />
          Share on Facebook
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleLinkedInShare}
          className="text-white hover:bg-white/10 cursor-pointer"
        >
          <Linkedin className="h-4 w-4 mr-2" />
          Share on LinkedIn
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
