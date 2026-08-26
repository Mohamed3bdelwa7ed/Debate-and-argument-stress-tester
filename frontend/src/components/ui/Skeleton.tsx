export function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white border border-accent-border p-6 shadow-card animate-pulse">
      <div className="h-4 w-3/4 rounded bg-surface-container-high mb-4" />
      <div className="h-3 w-1/2 rounded bg-surface-container mb-3" />
      <div className="h-3 w-1/3 rounded bg-surface-container" />
    </div>
  )
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
