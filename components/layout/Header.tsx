"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { logout } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Activity, Settings, History, Shield, LogIn, LogOut, User, Globe, ChevronDown, BookOpen, Menu, X, FileText,  } from "lucide-react";
import Home from "lucide-react/dist/esm/icons/home";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEnhancedLanguage } from "@/components/EnhancedLanguageProvider";
import Logo from "@/components/ui/logo";

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { language, setLanguage } = useEnhancedLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const getLinkClasses = (href: string) => {
    const baseClasses =
      "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200";
    const activeClasses =
      "text-primary bg-primary/10 border-b-2 border-primary";
    const inactiveClasses =
      "text-muted-foreground hover:text-foreground hover:bg-accent";

    return `${baseClasses} ${isActive(href) ? activeClasses : inactiveClasses}`;
  };

  const navigationItems = [
    { href: "/", icon: Home, label: "Home", alwaysVisible: true },
    { href: "/docs", icon: BookOpen, label: "Docs", alwaysVisible: true },
    { href: "/blog", icon: "blog", label: "Blog", alwaysVisible: true },
    { href: "/contact", icon: "mail", label: "Contact", alwaysVisible: true },
    { href: "/profile", icon: User, label: "Profile", requiresAuth: true },
    { href: "/history", icon: History, label: "History", requiresAuth: true },
    { href: "/settings", icon: Settings, label: "Settings", requiresAuth: true },
    { href: "/admin", icon: Shield, label: "Admin", requiresAdmin: true },
  ];

  const filteredNavItems = navigationItems.filter(item => {
    if (item.alwaysVisible) return true;
    if (item.requiresAdmin) return status === "authenticated" && session?.user?.role === "ADMIN";
    if (item.requiresAuth) return status === "authenticated";
    return false;
  });

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center space-x-3">
                <div className="h-12 flex items-center">
                  <Logo size="md" variant="white" showText={false} />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-xl font-bold text-white leading-tight">
                    CharismaAI
                  </span>
                  <span className="text-xs text-white/70 tracking-wider uppercase leading-tight">
                    Communication Intelligence
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className={getLinkClasses(item.href)}>
                  {item.icon === "mail" ? (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ) : item.icon === "blog" ? (
                    <FileText className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground hover:bg-accent">
                  <Globe className="h-4 w-4" />
                  <span>{language === 'ar' ? 'AR' : 'EN'}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage('en')}>
                  <span className="mr-2">🇺🇸</span>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('ar')}>
                  <span className="mr-2">🇸🇦</span>
                  العربية
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User info and authentication */}
            <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-border">
              {status === "authenticated" ? (
                <>
                  {/* User info */}
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-sm">
                      <User className="h-3 w-3 mr-1" />
                      {session.user.name || session.user.email}
                    </Badge>
                  </div>

                  {/* Sign Out */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => logout()}
                    className="gap-2 text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </Button>
                </>
              ) : (
                /* Sign In */
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signIn()}
                  className="gap-2 text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </Button>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:bg-white/10"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card/95 backdrop-blur-sm">
            <nav className="px-4 py-4 space-y-2">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${getLinkClasses(item.href)} w-full justify-start`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon === "mail" ? (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    ) : item.icon === "blog" ? (
                      <FileText className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Mobile Language Selector */}
              <div className="border-t border-border pt-2 mt-2">
                <div className="text-xs text-muted-foreground mb-2 px-3">Language</div>
                <button
                  onClick={() => setLanguage('en')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 w-full ${
                    language === 'en' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <span>🇺🇸</span>
                  <span>English</span>
                </button>
                <button
                  onClick={() => setLanguage('ar')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 w-full ${
                    language === 'ar' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <span>🇸🇦</span>
                  <span>العربية</span>
                </button>
              </div>

              {/* Mobile Authentication */}
              <div className="border-t border-border pt-2 mt-2">
                {status === "authenticated" ? (
                  <>
                    <div className="px-3 py-2 text-xs text-muted-foreground">
                      Signed in as {session.user.name || session.user.email}
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent w-full"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      signIn();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent w-full"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
