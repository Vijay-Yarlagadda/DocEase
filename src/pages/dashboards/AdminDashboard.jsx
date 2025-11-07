import { motion } from 'framer-motion'
import { Shield, Building2, UserPlus, BarChart3, Users, Activity, Settings, LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'

const AdminDashboard = () => {
  const stats = [
    {
  icon: Building2,
      label: 'Hospitals',
      value: '12',
      change: '+2 this month',
      gradient: 'from-blue-600 to-blue-400',
    },
    {
      icon: UserPlus,
      label: 'Doctors',
      value: '156',
      change: '+8 this month',
      gradient: 'from-cyan-600 to-cyan-400',
    },
    {
      icon: Users,
      label: 'Patients',
      value: '2,458',
      change: '+124 this month',
      gradient: 'from-teal-600 to-teal-400',
    },
    {
      icon: Activity,
      label: 'Active Sessions',
      value: '342',
      change: 'Real-time',
      gradient: 'from-purple-600 to-purple-400',
    },
  ]

  const quickActions = [
  { icon: Building2, label: 'Manage Hospitals', action: '#' },
    { icon: UserPlus, label: 'Add Doctor', action: '#' },
    { icon: Users, label: 'View Users', action: '#' },
    { icon: BarChart3, label: 'Analytics', action: '#' },
    { icon: Settings, label: 'Settings', action: '#' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Manage hospitals, doctors, and system settings
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <LogOut className="w-5 h-5 inline mr-2" />
                Logout
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${stat.gradient}`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="card mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <motion.button
                  key={action.label}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-6 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-center"
                >
                  <Icon className="w-8 h-8 text-primary dark:text-accent mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {action.label}
                  </p>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="card"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      System activity {item}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item} hour{item > 1 ? 's' : ''} ago
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Active
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AdminDashboard

