'use client';

import { useEffect, memo } from 'react';
import { useWebVitals, useMemoryMonitor } from '@/hooks/usePerformance';

/**
 * Performance monitoring component - only active in development
 */
const PerformanceMonitor = memo(function PerformanceMonitor() {
  useWebVitals();
  useMemoryMonitor();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    // Monitor long tasks
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 50) {
          console.warn(`Long task detected: ${entry.duration}ms`);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // Browser doesn't support longtask
    }

    // Monitor resource loading
    const resourceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const resource = entry as PerformanceResourceTiming;
        if (resource.duration > 1000) {
          console.warn(`Slow resource: ${resource.name} took ${resource.duration}ms`);
        }
      });
    });

    try {
      resourceObserver.observe({ entryTypes: ['resource'] });
    } catch (e) {
      // Browser doesn't support resource timing
    }

    return () => {
      observer.disconnect();
      resourceObserver.disconnect();
    };
  }, []);

  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white text-xs p-2 rounded font-mono">
      <div>Performance Monitor Active</div>
      <div>Check console for metrics</div>
    </div>
  );
});

export default PerformanceMonitor;