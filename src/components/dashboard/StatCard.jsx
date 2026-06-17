import { motion } from 'framer-motion'

const StatCard = ({ icon: Icon, label, value, change, gradient, delay = 0, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`dashboard-card group ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{change}</p>
        </div>
        <div className={`p-3 sm:p-4 rounded-xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-105 transition-transform duration-300`}>
          <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
      </div>
    </motion.div>
  )
}

export default StatCard
