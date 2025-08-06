'use client';

import React from 'react';
import { useEnhancedLanguage } from '@/components/EnhancedLanguageProvider';
import { cn } from '@/lib/utils';

interface LanguageTextProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export function LanguageText({ 
  children, 
  className = '', 
  as: Component = 'span' 
}: LanguageTextProps) {
  const { language } = useEnhancedLanguage();
  
  const fontClass = language === 'ar' ? 'font-arabic' : 'font-english';
  
  return (
    <Component className={cn(fontClass, className)}>
      {children}
    </Component>
  );
}

// Specific components for common use cases
export function LanguageHeading({ 
  children, 
  className = '', 
  level = 1 
}: { 
  children: React.ReactNode; 
  className?: string; 
  level?: 1 | 2 | 3 | 4 | 5 | 6; 
}) {
  const headingElements = {
    1: 'h1',
    2: 'h2',
    3: 'h3',
    4: 'h4',
    5: 'h5',
    6: 'h6'
  } as const;
  
  const Component = headingElements[level] as React.ElementType;
  return (
    <LanguageText as={Component} className={cn('font-bold', className)}>
      {children}
    </LanguageText>
  );
}

export function LanguageParagraph({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <LanguageText as="p" className={className}>
      {children}
    </LanguageText>
  );
}

export function LanguageButton({ 
  children, 
  className = '', 
  ...props 
}: { 
  children: React.ReactNode; 
  className?: string; 
  [key: string]: any;
}) {
  const { language } = useEnhancedLanguage();
  const fontClass = language === 'ar' ? 'font-arabic' : 'font-english';
  
  return (
    <button className={cn(fontClass, className)} {...props}>
      {children}
    </button>
  );
}