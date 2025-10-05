/**
 * Enhanced Progress Component System
 *
 * Flexible progress bars and indicators with animations and variants
 * optimized for the Operator Network interface.
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const progressVariants = cva(
  "relative overflow-hidden rounded-full bg-[var(--color-surface)]/50 border border-[var(--color-primary)]/20",
  {
    variants: {
      size: {
        sm: "h-1.5",
        default: "h-2",
        lg: "h-3",
        xl: "h-4",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  value?: number;
  max?: number;
  animated?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'accent';
  showPercentage?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, size, animated = true, variant = 'default', showPercentage = false, ...props }, ref) => {
    const percentage = Math.min((value / max) * 100, 100);

    const variantColors = {
      default: "bg-[var(--color-primary)]",
      success: "bg-green-500",
      warning: "bg-yellow-500",
      error: "bg-red-500",
      accent: "bg-[var(--color-secondary)]",
    };

    const animatedClasses = animated
      ? "transition-all duration-500 ease-out"
      : "";

    return (
      <div className={cn("space-y-2", className)}>
        <div
          ref={ref}
          className={cn(progressVariants({ size }))}
          {...props}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              variantColors[variant],
              animatedClasses
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showPercentage && (
          <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
            <span>{value.toLocaleString()}</span>
            <span>{percentage.toFixed(1)}%</span>
          </div>
        )}
      </div>
    );
  }
);

Progress.displayName = "Progress";

// Circular Progress Component
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'accent';
  showValue?: boolean;
  animated?: boolean;
}

const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  ({
    value,
    max = 100,
    size = 80,
    strokeWidth = 8,
    className,
    variant = 'default',
    showValue = true,
    animated = true,
    ...props
  }, ref) => {
    const percentage = Math.min((value / max) * 100, 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const variantColors = {
      default: "stroke-[var(--color-primary)]",
      success: "stroke-green-500",
      warning: "stroke-yellow-500",
      error: "stroke-red-500",
      accent: "stroke-[var(--color-secondary)]",
    };

    return (
      <div
        ref={ref}
        className={cn("relative inline-flex items-center justify-center", className)}
        style={{ width: size, height: size }}
        {...props}
      >
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-[var(--color-surface)]/50"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn(
              variantColors[variant],
              animated ? "transition-all duration-500 ease-out" : ""
            )}
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {percentage.toFixed(0)}%
            </span>
          </div>
        )}
      </div>
    );
  }
);

CircularProgress.displayName = "CircularProgress";

// Multi-step Progress Component
interface MultiStepProgressProps {
  steps: string[];
  currentStep: number;
  className?: string;
  variant?: 'default' | 'accent';
}

const MultiStepProgress = React.forwardRef<HTMLDivElement, MultiStepProgressProps>(
  ({ steps, currentStep, className, variant = 'default', ...props }, ref) => {
    const variantColors = {
      default: {
        active: "bg-[var(--color-primary)] text-black",
        completed: "bg-[var(--color-primary)] text-black",
        pending: "bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-primary)]/30",
        line: "bg-[var(--color-primary)]"
      },
      accent: {
        active: "bg-[var(--color-secondary)] text-black",
        completed: "bg-[var(--color-secondary)] text-black",
        pending: "bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-secondary)]/30",
        line: "bg-[var(--color-secondary)]"
      }
    };

    const colors = variantColors[variant];

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center space-y-2">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                    index <= currentStep ? colors.completed : colors.pending
                  )}
                >
                  {index < currentStep ? "✓" : index + 1}
                </div>
                <span className={cn(
                  "text-xs max-w-20 text-center",
                  index <= currentStep ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"
                )}>
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-4 bg-[var(--color-surface)]/50 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-500 ease-out rounded-full",
                      index < currentStep ? colors.line : "w-0"
                    )}
                    style={{ width: index < currentStep ? "100%" : "0%" }}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }
);

MultiStepProgress.displayName = "MultiStepProgress";

export { Progress, CircularProgress, MultiStepProgress, progressVariants };
export type { ProgressProps, CircularProgressProps, MultiStepProgressProps };