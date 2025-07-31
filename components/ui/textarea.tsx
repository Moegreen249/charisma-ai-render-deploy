import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { themeConfig } from "@/lib/theme-config";

const textareaVariants = cva(
  "flex w-full rounded-lg transition-all duration-300 placeholder:text-gray-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none",
  {
    variants: {
      variant: {
        default: "bg-white/10 backdrop-blur-md border border-white/20 text-white focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 shadow-lg shadow-black/10",
        glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 shadow-lg shadow-black/10",
        solid: "bg-gray-800 border border-gray-600 text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20",
        outline: "bg-transparent border border-white/30 text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20",
      },
      size: {
        sm: "min-h-[60px] px-3 py-2 text-sm",
        default: "min-h-[80px] px-4 py-3 text-sm",
        lg: "min-h-[120px] px-4 py-3 text-base",
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

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  showCharacterCount?: boolean;
  maxLength?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    variant, 
    size, 
    state, 
    showCharacterCount = false,
    maxLength,
    value,
    onChange,
    ...props 
  }, ref) => {
    const [charCount, setCharCount] = React.useState(0);

    React.useEffect(() => {
      if (typeof value === 'string') {
        setCharCount(value.length);
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <div className="relative">
        <textarea
          className={cn(textareaVariants({ variant, size, state, className }))}
          ref={ref}
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          {...props}
        />
        {showCharacterCount && (
          <div className="absolute bottom-2 right-3 text-xs text-gray-400">
            {charCount}{maxLength && `/${maxLength}`}
          </div>
        )}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
