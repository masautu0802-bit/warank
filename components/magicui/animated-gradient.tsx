'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedGradientProps {
  children?: React.ReactNode;
  className?: string;
  gradientColors?: string[];
  duration?: number;
  animate?: boolean;
}

export function AnimatedGradient({
  children,
  className,
  gradientColors = [
    'rgb(59, 130, 246)', // blue-500
    'rgb(168, 85, 247)', // purple-500
    'rgb(236, 72, 153)', // pink-500
    'rgb(249, 115, 22)', // orange-500
    'rgb(234, 179, 8)', // yellow-500
    'rgb(34, 197, 94)', // green-500
  ],
  duration = 8,
  animate = true,
}: AnimatedGradientProps) {
  const gradientRef = useRef<HTMLDivElement>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!animate || !gradientRef.current) return;

    const element = gradientRef.current;
    const gradientString = `linear-gradient(-45deg, ${gradientColors.join(', ')})`;
    element.style.background = gradientString;
    element.style.backgroundSize = '400% 400%';

    let startTime: number | null = null;
    let position = 0;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;
      
      // Calculate position based on elapsed time and duration
      const progress = (elapsed % duration) / duration;
      
      // Smooth animation: 0% -> 100% -> 0%
      if (progress < 0.5) {
        position = progress * 200; // 0% to 100%
      } else {
        position = (1 - progress) * 200; // 100% to 0%
      }

      element.style.backgroundPosition = `${position}% 50%`;
      
      animationIdRef.current = requestAnimationFrame(animate);
    };

    animationIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [animate, gradientColors, duration]);

  if (!animate) {
    return (
      <div
        className={cn('relative overflow-hidden', className)}
        style={{
          background: `linear-gradient(to right, ${gradientColors[0]}, ${gradientColors[1]})`,
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      ref={gradientRef}
      className={cn('relative overflow-hidden', className)}
    >
      {children}
    </div>
  );
}
