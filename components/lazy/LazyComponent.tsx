'use client';

import { Suspense, lazy, ComponentType, useState, useEffect } from 'react';
import LoadingIndicator from '@/components/LoadingIndicator';

interface LazyComponentProps {
  fallback?: React.ReactNode;
  className?: string;
}

/**
 * Higher-order component for lazy loading with optimized loading states
 */
export function withLazyLoading<T extends object>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFn);
  
  return function LazyWrapper(props: T & LazyComponentProps) {
    const { fallback: customFallback, className, ...componentProps } = props;
    
    return (
      <Suspense 
        fallback={
          customFallback || 
          <div className={className}>
            <LoadingIndicator />
          </div>
        }
      >
        <LazyComponent {...(componentProps as T)} />
      </Suspense>
    );
  };
}

/**
 * Optimized lazy loading for heavy components
 */
// Note: These lazy components are examples and should be used with components that have default exports
// For now, we'll comment them out to avoid build errors

// export const LazyAdminDashboard = withLazyLoading(
//   () => import('@/app/admin/page'),
//   <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
//     <LoadingIndicator />
//   </div>
// );

// export const LazyAnalyzeComponent = withLazyLoading(
//   () => import('@/app/analyze/page'),
//   <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
//     <LoadingIndicator />
//   </div>
// );

// export const LazyStoryViewer = withLazyLoading(
//   () => import('@/components/story/StoryViewer'),
//   <div className="animate-pulse bg-white/10 rounded-lg h-96" />
// );

// export const LazySystemMetrics = withLazyLoading(
//   () => import('@/components/admin/SystemMetrics'),
//   <div className="animate-pulse bg-white/10 rounded-lg h-64" />
// );

/**
 * Intersection Observer based lazy loading for images and components
 */
export function LazyIntersectionComponent({ 
  children, 
  className = '',
  threshold = 0.1,
  rootMargin = '50px'
}: {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(ref);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(ref);

    return () => {
      if (ref) observer.unobserve(ref);
    };
  }, [ref, threshold, rootMargin]);

  return (
    <div ref={setRef} className={className}>
      {isVisible ? children : <div className="animate-pulse bg-white/10 rounded-lg h-32" />}
    </div>
  );
}