import { ReactNode } from 'react';
import { UnifiedNavigation } from './UnifiedNavigation';
import { UnifiedFooter } from './UnifiedFooter';
import { themeConfig } from '@/lib/theme-config';
import { cn } from '@/lib/utils';

interface UnifiedLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
  variant?: 'default' | 'admin' | 'auth';
  maxWidth?: keyof typeof themeConfig.layout;
}

export function UnifiedLayout({
  children,
  showFooter = true,
  variant = 'default',
  maxWidth = 'maxWidth',
}: UnifiedLayoutProps) {
  // Different background styles for different variants
  const backgroundStyles = {
    default: 'bg-gray-950',
    admin: `bg-gradient-to-br ${themeConfig.colors.gradients.main}`,
    auth: 'bg-gray-950',
  };

  return (
    <div className={cn('min-h-screen flex flex-col', backgroundStyles[variant])}>
      {/* Navigation */}
      <UnifiedNavigation />

      {/* Main Content */}
      <main className="flex-1 pt-16">
        <div
          className={cn(
            'mx-auto',
            themeConfig.layout[maxWidth],
            themeConfig.layout.containerPadding,
            variant === 'admin' ? 'py-8' : 'py-12'
          )}
        >
          {children}
        </div>
      </main>

      {/* Footer */}
      {showFooter && variant !== 'admin' && <UnifiedFooter />}

      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
    </div>
  );
}