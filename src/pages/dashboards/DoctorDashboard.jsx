import { motion } from 'framer-motion'
import { Calendar, Users, FileText, Clock, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader'
import StatCard from '../../components/dashboard/StatCard'

const DoctorDashboard = () => {
  const stats = [
    { icon: Calendar, label: "Today's Appointments", value: '8', change: '3 upcoming', gradient: 'from-blue-600 to-blue-400' },
    { icon: Users, label: 'Total Patients', value: '142', change: '+5 this week', gradient: 'from-cyan-600 to-cyan-400' },
    { icon: FileText, label: 'Prescriptions', value: '23', change: 'This month', gradient: 'from-teal-600 to-teal-400' },
    { icon: Clock, label: 'Pending Reviews', value: '5', change: 'Require attention', gradient: 'from-purple-600 to-purple-400' },
  ]

  const upcomingAppointments = [
    { id: 1, patient: 'John Doe', time: '09:00 AM', type: 'Follow-up', status: 'Confirmed' },
    { id: 2, patient: 'Jane Smith', time: '10:30 AM', type: 'Consultation', status: 'Confirmed' },
    { id: 3, patient: 'Mike Johnson', time: '02:00 PM', type: 'Check-up', status: 'Pending' },
    { id: 4, patient: 'Sarah Williams', time: '03:30 PM', type: 'Follow-up', status: 'Confirmed' },
  ]

  const quickActions = [
    { icon: Calendar, label: 'View Calendar' },
    { icon: Users, label: 'My Patients' },
    { icon: FileText, label: 'Prescriptions' },
    { icon: Clock, label: 'Schedule' },
  ]

  return (
    <div>
      <DashboardPageHeader
        role="doctor"
        title="Doctor Dashboard"
        subtitle="Manage appointments, patients, and prescriptions"
        action={
          <button className="btn-primary inline-flex items-center text-sm">
            <Plus className="w-4 h-4 mr-2" />
            New Prescription
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={stat.label} {...stat} delay={index * 0.08} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2 dashboard-card"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white">Upcoming Appointments</h2>
            <Link to="#" className="text-sm text-accent hover:text-cyan-300 transition-colors">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingAppointments.map((appointment) => (
              <motion.div
                key={appointment.id}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-700/30 border-l-4 border-l-primary hover:border-slate-600/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/15">
                    <Calendar className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{appointment.patient}</p>
                    <p className="text-sm text-slate-500">
                      {appointment.type} &bull; {appointment.time}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    appointment.status === 'Confirmed'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {appointment.status}
                </span>
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
          <h2 className="text-lg font-bold text-white mb-5">Quick Actions</h2>
          <div className="space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <motion.button
                  key={action.label}
                  whileHover={{ x: 4 }}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/50 border border-slate-700/30 hover:border-primary/30 hover:bg-slate-800/80 transition-all"
                >
                  <Icon className="w-5 h-5 text-accent" />
                  <span className="font-medium text-slate-300">{action.label}</span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default DoctorDashboard
