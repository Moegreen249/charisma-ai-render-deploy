'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, ChevronDown, User, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { MenuIcon } from '@/components/icons/Menu';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { themeConfig } from '@/lib/theme-config';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  adminOnly?: boolean;
  children?: NavItem[];
}

const publicNavItems: NavItem[] = [
  { label: 'Blog', href: '/blog' },
];

const authenticatedNavItems: NavItem[] = [
  { label: 'Analyze', href: '/analyze' },
  { label: 'Stories', href: '/stories' },
  { label: 'History', href: '/history' },
  { label: 'Blog', href: '/blog' },
];

export function UnifiedNavigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';
  
  // Use different navigation items based on authentication status
  const navItems = session ? authenticatedNavItems : publicNavItems;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Add swipe gesture support for mobile menu
  useEffect(() => {
    let startX = 0;
    let currentX = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      if (!isMobileMenuOpen) return;
      startX = e.touches[0].clientX;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!isMobileMenuOpen) return;
      currentX = e.touches[0].clientX;
    };
    
    const handleTouchEnd = () => {
      if (!isMobileMenuOpen) return;
      const diffX = currentX - startX;
      
      // If swipe right more than 100px, close menu
      if (diffX > 100) {
        setIsMobileMenuOpen(false);
      }
    };
    
    if (isMobileMenuOpen) {
      document.addEventListener('touchstart', handleTouchStart);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    }
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobileMenuOpen]);

  const isActiveRoute = (href: string) => {
    if (href === '/') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 transition-all duration-300',
          themeConfig.zIndex.header,
          isScrolled
            ? 'bg-gray-900/95 backdrop-blur-lg border-b border-white/10 shadow-lg'
            : 'bg-transparent'
        )}
      >
        <nav className={cn('mx-auto', themeConfig.layout.maxWidth, themeConfig.layout.containerPadding)}>
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <span className={cn('text-2xl font-bold', themeConfig.typography.gradient)}>
                CharismaAI
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActiveRoute(item.href)
                      ? 'bg-white/10 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  )}
                >
                  {item.label}
                </Link>
              ))}

              {/* Admin Link */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2',
                    'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30',
                    isActiveRoute('/admin')
                      ? 'bg-gradient-to-r from-purple-600/40 to-blue-600/40 text-white border-purple-400/50'
                      : 'text-purple-300 hover:text-white hover:bg-gradient-to-r hover:from-purple-600/30 hover:to-blue-600/30 hover:border-purple-400/40'
                  )}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Admin Panel
                </Link>
              )}
            </div>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {status === 'loading' ? (
                <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
              ) : session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className={cn(
                      "bg-white/10 backdrop-blur-md border border-white/20",
                      "text-white hover:bg-white/20 hover:border-white/30",
                      "transition-all duration-300 hover:scale-[1.02]",
                      "focus:outline-none focus:ring-2 focus:ring-purple-500/50",
                      "shadow-lg shadow-black/10 rounded-lg"
                    )}
                  >
                    <div className="flex items-center gap-2 px-2 py-1.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium">
                        {session.user.name ? session.user.name.split(' ')[0] : 'User'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className={cn(
                      "w-56 p-2",
                      "bg-gray-900/95 backdrop-blur-lg border border-white/20",
                      "shadow-xl shadow-black/20 rounded-xl",
                      "animate-in slide-in-from-top-2 duration-200"
                    )}
                  >
                    {/* User Info Header */}
                    <div className="px-3 py-3 border-b border-white/10 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {session.user.name || 'User'}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {session.user.email}
                          </p>
                          {session.user.role && (
                            <span className={cn(
                              "inline-block px-2 py-0.5 mt-1 text-xs rounded-full",
                              session.user.role === 'ADMIN' 
                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            )}>
                              {session.user.role}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <Link 
                      href="/profile" 
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer",
                        "text-gray-300 hover:text-white hover:bg-white/10",
                        "transition-all duration-200 block"
                      )}
                    >
                      <User className="w-4 h-4" />
                      <span>Profile Settings</span>
                    </Link>
                    
                    <Link 
                      href="/settings" 
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer",
                        "text-gray-300 hover:text-white hover:bg-white/10",
                        "transition-all duration-200 block"
                      )}
                    >
                      <Settings className="w-4 h-4" />
                      <span>App Settings</span>
                    </Link>

                    {isAdmin && (
                      <>
                        <div className="h-px bg-white/10 my-2" />
                        <Link 
                          href="/admin" 
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer",
                            "text-purple-300 hover:text-purple-200 hover:bg-purple-500/10",
                            "transition-all duration-200 block"
                          )}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </>
                    )}

                    <div className="h-px bg-white/10 my-2" />
                    
                    <button
                      onClick={() => signOut()}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer w-full text-left",
                        "text-red-400 hover:text-red-300 hover:bg-red-500/10",
                        "transition-all duration-200"
                      )}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth/signin">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button className={cn('bg-gradient-to-r', themeConfig.colors.gradients.button)}>
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors touch-manipulation focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <div
        className={cn(
          'fixed inset-0 bg-gray-900/95 backdrop-blur-lg transition-transform duration-300 md:hidden',
          themeConfig.zIndex.drawer,
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        style={{ top: '64px' }}
      >
        <nav className="p-6 space-y-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block px-4 py-4 rounded-lg text-base font-medium transition-all duration-200 touch-manipulation',
                'min-h-[44px] flex items-center', // Enhanced touch target
                isActiveRoute(item.href)
                  ? 'bg-white/10 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              )}
            >
              {item.label}
            </Link>
          ))}

          {/* Admin Link Mobile */}
          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                'block px-4 py-4 rounded-lg text-base font-medium transition-all duration-200 flex items-center gap-2 touch-manipulation',
                'min-h-[44px]', // Enhanced touch target
                'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30',
                isActiveRoute('/admin')
                  ? 'bg-gradient-to-r from-purple-600/40 to-blue-600/40 text-white border-purple-400/50'
                  : 'text-purple-300 hover:text-white hover:bg-gradient-to-r hover:from-purple-600/30 hover:to-blue-600/30'
              )}
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin Panel
            </Link>
          )}

          {/* Mobile User Section */}
          <div className="pt-6 border-t border-white/10">
            {session ? (
              <div className="space-y-2">
                <p className="px-4 text-sm text-gray-400">
                  Signed in as {session.user.email}
                </p>
                <Link
                  href="/profile"
                  className="block px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-white/5"
                >
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-white/5"
                >
                  Settings
                </Link>
                <button
                  onClick={() => signOut()}
                  className="block w-full text-left px-4 py-3 rounded-lg text-base font-medium text-red-500 hover:bg-white/5"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link href="/auth/signin" className="block">
                  <Button variant="ghost" className="w-full">Sign In</Button>
                </Link>
                <Link href="/auth/signup" className="block">
                  <Button className={cn('w-full bg-gradient-to-r', themeConfig.colors.gradients.button)}>
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}