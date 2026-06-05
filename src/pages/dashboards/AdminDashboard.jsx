import { motion } from 'framer-motion'
import { Shield, Building2, UserPlus, BarChart3, Users, Activity, Settings } from 'lucide-react'
import DoctorManagement from '../../components/DoctorManagement'
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader'
import StatCard from '../../components/dashboard/StatCard'

const AdminDashboard = () => {
  const stats = [
    { icon: Building2, label: 'Hospitals', value: '12', change: '+2 this month', gradient: 'from-blue-600 to-blue-400' },
    { icon: UserPlus, label: 'Doctors', value: '156', change: '+8 this month', gradient: 'from-cyan-600 to-cyan-400' },
    { icon: Users, label: 'Patients', value: '2,458', change: '+124 this month', gradient: 'from-teal-600 to-teal-400' },
    { icon: Activity, label: 'Active Sessions', value: '342', change: 'Real-time', gradient: 'from-purple-600 to-purple-400' },
  ]

  const quickActions = [
    { icon: Building2, label: 'Manage Hospitals' },
    { icon: UserPlus, label: 'Add Doctor' },
    { icon: Users, label: 'View Users' },
    { icon: BarChart3, label: 'Analytics' },
    { icon: Settings, label: 'Settings' },
  ]

  return (
    <div>
      <DashboardPageHeader
        role="admin"
        title="Admin Dashboard"
        subtitle="Manage hospitals, doctors, and system settings"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={stat.label} {...stat} delay={index * 0.08} />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="dashboard-card mb-8"
      >
        <h2 className="text-lg font-bold text-white mb-5">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/40 hover:border-primary/30 hover:bg-slate-800/80 transition-all text-center"
              >
                <Icon className="w-6 h-6 text-accent mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-medium text-slate-300">{action.label}</p>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="dashboard-card mb-8"
      >
        <h2 className="text-lg font-bold text-white mb-5">Doctors</h2>
        <DoctorManagement />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="dashboard-card"
      >
        <h2 className="text-lg font-bold text-white mb-5">Recent Activity</h2>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-700/30 hover:border-slate-600/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/15">
                  <Shield className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-white">System activity {item}</p>
                  <p className="text-sm text-slate-500">{item} hour{item > 1 ? 's' : ''} ago</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                Active
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default AdminDashboard
