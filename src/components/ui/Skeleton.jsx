import { motion } from 'framer-motion'

export function Skeleton({ className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{
        repeat: Infinity,
        repeatType: 'reverse',
        duration: 1,
        ease: 'easeInOut',
      }}
      className={`bg-slate-200/50 dark:bg-slate-700/50 rounded-lg overflow-hidden relative ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent animate-[shimmer_1.5s_infinite]" />
    </motion.div>
  )
}
