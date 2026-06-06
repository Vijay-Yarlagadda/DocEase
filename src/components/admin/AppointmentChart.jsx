import { motion } from 'framer-motion'

const AppointmentChart = ({ data = [], loading = false }) => {
  const max = Math.max(...data.map((d) => d.count), 1)

  if (loading) {
    return (
      <div className="dashboard-card">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Weekly Appointments</h3>
        <div className="flex items-end gap-2 h-40">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex-1 animate-pulse bg-slate-700/40 rounded-t-lg" style={{ height: `${30 + i * 8}%` }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="dashboard-card"
    >
      <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Weekly Appointments</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Last 7 days overview</p>
      <div className="flex items-end gap-2 sm:gap-3 h-44">
        {data.map((item, i) => (
          <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="text-xs font-medium text-accent tabular-nums"
            >
              {item.count}
            </motion.span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max((item.count / max) * 100, 8)}%` }}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.06, ease: 'easeOut' }}
              className="w-full rounded-t-lg bg-gradient-to-t from-primary to-secondary min-h-[8px] hover:from-blue-500 hover:to-cyan-400 transition-colors cursor-default"
              title={`${item.label}: ${item.count}`}
            />
            <span className="text-[10px] sm:text-xs text-slate-500">{item.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export default AppointmentChart
