import { motion } from 'framer-motion'

const SkeletonLoader = ({ className = '' }) => (
  <div
    className={`bg-slate-200/50 dark:bg-slate-700/50 overflow-hidden relative ${className}`}
  >
    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent animate-[shimmer_1.5s_infinite]" />
  </div>
)

export const StatCardSkeleton = () => (
  <div className="dashboard-card">
    <div className="flex items-center justify-between">
      <div className="flex-1 space-y-3">
        <SkeletonLoader className="h-3 w-24 rounded-full" />
        <SkeletonLoader className="h-8 w-16 rounded-lg" />
        <SkeletonLoader className="h-3 w-20 rounded-full" />
      </div>
      <SkeletonLoader className="h-14 w-14 rounded-2xl" />
    </div>
  </div>
)

export const PanelSkeleton = ({ rows = 4 }) => (
  <div className="dashboard-card space-y-4">
    <SkeletonLoader className="h-6 w-40 rounded-lg mb-6" />
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
        >
          <SkeletonLoader className="h-16 w-full rounded-2xl" />
        </motion.div>
      ))}
    </div>
  </div>
)

export default SkeletonLoader
