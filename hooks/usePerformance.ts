'use client';

import { useEffect, useCallback, useRef, useState } from 'react';

/**
 * Performance monitoring hook
 */
export function usePerformance(componentName: string) {
  const startTime = useRef<number>(Date.now());
  
  useEffect(() => {
    const endTime = Date.now();
    const renderTime = endTime - startTime.current;
    
    // Only log in development
    if (process.env.NODE_ENV === 'development' && renderTime > 100) {
      console.warn(`${componentName} took ${renderTime}ms to render`);
    }
  }, [componentName]);
}

/**
 * Debounced callback hook for performance optimization
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  
  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
}

/**
 * Throttled callback hook for performance optimization
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef<number>(Date.now());
  
  return useCallback(
    ((...args: Parameters<T>) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );
    
    observer.observe(element);
    
    return () => {
      observer.unobserve(element);
    };
  }, [ref, options]);
  
  return isIntersecting;
}

/**
 * Memory usage monitoring hook
 */
export function useMemoryMonitor() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('memory' in performance)) return;
    
    const checkMemory = () => {
      const memory = (performance as any).memory;
      if (memory) {
        const used = Math.round(memory.usedJSHeapSize / 1048576);
        const total = Math.round(memory.totalJSHeapSize / 1048576);
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`Memory usage: ${used}MB / ${total}MB`);
        }
        
        // Warn if memory usage is high
        if (used > 100) {
          console.warn(`High memory usage detected: ${used}MB`);
        }
      }
    };
    
    const interval = setInterval(checkMemory, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
}

/**
 * Preload resources hook
 */
export function usePreloadResources(resources: string[]) {
  useEffect(() => {
    resources.forEach((resource) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      
      if (resource.endsWith('.js')) {
        link.as = 'script';
      } else if (resource.endsWith('.css')) {
        link.as = 'style';
      } else if (resource.match(/\.(jpg|jpeg|png|webp|avif)$/)) {
        link.as = 'image';
      }
      
      document.head.appendChild(link);
    });
  }, [resources]);
}

/**
 * Web Vitals monitoring hook
 */
export function useWebVitals() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const webVitalEntry = entry as any; // Type assertion for Web Vitals
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`${entry.name}: ${webVitalEntry.value || entry.duration || 0}ms`);
        }
        
        // Send to analytics in production
        if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', entry.name, {
            value: Math.round(webVitalEntry.value || entry.duration || 0),
            metric_id: webVitalEntry.id || entry.name,
          });
        }
      });
    });
    
    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'cumulative-layout-shift'] });
    } catch (e) {
      // Browser doesn't support these metrics
    }
    
    return () => observer.disconnect();
  }, []);
}