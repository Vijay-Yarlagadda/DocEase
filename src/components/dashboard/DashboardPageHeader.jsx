import { motion } from 'framer-motion'

const roleBadge = {
  admin: 'from-blue-900 to-blue-600',
  doctor: 'from-cyan-600 to-cyan-400',
  patient: 'from-teal-600 to-teal-400',
  superadmin: 'from-fuchsia-600 to-pink-500',
}

const DashboardPageHeader = ({ title, subtitle, role, action }) => {
  const badgeGradient = roleBadge[role] || roleBadge.admin

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
    >
      <div>
        <span className={`whitespace-nowrap shrink-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${badgeGradient} mb-3 capitalize`}>
          {role} Portal
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1">
          {title}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
          {subtitle}
        </p>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </motion.div>
  )
}

export default DashboardPageHeader
