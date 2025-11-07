import { motion } from 'framer-motion'
import { UserCheck, Calendar, Users, FileText, Clock, LogOut, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

const DoctorDashboard = () => {
  const stats = [
    {
      icon: Calendar,
      label: 'Today\'s Appointments',
      value: '8',
      change: '3 upcoming',
      gradient: 'from-blue-600 to-blue-400',
    },
    {
      icon: Users,
      label: 'Total Patients',
      value: '142',
      change: '+5 this week',
      gradient: 'from-cyan-600 to-cyan-400',
    },
    {
      icon: FileText,
      label: 'Prescriptions',
      value: '23',
      change: 'This month',
      gradient: 'from-teal-600 to-teal-400',
    },
    {
      icon: Clock,
      label: 'Pending Reviews',
      value: '5',
      change: 'Require attention',
      gradient: 'from-purple-600 to-purple-400',
    },
  ]

  const upcomingAppointments = [
    { id: 1, patient: 'John Doe', time: '09:00 AM', type: 'Follow-up', status: 'Confirmed' },
    { id: 2, patient: 'Jane Smith', time: '10:30 AM', type: 'Consultation', status: 'Confirmed' },
    { id: 3, patient: 'Mike Johnson', time: '02:00 PM', type: 'Check-up', status: 'Pending' },
    { id: 4, patient: 'Sarah Williams', time: '03:30 PM', type: 'Follow-up', status: 'Confirmed' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Doctor Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Manage appointments, patients, and prescriptions
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="btn-primary inline-flex items-center text-sm">
                <Plus className="w-4 h-4 mr-2" />
                New Prescription
              </button>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Appointments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2 card"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Upcoming Appointments
              </h2>
              <Link
                to="#"
                className="text-sm text-primary dark:text-accent hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <motion.div
                  key={appointment.id}
                  whileHover={{ scale: 1.02, x: 4 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border-l-4 border-primary"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {appointment.patient}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {appointment.type} • {appointment.time}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      appointment.status === 'Confirmed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}
                  >
                    {appointment.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="card"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Quick Actions
            </h2>
            <div className="space-y-4">
              {[
                { icon: Calendar, label: 'View Calendar', action: '#' },
                { icon: Users, label: 'My Patients', action: '#' },
                { icon: FileText, label: 'Prescriptions', action: '#' },
                { icon: Clock, label: 'Schedule', action: '#' },
              ].map((action, index) => {
                const Icon = action.icon
                return (
                  <motion.button
                    key={action.label}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-primary dark:text-accent" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {action.label}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard

