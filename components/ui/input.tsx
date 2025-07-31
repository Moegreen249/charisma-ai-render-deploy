import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { themeConfig } from "@/lib/theme-config";

const inputVariants = cva(
  "flex w-full rounded-lg transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-white/10 backdrop-blur-md border border-white/20 text-white focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 shadow-lg shadow-black/10",
        glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 shadow-lg shadow-black/10",
        solid: "bg-gray-800 border border-gray-600 text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20",
        outline: "bg-transparent border border-white/30 text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        default: "h-10 px-4 text-sm",
        lg: "h-12 px-4 text-base",
      },
      state: {
        default: "",
        error: "border-red-400/50 focus:border-red-400 focus:ring-red-400/20",
        success: "border-green-400/50 focus:border-green-400 focus:ring-green-400/20",
        warning: "border-yellow-400/50 focus:border-yellow-400 focus:ring-yellow-400/20",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      state: "default",
    },
  },
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    size, 
    state, 
    type, 
    leftIcon, 
    rightIcon, 
    showPasswordToggle = false,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [inputType, setInputType] = React.useState(type);

    React.useEffect(() => {
      if (showPasswordToggle && type === "password") {
        setInputType(showPassword ? "text" : "password");
      } else {
        setInputType(type);
      }
    }, [showPassword, type, showPasswordToggle]);

    const hasLeftIcon = leftIcon;
    const hasRightIcon = rightIcon || (showPasswordToggle && type === "password");

    if (hasLeftIcon || hasRightIcon) {
      return (
        <div className="relative">
          {hasLeftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            type={inputType}
            className={cn(
              inputVariants({ variant, size, state }),
              hasLeftIcon && "pl-10",
              hasRightIcon && "pr-10",
              className
            )}
            ref={ref}
            {...props}
          />
          {hasRightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {showPasswordToggle && type === "password" ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              ) : (
                <div className="text-gray-400">{rightIcon}</div>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        type={inputType}
        className={cn(inputVariants({ variant, size, state, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
