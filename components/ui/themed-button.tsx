import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { themeClasses } from "@/components/providers/ThemeProvider";

const themedButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: themeClasses.interactive.button,
        destructive:
          "bg-red-500 text-white hover:bg-red-600 transition-all duration-300",
        outline:
          "border border-white/20 bg-white/10 hover:bg-white/20 text-white transition-all duration-300",
        secondary:
          "bg-white/10 text-white hover:bg-white/20 transition-all duration-300",
        ghost: "hover:bg-white/10 text-white transition-all duration-300",
        link: "text-white underline-offset-4 hover:underline",
        gradient: "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transition-all duration-300",
        glass: `${themeClasses.bg.glass} text-white hover:bg-white/20 transition-all duration-300`,
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
      },
      animation: {
        none: "",
        scale: themeClasses.interactive.scale,
        glow: "hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300",
        pulse: "hover:animate-pulse",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "scale",
    },
  }
);

export interface ThemedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof themedButtonVariants> {
  asChild?: boolean;
}

const ThemedButton = React.forwardRef<HTMLButtonElement, ThemedButtonProps>(
  ({ className, variant, size, animation, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(themedButtonVariants({ variant, size, animation, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
ThemedButton.displayName = "ThemedButton";

export { ThemedButton, themedButtonVariants };