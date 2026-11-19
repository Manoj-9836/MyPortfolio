import type { ReactNode } from 'react';

type SkeletonTone = 'dark' | 'light';

export function SkeletonStatus({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="status" aria-label={`Loading ${label}`} aria-busy="true">
      {children}
    </div>
  );
}

export function SkeletonBlock({
  tone,
  className = '',
}: {
  tone: SkeletonTone;
  className?: string;
}) {
  const background = tone === 'dark' ? 'bg-[#F3EEE3]/10' : 'bg-[#111111]/10';

  return <div aria-hidden="true" className={`motion-safe:animate-pulse ${background} ${className}`} />;
}
