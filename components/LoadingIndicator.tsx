"use client";

import React, { memo } from "react";
import { motion } from "framer-motion";
import { themeConfig } from "@/lib/theme-config";
import { cn } from "@/lib/utils";

// Memoized for performance
const LoadingIndicator = memo(function LoadingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-screen p-4"
    >
      <div className="relative w-24 h-24">
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 border-4 border-purple-400/20 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Middle ring */}
        <motion.div
          className="absolute inset-2 border-4 border-purple-400/40 rounded-full"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.2, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2,
          }}
        />

        {/* Inner spinning circle */}
        <motion.div
          className="absolute inset-4 border-4 border-purple-400 border-t-transparent rounded-full"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <motion.p
        className={cn("mt-8 text-lg font-medium", themeConfig.typography.gradient)}
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        Analyzing your conversation...
      </motion.p>

      <motion.p
        className="mt-2 text-sm text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        This may take a few moments
      </motion.p>
    </motion.div>
  );
});

export default LoadingIndicator;

// Export a lightweight version for better performance
export const LoadingSpinner = memo(function LoadingSpinner({ 
  size = 'md', 
  className = '' 
}: { 
  size?: 'sm' | 'md' | 'lg'; 
  className?: string; 
}) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div 
      className={cn(
        'border-purple-400 border-t-transparent rounded-full animate-spin',
        sizeClasses[size],
        className
      )}
    />
  );
});
