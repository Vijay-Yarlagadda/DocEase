import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const AnimatedStatCard = ({ icon: Icon, label, value, change, gradient, delay = 0, loading = false, onClick }) => {
  const [displayValue, setDisplayValue] = useState(0)
  const numericValue = typeof value === 'number' ? value : parseInt(value, 10) || 0

  useEffect(() => {
    if (loading) return
    let start = 0
    const duration = 800
    const step = Math.max(1, Math.ceil(numericValue / (duration / 16)))
    const timer = setInterval(() => {
      start += step
      if (start >= numericValue) {
        setDisplayValue(numericValue)
        clearInterval(timer)
      } else {
        setDisplayValue(start)
      }
    }, 16)
    return () => clearInterval(timer)
  }, [numericValue, loading])

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`dashboard-card group relative overflow-hidden ${onClick && !loading ? 'cursor-pointer' : ''}`}
      onClick={!loading ? onClick : undefined}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {loading ? '—' : displayValue.toLocaleString()}
          </p>
          {change && <p className="text-xs text-slate-500 mt-1">{change}</p>}
        </div>
        <motion.div
          whileHover={{ rotate: 5, scale: 1.08 }}
          className={`p-3 sm:p-4 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}
        >
          <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </motion.div>
      </div>
    </motion.div>
  )
}

export default AnimatedStatCard
