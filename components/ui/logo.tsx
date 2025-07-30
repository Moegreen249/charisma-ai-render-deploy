"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'white' | 'gradient' | 'mono';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'default',
  showText = true,
  className
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl'
  };

  const iconSize = sizeClasses[size];
  const textSize = textSizeClasses[size];

  const getIconColors = () => {
    switch (variant) {
      case 'white':
        return {
          primary: 'text-white',
          secondary: 'text-white/80',
          accent: 'text-white/60'
        };
      case 'mono':
        return {
          primary: 'text-gray-800',
          secondary: 'text-gray-600',
          accent: 'text-gray-400'
        };
      case 'gradient':
        return {
          primary: 'text-transparent bg-clip-text bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600',
          secondary: 'text-transparent bg-clip-text bg-gradient-to-br from-blue-500 to-purple-500',
          accent: 'text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-blue-400'
        };
      default:
        return {
          primary: 'text-purple-600',
          secondary: 'text-blue-600',
          accent: 'text-indigo-500'
        };
    }
  };

  const colors = getIconColors();

  const LogoIcon = () => (
    <div className={cn("relative flex items-center justify-center", iconSize)}>
      {/* Main circular brain/network structure */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle with gradient */}
        <defs>
          <radialGradient id="logoGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
          </radialGradient>
          <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.6" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Outer circle */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="url(#logoGradient)"
          stroke="currentColor"
          strokeWidth="1"
          className={colors.primary}
          opacity="0.2"
        />

        {/* Neural network nodes */}
        <g className={colors.primary}>
          {/* Central node */}
          <circle cx="50" cy="50" r="4" fill="currentColor" />

          {/* Ring 1 nodes */}
          <circle cx="50" cy="30" r="3" fill="currentColor" opacity="0.9" />
          <circle cx="70" cy="50" r="3" fill="currentColor" opacity="0.9" />
          <circle cx="50" cy="70" r="3" fill="currentColor" opacity="0.9" />
          <circle cx="30" cy="50" r="3" fill="currentColor" opacity="0.9" />

          {/* Ring 2 nodes */}
          <circle cx="65" cy="35" r="2.5" fill="currentColor" opacity="0.7" />
          <circle cx="65" cy="65" r="2.5" fill="currentColor" opacity="0.7" />
          <circle cx="35" cy="65" r="2.5" fill="currentColor" opacity="0.7" />
          <circle cx="35" cy="35" r="2.5" fill="currentColor" opacity="0.7" />
        </g>

        {/* Connections between nodes */}
        <g className={colors.secondary} strokeWidth="1.5" fill="none" opacity="0.6">
          {/* From center to ring 1 */}
          <line x1="50" y1="50" x2="50" y2="30" stroke="currentColor" />
          <line x1="50" y1="50" x2="70" y2="50" stroke="currentColor" />
          <line x1="50" y1="50" x2="50" y2="70" stroke="currentColor" />
          <line x1="50" y1="50" x2="30" y2="50" stroke="currentColor" />

          {/* From ring 1 to ring 2 */}
          <line x1="50" y1="30" x2="65" y2="35" stroke="currentColor" opacity="0.4" />
          <line x1="70" y1="50" x2="65" y2="35" stroke="currentColor" opacity="0.4" />
          <line x1="70" y1="50" x2="65" y2="65" stroke="currentColor" opacity="0.4" />
          <line x1="50" y1="70" x2="65" y2="65" stroke="currentColor" opacity="0.4" />
          <line x1="50" y1="70" x2="35" y2="65" stroke="currentColor" opacity="0.4" />
          <line x1="30" y1="50" x2="35" y2="65" stroke="currentColor" opacity="0.4" />
          <line x1="30" y1="50" x2="35" y2="35" stroke="currentColor" opacity="0.4" />
          <line x1="50" y1="30" x2="35" y2="35" stroke="currentColor" opacity="0.4" />
        </g>

        {/* Data flow animation paths */}
        <g className={colors.accent} strokeWidth="1" fill="none" opacity="0.8">
          {/* Animated pulse rings */}
          <circle cx="50" cy="50" r="15" stroke="currentColor" strokeDasharray="2,4" opacity="0.3">
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 50 50;360 50 50"
              dur="8s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="50" cy="50" r="25" stroke="currentColor" strokeDasharray="3,6" opacity="0.2">
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="360 50 50;0 50 50"
              dur="12s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      </svg>

      {/* Central "C" for Charisma */}
      <div className={cn("relative z-10 font-bold", textSize === 'text-lg' ? 'text-xs' : textSize === 'text-xl' ? 'text-sm' : textSize === 'text-2xl' ? 'text-base' : 'text-lg', colors.primary)}>
        C
      </div>
    </div>
  );

  const LogoText = () => (
    <div className="flex flex-col">
      <span className={cn("font-bold tracking-tight", textSize, colors.primary)}>
        Charisma
        <span className={colors.secondary}>AI</span>
      </span>
      {size === 'xl' && (
        <span className={cn("text-xs font-medium tracking-wider uppercase", colors.accent)}>
          Communication Intelligence
        </span>
      )}
    </div>
  );

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <LogoIcon />
      {showText && <LogoText />}
    </div>
  );
};

export default Logo;

// Export additional logo variants for specific use cases
export const LogoIcon: React.FC<Omit<LogoProps, 'showText'>> = (props) => (
  <Logo {...props} showText={false} />
);

export const LogoWithText: React.FC<LogoProps> = (props) => (
  <Logo {...props} showText={true} />
);

// Simplified logo for favicons and small spaces
export const LogoSimple: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className
}) => (
  <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full text-purple-600"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="45" fill="currentColor" />
      <circle cx="50" cy="50" r="20" fill="white" />
      <text
        x="50"
        y="58"
        textAnchor="middle"
        className="text-2xl font-bold fill-purple-600"
      >
        C
      </text>
    </svg>
  </div>
);
