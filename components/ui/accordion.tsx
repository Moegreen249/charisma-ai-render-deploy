import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { themeConfig } from "@/lib/theme-config";

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  type?: "single" | "multiple";
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  collapsible?: boolean;
  className?: string;
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ 
    items, 
    type = "single",
    defaultValue,
    value,
    onValueChange,
    collapsible = true,
    className 
  }, ref) => {
    const [openItems, setOpenItems] = React.useState<string[]>(() => {
      if (value) {
        return Array.isArray(value) ? value : [value];
      }
      if (defaultValue) {
        return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
      }
      return [];
    });

    React.useEffect(() => {
      if (value !== undefined) {
        setOpenItems(Array.isArray(value) ? value : [value]);
      }
    }, [value]);

    const handleToggle = (itemId: string) => {
      let newOpenItems: string[];

      if (type === "single") {
        if (openItems.includes(itemId)) {
          newOpenItems = collapsible ? [] : [itemId];
        } else {
          newOpenItems = [itemId];
        }
      } else {
        if (openItems.includes(itemId)) {
          newOpenItems = openItems.filter(id => id !== itemId);
        } else {
          newOpenItems = [...openItems, itemId];
        }
      }

      setOpenItems(newOpenItems);
      onValueChange?.(type === "single" ? newOpenItems[0] || "" : newOpenItems);
    };

    return (
      <div
        ref={ref}
        className={cn("space-y-2", className)}
      >
        {items.map((item) => {
          const isOpen = openItems.includes(item.id);
          
          return (
            <div
              key={item.id}
              className={cn(
                "rounded-lg border border-white/20 overflow-hidden transition-all duration-300",
                themeConfig.colors.glass.background,
                themeConfig.colors.glass.shadow
              )}
            >
              <button
                onClick={() => !item.disabled && handleToggle(item.id)}
                disabled={item.disabled}
                className={cn(
                  "flex w-full items-center justify-between p-4 text-left transition-all duration-300",
                  "hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-purple-500/50",
                  item.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center space-x-3">
                  {item.icon && (
                    <div className="text-purple-400">
                      {item.icon}
                    </div>
                  )}
                  <span className="text-white font-medium">
                    {item.title}
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-gray-400 transition-transform duration-300",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
              
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300 ease-in-out",
                  isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <div className="p-4 pt-0 text-gray-300 border-t border-white/10">
                  {item.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
);

Accordion.displayName = "Accordion";

export { Accordion };