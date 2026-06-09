import { motion } from 'framer-motion'
import { Users, Calendar, FileText, Upload, Clock, Plus, Download } from 'lucide-react'
import { Link } from 'react-router-dom'
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader'
import StatCard from '../../components/dashboard/StatCard'

const PatientDashboard = () => {
  const stats = [
    { icon: Calendar, label: 'Upcoming Appointments', value: '3', change: 'Next: Tomorrow', gradient: 'from-blue-600 to-blue-400' },
    { icon: FileText, label: 'Prescriptions', value: '5', change: 'Active', gradient: 'from-cyan-600 to-cyan-400' },
    { icon: Upload, label: 'Medical Files', value: '12', change: 'Uploaded', gradient: 'from-teal-600 to-teal-400' },
    { icon: Clock, label: 'Past Appointments', value: '24', change: 'All time', gradient: 'from-purple-600 to-purple-400' },
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

  const quickActions = [
    { icon: Calendar, label: 'Book Appointment' },
    { icon: Upload, label: 'Upload File' },
    { icon: FileText, label: 'View Prescriptions' },
    { icon: Users, label: 'My Records' },
  ]

  return (
    <div>
      <DashboardPageHeader
        role="patient"
        title="Patient Dashboard"
        subtitle="Manage appointments, view records, and upload medical files"
        action={
          <button className="btn-primary inline-flex items-center text-sm">
            <Plus className="w-4 h-4 mr-2" />
            Book Appointment
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={stat.label} {...stat} delay={index * 0.08} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2 dashboard-card"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Upcoming Appointments</h2>
            <Link to="#" className="text-sm text-accent hover:text-cyan-300 transition-colors">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingAppointments.map((appointment) => (
              <motion.div
                key={appointment.id}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between p-4 rounded-xl bg-white/95 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-700/30 border-l-4 border-l-teal-500 hover:border-slate-300 dark:hover:border-slate-600/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-teal-500/15">
                    <Calendar className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{appointment.doctor}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {appointment.type} &bull; {appointment.date} at {appointment.time}
                    </p>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-accent border border-accent/30 hover:bg-accent/10 transition-colors">
                  View
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="dashboard-card"
        >
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5">Quick Actions</h2>
          <div className="space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <motion.button
                  key={action.label}
                  whileHover={{ x: 4 }}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-white/95 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-700/30 hover:border-teal-500/30 dark:hover:bg-slate-800/70 transition-all"
                >
                  <Icon className="w-5 h-5 text-teal-400" />
                  <span className="font-medium text-slate-900 dark:text-slate-300">{action.label}</span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="dashboard-card"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Medical Files</h2>
          <Link to="/patient/documents" className="btn-secondary inline-flex items-center text-sm">
            <Upload className="w-4 h-4 mr-2" />
            Upload New File
          </Link>
        </div>
        <div className="space-y-3">
          {recentFiles.map((file) => (
            <motion.div
              key={file.id}
              whileHover={{ x: 4 }}
              className="flex items-center justify-between p-4 rounded-xl bg-white/95 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-700/30 hover:border-slate-300 dark:hover:border-slate-600/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-accent/15">
                  <FileText className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{file.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{file.date} &bull; {file.type}</p>
                </div>
              </div>
              <button className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                <Download className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default PatientDashboard
