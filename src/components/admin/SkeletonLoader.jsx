const SkeletonLoader = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-slate-700/40 ${className}`} />
)

export const StatCardSkeleton = () => (
  <div className="dashboard-card">
    <div className="flex items-center justify-between">
      <div className="flex-1 space-y-3">
        <SkeletonLoader className="h-3 w-24" />
        <SkeletonLoader className="h-8 w-16" />
        <SkeletonLoader className="h-3 w-20" />
      </div>
      <SkeletonLoader className="h-14 w-14 rounded-xl" />
    </div>
  </div>
)

export const PanelSkeleton = ({ rows = 4 }) => (
  <div className="dashboard-card space-y-3">
    <SkeletonLoader className="h-6 w-40" />
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonLoader key={i} className="h-14 w-full rounded-xl" />
    ))}
  </div>
)

export default SkeletonLoader
