import { motion } from 'framer-motion'
import { Users, Calendar, FileText, Upload, Clock, LogOut, Plus, Download } from 'lucide-react'
import { Link } from 'react-router-dom'

const PatientDashboard = () => {
  const stats = [
    {
      icon: Calendar,
      label: 'Upcoming Appointments',
      value: '3',
      change: 'Next: Tomorrow',
      gradient: 'from-blue-600 to-blue-400',
    },
    {
      icon: FileText,
      label: 'Prescriptions',
      value: '5',
      change: 'Active',
      gradient: 'from-cyan-600 to-cyan-400',
    },
    {
      icon: Upload,
      label: 'Medical Files',
      value: '12',
      change: 'Uploaded',
      gradient: 'from-teal-600 to-teal-400',
    },
    {
      icon: Clock,
      label: 'Past Appointments',
      value: '24',
      change: 'All time',
      gradient: 'from-purple-600 to-purple-400',
    },
  ]

  const upcomingAppointments = [
    { id: 1, doctor: 'Dr. Sarah Johnson', date: 'Tomorrow', time: '10:00 AM', type: 'Consultation' },
    { id: 2, doctor: 'Dr. Michael Brown', date: 'Dec 25', time: '02:30 PM', type: 'Follow-up' },
    { id: 3, doctor: 'Dr. Emily Davis', date: 'Dec 28', time: '11:00 AM', type: 'Check-up' },
  ]

  const recentFiles = [
    { id: 1, name: 'Lab Results - Blood Test', date: 'Dec 15, 2024', type: 'PDF' },
    { id: 2, name: 'X-Ray Report', date: 'Dec 10, 2024', type: 'Image' },
    { id: 3, name: 'Prescription - Medication', date: 'Dec 8, 2024', type: 'PDF' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Patient Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Manage appointments, view records, and upload medical files
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="btn-primary inline-flex items-center text-sm">
                <Plus className="w-4 h-4 mr-2" />
                Book Appointment
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
                        {appointment.doctor}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {appointment.type} • {appointment.date} at {appointment.time}
                      </p>
                    </div>
                  </div>
                  <button className="px-4 py-2 rounded-lg text-sm font-medium text-primary dark:text-accent border border-primary dark:border-accent hover:bg-primary/10 dark:hover:bg-accent/10 transition-colors">
                    View
                  </button>
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
                { icon: Calendar, label: 'Book Appointment', action: '#' },
                { icon: Upload, label: 'Upload File', action: '#' },
                { icon: FileText, label: 'View Prescriptions', action: '#' },
                { icon: Users, label: 'My Records', action: '#' },
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

        {/* Recent Medical Files */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="card mt-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Recent Medical Files
            </h2>
            <button className="btn-secondary inline-flex items-center text-sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload New File
            </button>
          </div>
          <div className="space-y-4">
            {recentFiles.map((file) => (
              <motion.div
                key={file.id}
                whileHover={{ scale: 1.01, x: 4 }}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <FileText className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {file.date} • {file.type}
                    </p>
                  </div>
                </div>
                <button className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default PatientDashboard

