interface SkeletonBlockProps {
  className: string;
}

export function SkeletonBlock({ className }: SkeletonBlockProps) {
  return <div className={`bg-surface-strong animate-pulse rounded-sm ${className}`} />;
}
