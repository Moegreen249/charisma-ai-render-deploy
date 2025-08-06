'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileText, Settings, Mail, Calendar, Shield, Menu, X, Search, Bell, User, Brain, Globe, Rocket, Heart, UserPlus, Palette, Bot, CreditCard,  } from "lucide-react";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import Home from "lucide-react/dist/esm/icons/home";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { themeConfig } from '@/lib/theme-config';
import { cn } from '@/lib/utils';
import { NotificationBell } from '@/components/notifications/NotificationBell';

interface AdminLayoutProps {
  children: ReactNode;
}

const adminNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: UserPlus, label: 'Invitations', href: '/admin/invitation-management' },
  { icon: CreditCard, label: 'Subscriptions', href: '/admin/subscriptions' },
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
  { icon: FileText, label: 'Blog', href: '/admin/blog' },
  { icon: Brain, label: 'Modules', href: '/admin/modules' },
  { icon: Bot, label: 'AI Config', href: '/admin/ai-config' },
  { icon: Heart, label: 'AI Feelings', href: '/admin/charisma-feelings' },
  { icon: Mail, label: 'Email Templates', href: '/admin/email-templates' },
  { icon: Bell, label: 'Notifications', href: '/admin/notifications' },
  { icon: Calendar, label: 'Background Tasks', href: '/admin/background-tasks' },
  { icon: AlertTriangle, label: 'Errors', href: '/admin/errors' },
  { icon: Rocket, label: 'Launch', href: '/admin/launch' },
  { icon: Globe, label: 'SEO', href: '/admin/seo' },
  { icon: Palette, label: 'Theme Designer', href: '/admin/theme-designer' },
  { icon: Shield, label: 'System', href: '/admin/system' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActiveRoute = (href: string) => {
    if (href === '/admin') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className={cn('min-h-screen flex', `bg-gradient-to-br ${themeConfig.colors.gradients.main}`)}>
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className={cn('flex flex-col h-full', themeConfig.colors.glass.background, themeConfig.colors.glass.border, 'border-r')}>
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
            <Link href="/admin" className="flex items-center space-x-2">
              <span className={cn('text-xl font-bold', themeConfig.typography.gradient)}>
                CharismaAI
              </span>
              <span className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded">Admin</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                  isActiveRoute(item.href)
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Back to App */}
          <div className="p-4 border-t border-white/10">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              <Home className="w-5 h-5" />
              Back to App
            </Link>
          </div>

          {/* User Info */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {session?.user?.name || 'Admin User'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {session?.user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="flex items-center justify-between h-16 px-6 bg-white/5 backdrop-blur-sm border-b border-white/10 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-gray-400">Admin</span>
              <span className="text-gray-400">/</span>
              <span className="text-white capitalize">
                {pathname.split('/').pop() || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden md:block relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search..."
                className="pl-10 w-64 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20"
              />
            </div>

            {/* Notifications */}
            <div className="relative">
              <NotificationBell className="h-10 w-10 p-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-200" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className={cn('mx-auto', themeConfig.layout.adminMaxWidth)}>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}