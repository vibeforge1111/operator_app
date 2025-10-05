/**
 * Animated Counter Component
 *
 * Smooth number counting animation for metrics and statistics
 * in the Operator Network interface.
 */

import React, { useEffect, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  decimals?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  duration = 1000,
  decimals = 0,
  className = ''
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = easeOutQuart * value;

      setCount(currentCount);

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [value, duration]);

  const formatNumber = (num: number) => {
    if (decimals > 0) {
      return num.toFixed(decimals);
    }
    return Math.floor(num).toLocaleString();
  };

  return (
    <span className={className}>
      {prefix}{formatNumber(count)}{suffix}
    </span>
  );
}

// Progress Counter with percentage
interface ProgressCounterProps extends AnimatedCounterProps {
  max: number;
  showPercentage?: boolean;
}

export function ProgressCounter({
  value,
  max,
  showPercentage = true,
  suffix = '',
  prefix = '',
  duration = 1000,
  className = ''
}: ProgressCounterProps) {
  const percentage = Math.min((value / max) * 100, 100);

  if (showPercentage) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <AnimatedCounter
          value={value}
          suffix={suffix}
          prefix={prefix}
          duration={duration}
        />
        <span className="text-[var(--color-text-muted)]">/</span>
        <span className="text-[var(--color-text-muted)]">{max.toLocaleString()}</span>
        <span className="text-[var(--color-primary)]">
          (<AnimatedCounter value={percentage} suffix="%" decimals={1} duration={duration} />)
        </span>
      </div>
    );
  }

  return (
    <AnimatedCounter
      value={value}
      suffix={suffix}
      prefix={prefix}
      duration={duration}
      className={className}
    />
  );
}

export default AnimatedCounter;