import { motion } from 'framer-motion'
import { UserPlus, Calendar, Bell, Shield } from 'lucide-react'
import { PanelSkeleton } from './SkeletonLoader'

const iconMap = {
  doctor: UserPlus,
  appointment: Calendar,
  system: Shield,
}

const colorMap = {
  doctor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  appointment: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  system: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
}

const NotificationsPanel = ({ notifications = [], loading = false }) => {
  if (loading) return <PanelSkeleton rows={5} />

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="dashboard-card h-full"
    >
      <div className="flex items-center gap-2 mb-5">
        <Bell className="w-5 h-5 text-accent" />
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Notifications</h3>
        {notifications.length > 0 && (
          <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent/15 text-accent border border-accent/20">
            {notifications.length}
          </span>
        )}
      </div>
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {notifications.map((n, i) => {
          const Icon = iconMap[n.type] || Bell
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              whileHover={{ x: 4 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-white/90 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-700/30 hover:border-slate-300 dark:hover:border-slate-600/50 transition-colors"
            >
              <div className={`p-2 rounded-lg border ${colorMap[n.type] || colorMap.system}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white">{n.title}</p>
                <p className="text-xs text-slate-400 dark:text-slate-300 mt-0.5 line-clamp-2">{n.message}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{n.time}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

export default NotificationsPanel
