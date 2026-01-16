'use client';

import { cn } from '@/lib/utils';

interface RetroGridProps {
  angle?: number;
  className?: string;
}

export function RetroGrid({
  angle = 65,
  className,
}: RetroGridProps) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute size-full overflow-hidden opacity-50 [perspective:200px]',
        className,
      )}
      style={{ '--grid-angle': `${angle}deg` } as React.CSSProperties}
    >
      {/* Grid Background */}
      <div
        className="absolute inset-0 [transform:rotateX(var(--grid-angle))]"
        style={{
          backgroundImage: `
            linear-gradient(var(--grid-angle), rgb(0 0 0 / 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgb(0 0 0 / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '4rem 4rem',
          backgroundPosition: 'calc(50% + 20px) 0',
        }}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-background dark:via-background/80" />
    </div>
  );
}
