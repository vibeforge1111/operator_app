/**
 * Enhanced Button Component System
 *
 * Comprehensive button components with multiple variants, sizes, and states
 * optimized for the Operator Network interface. Based on modern component patterns.
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-[var(--color-primary)]/50 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-primary)] text-black hover:bg-[var(--color-primary)]/90 font-medium",
        destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/20",
        outline: "border border-[var(--color-primary)]/30 bg-transparent text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 hover:border-[var(--color-primary)]/50",
        secondary: "bg-[var(--color-surface)] text-white border border-[var(--color-primary)]/20 hover:bg-[var(--color-surface)]/80 hover:border-[var(--color-primary)]/40",
        ghost: "text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)]",
        link: "text-[var(--color-primary)] underline-offset-4 hover:underline",
        accent: "bg-[var(--color-secondary)] text-black hover:bg-[var(--color-secondary)]/90 font-medium",
        operator: "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-black hover:from-[var(--color-primary)]/90 hover:to-[var(--color-secondary)]/90 font-medium shadow-lg shadow-[var(--color-primary)]/20",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 text-xs",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4 text-base",
        xl: "h-12 rounded-lg px-8 has-[>svg]:px-6 text-lg",
        icon: "size-9 rounded-md",
        "icon-sm": "size-8 rounded-md",
        "icon-lg": "size-10 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
      loading?: boolean;
    }
>(({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </Comp>
  );
});

Button.displayName = "Button";

// Enhanced Interactive Button with advanced hover effects
interface InteractiveButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  glow?: boolean;
  pulse?: boolean;
}

const InteractiveButton = React.forwardRef<HTMLButtonElement, InteractiveButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, glow = false, pulse = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    const glowClasses = glow
      ? "shadow-lg shadow-[var(--color-primary)]/30 hover:shadow-xl hover:shadow-[var(--color-primary)]/40"
      : "";

    const pulseClasses = pulse
      ? "animate-pulse"
      : "";

    return (
      <Comp
        data-slot="interactive-button"
        className={cn(
          buttonVariants({ variant, size }),
          glowClasses,
          pulseClasses,
          "hover:scale-105 active:scale-95 transform transition-all duration-200",
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </Comp>
    );
  }
);

InteractiveButton.displayName = "InteractiveButton";

export { Button, InteractiveButton, buttonVariants };
export type { InteractiveButtonProps };