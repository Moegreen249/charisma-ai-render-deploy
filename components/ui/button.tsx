import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";

import { cn } from "@/lib/utils";
import { themeConfig } from "@/lib/theme-config";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        // Primary button with gradient background
        primary:
          "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 active:scale-95 border border-purple-500/20",
        // Secondary button with glass morphism
        secondary:
          "bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg shadow-black/10 hover:bg-white/20 hover:border-white/30 hover:scale-105 active:scale-95",
        // Outline button with white/10 border
        outline:
          "border border-white/10 bg-transparent text-white hover:bg-white/10 hover:border-white/20 hover:scale-105 active:scale-95 shadow-sm",
        // Ghost button with hover effects
        ghost: 
          "text-white hover:bg-white/10 hover:scale-105 active:scale-95",
        // Destructive variant
        destructive:
          "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 hover:scale-105 active:scale-95 border border-red-500/20",
        // Link variant
        link: 
          "text-purple-400 underline-offset-4 hover:underline hover:text-purple-300 transition-colors",
        // Success variant
        success:
          "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/40 hover:scale-105 active:scale-95 border border-green-500/20",
        // Warning variant
        warning:
          "bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg shadow-yellow-500/25 hover:shadow-xl hover:shadow-yellow-500/40 hover:scale-105 active:scale-95 border border-yellow-500/20",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-md",
        default: "h-10 px-6 py-2",
        lg: "h-12 px-8 text-base rounded-lg",
        xl: "h-14 px-10 text-lg rounded-xl",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
        "icon-xl": "h-14 w-14",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
      loading: {
        true: "cursor-not-allowed",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      fullWidth: false,
      loading: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth,
    loading = false,
    loadingText,
    leftIcon,
    rightIcon,
    children,
    disabled,
    asChild = false, 
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    const isDisabled = disabled || loading;
    
    return (
      <Comp
        className={cn(buttonVariants({ 
          variant, 
          size, 
          fullWidth,
          loading,
          className 
        }))}
        disabled={isDisabled}
        ref={ref}
        {...props}
      >
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        {!loading && leftIcon && leftIcon}
        {loading ? (loadingText || "Loading...") : children}
        {!loading && rightIcon && rightIcon}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
