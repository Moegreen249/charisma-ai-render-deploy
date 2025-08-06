// Optimized version of AI Config page with lazy loading
import { Suspense } from 'react';
import { LazyAIConfigPanel } from '@/components/lazy/LazyComponents';

// Loading skeleton for better UX
function AIConfigSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
      </div>
    </div>
  );
}

export default function AIConfigPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">AI Configuration</h1>
      <Suspense fallback={<AIConfigSkeleton />}>
        <LazyAIConfigPanel />
      </Suspense>
    </div>
  );
}