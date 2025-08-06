import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { themeConfig } from "@/lib/theme-config";

export interface Step {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  completedSteps?: number[];
  orientation?: "horizontal" | "vertical";
  showConnector?: boolean;
  className?: string;
}

const StepIndicator = React.forwardRef<HTMLDivElement, StepIndicatorProps>(
  ({ 
    steps, 
    currentStep, 
    completedSteps = [],
    orientation = "horizontal",
    showConnector = true,
    className 
  }, ref) => {
    const isStepCompleted = (stepIndex: number) => {
      return completedSteps.includes(stepIndex) || stepIndex < currentStep;
    };

    const isStepCurrent = (stepIndex: number) => {
      return stepIndex === currentStep;
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal" ? "flex-row items-center" : "flex-col",
          className
        )}
      >
        {steps.map((step, index) => {
          const completed = isStepCompleted(index);
          const current = isStepCurrent(index);
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <div
                className={cn(
                  "flex items-center",
                  orientation === "vertical" ? "flex-row" : "flex-col"
                )}
              >
                {/* Step Circle */}
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                    completed
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 border-purple-500 text-white"
                      : current
                      ? "border-purple-400 bg-purple-400/20 text-purple-400"
                      : "border-gray-600 bg-gray-800 text-gray-400"
                  )}
                >
                  {completed ? (
                    <Check className="h-5 w-5" />
                  ) : step.icon ? (
                    step.icon
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>

                {/* Step Content */}
                <div
                  className={cn(
                    "text-center",
                    orientation === "horizontal" ? "mt-2" : "ml-4 text-left"
                  )}
                >
                  <div
                    className={cn(
                      "text-sm font-medium transition-colors",
                      completed || current ? "text-white" : "text-gray-400"
                    )}
                  >
                    {step.title}
                  </div>
                  {step.description && (
                    <div
                      className={cn(
                        "text-xs mt-1 transition-colors",
                        completed || current ? "text-gray-300" : "text-gray-500"
                      )}
                    >
                      {step.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Connector */}
              {showConnector && !isLast && (
                <div
                  className={cn(
                    "transition-colors duration-300",
                    orientation === "horizontal"
                      ? "flex-1 h-0.5 mx-4 mt-5"
                      : "w-0.5 h-8 ml-5 my-2",
                    completed
                      ? "bg-gradient-to-r from-purple-600 to-blue-600"
                      : "bg-gray-600"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }
);

StepIndicator.displayName = "StepIndicator";

export { StepIndicator };