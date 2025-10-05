/**
 * Enhanced Badge Component System
 *
 * Flexible badge components with status indicators, variants, and animations
 * optimized for the Operator Network interface.
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-[var(--color-primary)]/50 focus-visible:ring-[3px] transition-[color,box-shadow,transform] overflow-hidden",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[var(--color-primary)] text-black [a&]:hover:bg-[var(--color-primary)]/90",
        secondary: "border-transparent bg-[var(--color-surface)] text-[var(--color-primary)] border border-[var(--color-primary)]/30 [a&]:hover:bg-[var(--color-surface)]/80",
        destructive: "border-transparent bg-red-600 text-white [a&]:hover:bg-red-700 focus-visible:ring-red-500/20",
        outline: "text-[var(--color-primary)] border-[var(--color-primary)]/30 [a&]:hover:bg-[var(--color-primary)]/10 [a&]:hover:text-[var(--color-primary)]",
        success: "border-transparent bg-green-600 text-white [a&]:hover:bg-green-700",
        warning: "border-transparent bg-yellow-600 text-black [a&]:hover:bg-yellow-700",
        accent: "border-transparent bg-[var(--color-secondary)] text-black [a&]:hover:bg-[var(--color-secondary)]/90",
        ghost: "text-[var(--color-text-muted)] [a&]:hover:bg-[var(--color-primary)]/10 [a&]:hover:text-[var(--color-primary)]",
      },
      size: {
        sm: "px-1.5 py-0.5 text-xs",
        default: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

// Status Badge with animated indicators
interface StatusBadgeProps extends React.ComponentProps<"span">, VariantProps<typeof badgeVariants> {
  status: 'active' | 'inactive' | 'running' | 'idle' | 'completed' | 'pending' | 'error';
  animated?: boolean;
  pulse?: boolean;
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, status, animated = false, pulse = false, children, ...props }, ref) => {
    const statusVariants = {
      active: "bg-green-600 text-white border-green-500",
      inactive: "bg-gray-600 text-white border-gray-500",
      running: "bg-blue-600 text-white border-blue-500",
      idle: "bg-yellow-600 text-black border-yellow-500",
      completed: "bg-green-600 text-white border-green-500",
      pending: "bg-orange-600 text-white border-orange-500",
      error: "bg-red-600 text-white border-red-500",
    };

    const statusIcons = {
      active: "🟢",
      inactive: "⚫",
      running: "🔵",
      idle: "🟡",
      completed: "✅",
      pending: "🟠",
      error: "🔴",
    };

    const animatedClasses = animated ? "hover:scale-105 transition-transform duration-200" : "";
    const pulseClasses = pulse ? "animate-pulse" : "";

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1.5 transition-all",
          statusVariants[status],
          animatedClasses,
          pulseClasses,
          className
        )}
        {...props}
      >
        {animated && (
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
        )}
        {children || status.toUpperCase()}
      </span>
    );
  }
);

StatusBadge.displayName = "StatusBadge";

// Skill Badge for operator skills
interface SkillBadgeProps extends React.ComponentProps<"span"> {
  skill: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  interactive?: boolean;
}

const SkillBadge = React.forwardRef<HTMLSpanElement, SkillBadgeProps>(
  ({ className, skill, level, interactive = false, ...props }, ref) => {
    const levelColors = {
      beginner: "bg-gray-500/20 text-gray-300 border-gray-500/30",
      intermediate: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      advanced: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      expert: "bg-[var(--color-primary)]/20 text-[var(--color-primary)] border-[var(--color-primary)]/30",
    };

    const interactiveClasses = interactive
      ? "cursor-pointer hover:scale-105 hover:bg-[var(--color-primary)]/30 transition-all duration-200"
      : "";

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md border px-2 py-1 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1",
          level ? levelColors[level] : "bg-[var(--color-primary)]/20 text-[var(--color-primary)] border-[var(--color-primary)]/30",
          interactiveClasses,
          className
        )}
        {...props}
      >
        {skill}
        {level && level !== 'beginner' && (
          <span className="text-xs opacity-70">
            {level === 'expert' ? '★★★' : level === 'advanced' ? '★★' : '★'}
          </span>
        )}
      </span>
    );
  }
);

SkillBadge.displayName = "SkillBadge";

export { Badge, StatusBadge, SkillBadge, badgeVariants };
export type { StatusBadgeProps, SkillBadgeProps };