"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Activity,
  Settings,
  History,
  Shield,
  LogIn,
  LogOut,
  Home,
  User,
} from "lucide-react";

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

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

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <Activity className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-card-foreground">
                CharismaAI
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1">
            {/* Home - Always visible */}
            <Link href="/" className={getLinkClasses("/")}>
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>

            {/* History - Only for authenticated users */}
            {status === "authenticated" && (
              <Link href="/history" className={getLinkClasses("/history")}>
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">History</span>
              </Link>
            )}

            {/* Settings - Only for authenticated users */}
            {status === "authenticated" && (
              <Link href="/settings" className={getLinkClasses("/settings")}>
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </Link>
            )}

            {/* Admin - Only for admin users */}
            {status === "authenticated" && session?.user?.role === "ADMIN" && (
              <Link href="/admin" className={getLinkClasses("/admin")}>
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}

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
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="gap-2 text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign Out</span>
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
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
