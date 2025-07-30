'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Logo from '@/components/ui/logo';
import { 
  Users, 
  Settings, 
  BarChart3, 
  Mail, 
  Rocket, 
  Shield, 
  Database,
  FileText,
  Home,
  LogOut,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { signOut } from 'next-auth/react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const adminNavItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: Home,
    description: 'Overview and statistics'
  },
  {
    title: 'User Management',
    href: '/admin/users',
    icon: Users,
    description: 'Approve and manage users'
  },
  {
    title: 'Launch Control',
    href: '/admin/launch',
    icon: Rocket,
    description: 'Platform launch settings'
  },
  {
    title: 'Email Templates',
    href: '/admin/email-templates',
    icon: Mail,
    description: 'Manage email templates'
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'Platform analytics'
  },
  {
    title: 'System Health',
    href: '/admin/system',
    icon: Database,
    description: 'System monitoring'
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'Platform settings'
  }
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (session.user.role !== 'ADMIN') {
      router.push('/');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <Logo size="xl" variant="white" />
          <div className="mt-4 w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/10 backdrop-blur-md border-r border-white/20 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/20">
          <div className="flex items-center space-x-2">
            <Logo size="sm" variant="white" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white">Admin Panel</span>
              <Badge className="bg-purple-500/20 text-purple-200 border-purple-400/30 text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                CharismaAI
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-2">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-white/20 text-white border border-white/30 shadow-lg backdrop-blur-sm'
                      : 'text-white/80 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/20'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`mr-3 h-5 w-5 transition-colors ${
                    isActive ? 'text-white' : 'text-white/60 group-hover:text-white/80'
                  }`} />
                  <div className="flex flex-col">
                    <span className="font-medium">{item.title}</span>
                    <span className={`text-xs ${
                      isActive ? 'text-white/80' : 'text-white/50 group-hover:text-white/60'
                    }`}>{item.description}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User info and logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-3 border border-white/20">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {session.user.name?.[0] || session.user.email?.[0] || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {session.user.name || 'Admin'}
                </p>
                <p className="text-xs text-white/60 truncate">
                  {session.user.email}
                </p>
                <Badge className="bg-green-500/20 text-green-200 border-green-400/30 text-xs mt-1">
                  <Shield className="w-3 h-3 mr-1" />
                  Administrator
                </Badge>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 relative z-10">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-white hover:bg-white/10"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              
              <div>
                <h1 className="text-lg font-semibold text-white">
                  {adminNavItems.find(item => item.href === pathname)?.title || 'Admin Panel'}
                </h1>
                <p className="text-sm text-white/70">
                  {adminNavItems.find(item => item.href === pathname)?.description || 'CharismaAI Administration'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge className="bg-green-500/20 text-green-200 border-green-400/30">
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}