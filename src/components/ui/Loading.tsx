/**
 * Enhanced Loading Component System
 *
 * Comprehensive loading states and spinners with various animations
 * optimized for the Operator Network interface.
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const loadingVariants = cva(
  "animate-spin rounded-full border-2 border-current border-t-transparent",
  {
    variants: {
      size: {
        sm: "h-4 w-4",
        default: "h-6 w-6",
        lg: "h-8 w-8",
        xl: "h-12 w-12",
      },
      variant: {
        default: "text-[var(--color-primary)]",
        secondary: "text-[var(--color-secondary)]",
        muted: "text-[var(--color-text-muted)]",
        white: "text-white",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
);

interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingVariants> {}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(loadingVariants({ size, variant }), className)}
        {...props}
      />
    );
  }
);

LoadingSpinner.displayName = "LoadingSpinner";

// Pulsing Dots Loader
interface DotsLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'secondary' | 'muted';
}

const DotsLoader = React.forwardRef<HTMLDivElement, DotsLoaderProps>(
  ({ className, size = 'default', variant = 'default', ...props }, ref) => {
    const sizeClasses = {
      sm: "w-1 h-1",
      default: "w-2 h-2",
      lg: "w-3 h-3",
    };

    const variantClasses = {
      default: "bg-[var(--color-primary)]",
      secondary: "bg-[var(--color-secondary)]",
      muted: "bg-[var(--color-text-muted)]",
    };

    return (
      <div
        ref={ref}
        className={cn("flex items-center space-x-1", className)}
        {...props}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "rounded-full animate-pulse",
              sizeClasses[size],
              variantClasses[variant]
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1.4s',
            }}
          />
        ))}
      </div>
    );
  }
);

DotsLoader.displayName = "DotsLoader";

// Skeleton Loader
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'rounded' | 'circle';
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantClasses = {
      default: "rounded",
      rounded: "rounded-lg",
      circle: "rounded-full",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "bg-[var(--color-surface)]/50 animate-pulse",
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

// Full Page Loading
interface FullPageLoadingProps {
  title?: string;
  description?: string;
  variant?: 'spinner' | 'dots';
  size?: 'default' | 'lg';
}

const FullPageLoading = React.forwardRef<HTMLDivElement, FullPageLoadingProps>(
  ({ title = "Loading...", description, variant = 'spinner', size = 'default' }, ref) => {
    return (
      <div
        ref={ref}
        className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center"
      >
        <div className="text-center space-y-4 max-w-md px-6">
          <div className="flex justify-center">
            {variant === 'spinner' ? (
              <LoadingSpinner size={size === 'lg' ? 'xl' : 'lg'} />
            ) : (
              <DotsLoader size={size === 'lg' ? 'lg' : 'default'} />
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[var(--color-primary)]">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-[var(--color-text-muted)]">
                {description}
              </p>
            )}
          </div>

          <div className="text-xs text-[var(--color-text-muted)] space-y-1">
            <div>tick... tick... tick...</div>
            <div className="text-[var(--color-primary)]">Network heartbeat active</div>
          </div>
        </div>
      </div>
    );
  }
);

FullPageLoading.displayName = "FullPageLoading";

// Card Loading State
interface CardLoadingProps {
  lines?: number;
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

const CardLoading = React.forwardRef<HTMLDivElement, CardLoadingProps>(
  ({ lines = 3, showHeader = true, showFooter = false, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-[var(--color-surface)] border border-[var(--color-primary)]/20 rounded-xl p-6 space-y-4",
          className
        )}
        {...props}
      >
        {showHeader && (
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        )}

        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-3"
              style={{ width: `${Math.random() * 40 + 60}%` }}
            />
          ))}
        </div>

        {showFooter && (
          <div className="flex space-x-2 pt-2">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        )}
      </div>
    );
  }
);

CardLoading.displayName = "CardLoading";

// Pulse Animation Wrapper
interface PulseProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  active?: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

const Pulse = React.forwardRef<HTMLDivElement, PulseProps>(
  ({ children, active = true, intensity = 'medium', className, ...props }, ref) => {
    const intensityClasses = {
      low: "animate-pulse [animation-duration:3s]",
      medium: "animate-pulse [animation-duration:2s]",
      high: "animate-pulse [animation-duration:1s]",
    };

    return (
      <div
        ref={ref}
        className={cn(
          active ? intensityClasses[intensity] : "",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Pulse.displayName = "Pulse";

export {
  LoadingSpinner,
  DotsLoader,
  Skeleton,
  FullPageLoading,
  CardLoading,
  Pulse,
  loadingVariants,
};

export type {
  LoadingSpinnerProps,
  DotsLoaderProps,
  SkeletonProps,
  FullPageLoadingProps,
  CardLoadingProps,
  PulseProps,
};