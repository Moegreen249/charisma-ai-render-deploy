import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { themeConfig } from "@/lib/theme-config";

const cardVariants = cva(
  "rounded-lg transition-all duration-300 relative overflow-hidden",
  {
    variants: {
      variant: {
        // Basic card with glass morphism
        default: "bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg shadow-black/10",
        // Glass morphism card
        glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg shadow-black/10",
        // Gradient border card
        gradient: "bg-white/5 backdrop-blur-md border-2 border-transparent bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white shadow-lg shadow-purple-500/10",
        // Solid card
        solid: "bg-gray-800 border border-gray-700 text-white shadow-lg",
        // Feature card
        feature: "bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-md border border-purple-500/20 text-white shadow-lg shadow-purple-500/10",
        // Stats card
        stats: "bg-gradient-to-r from-purple-600/10 to-blue-600/10 backdrop-blur-md border border-purple-400/20 text-white shadow-lg",
        // Pricing card
        pricing: "bg-white/5 backdrop-blur-md border-2 border-white/10 text-white shadow-xl hover:border-purple-400/50",
        // Team member card
        team: "bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg hover:shadow-purple-500/20",
        // Testimonial card
        testimonial: "bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 text-white shadow-lg",
      },
      hover: {
        none: "",
        lift: "hover:scale-105 hover:shadow-xl",
        glow: "hover:shadow-xl hover:shadow-purple-500/25",
        border: "hover:border-white/40",
        all: "hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25 hover:border-white/40",
      },
      clickable: {
        true: "cursor-pointer hover:scale-105 active:scale-95",
        false: "",
      },
      size: {
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      hover: "none",
      clickable: false,
      size: "default",
    },
  },
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, hover, clickable, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, hover, clickable, size, className }))}
      {...props}
    />
  ),
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight text-card-foreground", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
