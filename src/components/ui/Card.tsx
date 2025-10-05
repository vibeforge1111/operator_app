/**
 * Enhanced Card Component System
 *
 * Comprehensive card components with improved visual hierarchy, hover effects,
 * and flexible layout options optimized for the Operator Network interface.
 * Based on modern shadcn/ui patterns with custom enhancements.
 */

import * as React from "react";
import { cn } from "./utils";

// Main Card Container
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-[var(--color-surface)] text-white flex flex-col gap-6 rounded-xl border border-[var(--color-primary)]/20 transition-all duration-300 ease-out",
        className,
      )}
      {...props}
    />
  );
}

// Card Header with flexible grid layout
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

// Card Title with proper typography
function CardTitle({ className, ...props }: React.ComponentProps<"h4">) {
  return (
    <h4
      data-slot="card-title"
      className={cn("leading-none text-[var(--color-primary)] font-bold text-lg", className)}
      {...props}
    />
  );
}

// Card Description with muted styling
function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-[var(--color-text-muted)] text-sm", className)}
      {...props}
    />
  );
}

// Card Action area for buttons/controls
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

// Card Content with proper spacing
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 [&:last-child]:pb-6", className)}
      {...props}
    />
  );
}

// Card Footer for actions and metadata
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 pb-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

// Enhanced Card with variant support
interface EnhancedCardProps extends React.ComponentProps<"div"> {
  variant?: 'default' | 'glass' | 'bordered' | 'elevated' | 'clean';
  hover?: boolean;
  glow?: boolean;
  interactive?: boolean;
}

function EnhancedCard({
  className,
  variant = 'default',
  hover = false,
  glow = false,
  interactive = false,
  ...props
}: EnhancedCardProps) {
  const variantClasses = {
    default: 'bg-[var(--color-surface)] border border-[var(--color-primary)]/20',
    glass: 'bg-[var(--color-surface)]/80 backdrop-blur-sm border border-[var(--color-primary)]/30',
    bordered: 'bg-[var(--color-surface)] border-2 border-[var(--color-primary)]/40',
    elevated: 'bg-[var(--color-surface)] border border-[var(--color-primary)]/20 shadow-lg shadow-[var(--color-primary)]/10',
    clean: 'bg-[var(--color-surface)] border border-[var(--color-primary)]/20 hover:border-[var(--color-primary)]/40'
  };

  const hoverClasses = hover
    ? 'hover:border-[var(--color-primary)]/50 hover:shadow-lg hover:shadow-[var(--color-primary)]/20 hover:-translate-y-1'
    : '';

  const glowClasses = glow
    ? 'ring-1 ring-[var(--color-primary)]/30 shadow-[var(--color-primary)]/20'
    : '';

  const interactiveClasses = interactive
    ? 'cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5'
    : '';

  return (
    <div
      className={cn(
        "rounded-xl text-white flex flex-col gap-6 transition-all duration-300 ease-out",
        variantClasses[variant],
        hoverClasses,
        glowClasses,
        interactiveClasses,
        className
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  EnhancedCard,
};console.log('ENHANCED CARD LOADED');
