// Lazy-loaded component wrappers for performance optimization
import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Loading component for better UX during lazy load
const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
  </div>
);

// Heavy admin components - only loaded when needed
export const LazyAIConfigPanel = dynamic(
  () => import('@/components/admin/AIConfigPanel').then(mod => ({ default: mod.AIConfigPanel })),
  { 
    loading: LoadingFallback,
    ssr: false // Admin panels don't need SSR
  }
);

export const LazyUserManagementPanel = dynamic(
  () => import('@/components/admin/UserManagementPanel').then(mod => ({ default: mod.UserManagementPanel })),
  { 
    loading: LoadingFallback,
    ssr: false
  }
);

export const LazyUserSubscriptionPanel = dynamic(
  () => import('@/components/admin/UserSubscriptionPanel').then(mod => ({ default: mod.UserSubscriptionPanel })),
  { 
    loading: LoadingFallback,
    ssr: false
  }
);

// Heavy visualization components
export const LazyConversationCanvas = dynamic(
  () => import('@/components/ConversationCanvas'),
  { 
    loading: LoadingFallback,
    ssr: false
  }
);

export const LazyEnhancedAnalysisView = dynamic(
  () => import('@/components/EnhancedAnalysisView'),
  { 
    loading: LoadingFallback,
    ssr: true // Keep SSR for SEO
  }
);

// Story components
export const LazyStoryViewer = dynamic(
  () => import('@/components/story/StoryViewer'),
  { 
    loading: LoadingFallback,
    ssr: true
  }
);

// Chart components - only load when needed
export const LazyChartComponents = {
  BarChart: dynamic(() => 
    import('recharts').then(mod => ({ default: mod.BarChart as ComponentType<any> })),
    { loading: LoadingFallback, ssr: false }
  ),
  LineChart: dynamic(() => 
    import('recharts').then(mod => ({ default: mod.LineChart as ComponentType<any> })),
    { loading: LoadingFallback, ssr: false }
  ),
  PieChart: dynamic(() => 
    import('recharts').then(mod => ({ default: mod.PieChart as ComponentType<any> })),
    { loading: LoadingFallback, ssr: false }
  ),
};

// Rich text editor - heavy component
export const LazyRichTextEditor = dynamic(
  () => import('@/components/editor/RichTextEditor').then(mod => ({ default: mod.RichTextEditor })),
  { 
    loading: LoadingFallback,
    ssr: false
  }
);

// Template manager
export const LazyTemplateManager = dynamic(
  () => import('@/components/TemplateManager'),
  { 
    loading: LoadingFallback,
    ssr: false
  }
);