import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import Info from "lucide-react/dist/esm/icons/info";
import { cn } from "@/lib/utils";
import { themeConfig } from "@/lib/theme-config";

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 shadow-lg transition-all duration-300 backdrop-blur-md",
  {
    variants: {
      variant: {
        default: "bg-white/10 border-white/20 text-white",
        success: "bg-green-500/20 border-green-500/30 text-green-100",
        error: "bg-red-500/20 border-red-500/30 text-red-100",
        warning: "bg-yellow-500/20 border-yellow-500/30 text-yellow-100",
        info: "bg-blue-500/20 border-blue-500/30 text-blue-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  onClose?: () => void;
  duration?: number;
  showIcon?: boolean;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ 
    className, 
    variant, 
    title, 
    description, 
    action, 
    onClose, 
    duration = 5000,
    showIcon = true,
    ...props 
  }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true);

    React.useEffect(() => {
      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => {
            onClose?.();
          }, 300);
        }, duration);

        return () => clearTimeout(timer);
      }
    }, [duration, onClose]);

    const getIcon = () => {
      switch (variant) {
        case "success":
          return <CheckCircle className="h-5 w-5 text-green-400" />;
        case "error":
          return <AlertCircle className="h-5 w-5 text-red-400" />;
        case "warning":
          return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
        case "info":
          return <Info className="h-5 w-5 text-blue-400" />;
        default:
          return <Info className="h-5 w-5 text-purple-400" />;
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          toastVariants({ variant }),
          isVisible ? "animate-in slide-in-from-right" : "animate-out slide-out-to-right",
          className
        )}
        {...props}
      >
        <div className="flex items-start space-x-3">
          {showIcon && getIcon()}
          <div className="flex-1 space-y-1">
            {title && (
              <div className="text-sm font-semibold">{title}</div>
            )}
            {description && (
              <div className="text-sm opacity-90">{description}</div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {action && action}
          {onClose && (
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => {
                  onClose();
                }, 300);
              }}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

Toast.displayName = "Toast";

// Toast Provider Context
interface ToastContextType {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = React.useState<(ToastProps & { id: string })[]>([]);

  const addToast = React.useCallback((toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 max-w-sm">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export { Toast, toastVariants };