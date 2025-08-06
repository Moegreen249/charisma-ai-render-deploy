import * as React from "react";
import { ChevronRight } from "lucide-react";
import Home from "lucide-react/dist/esm/icons/home";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { themeConfig } from "@/lib/theme-config";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  showHome?: boolean;
  className?: string;
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items, separator = <ChevronRight className="h-4 w-4" />, showHome = true, className }, ref) => {
    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cn("flex items-center space-x-2 text-sm", className)}
      >
        {showHome && (
          <>
            <Link
              href="/"
              className={cn(
                "flex items-center gap-1 text-gray-400 hover:text-white transition-colors",
                themeConfig.animation.transition
              )}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            {items.length > 0 && (
              <span className="text-gray-500">{separator}</span>
            )}
          </>
        )}
        
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <React.Fragment key={index}>
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1 text-gray-400 hover:text-white transition-colors",
                    themeConfig.animation.transition
                  )}
                >
                  {item.icon && item.icon}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  className={cn(
                    "flex items-center gap-1",
                    isLast ? "text-white font-medium" : "text-gray-400"
                  )}
                >
                  {item.icon && item.icon}
                  <span>{item.label}</span>
                </span>
              )}
              
              {!isLast && (
                <span className="text-gray-500">{separator}</span>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    );
  }
);

Breadcrumb.displayName = "Breadcrumb";

export { Breadcrumb };