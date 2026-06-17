import { useState, useEffect, useContext } from 'react'
import { motion } from 'framer-motion'
import { Users, Calendar, FileText, Upload, Clock, Plus, Download, ChevronRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader'
import StatCard from '../../components/dashboard/StatCard'
import { getPatientAppointments } from '../../services/appointmentService'
import { AuthContext } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'

const PatientDashboard = () => {
  const { user } = useContext(AuthContext)
  const { showError } = useToast()
  
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const appts = await getPatientAppointments(user.uid)
        appts.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
        setAppointments(appts)
      } catch (err) {
        showError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [user.uid])

  const upcomingAppts = appointments.filter(a => new Date(a.appointmentDate) >= new Date(new Date().setHours(0,0,0,0)) && a.status !== 'cancelled')
  const pastAppts = appointments.filter(a => new Date(a.appointmentDate) < new Date(new Date().setHours(0,0,0,0)) || a.status === 'completed')

  const navigate = useNavigate()

  const stats = [
    { icon: Calendar, label: 'Upcoming Appointments', value: upcomingAppts.length.toString(), change: 'Scheduled', gradient: 'from-blue-600 to-blue-400', onClick: () => navigate('/patient/appointments') },
    { icon: Clock, label: 'Past Appointments', value: pastAppts.length.toString(), change: 'History', gradient: 'from-purple-600 to-purple-400', onClick: () => navigate('/patient/appointments') },
    { icon: FileText, label: 'Medical Files', value: 'Vault', change: 'View All', gradient: 'from-teal-600 to-teal-400', onClick: () => navigate('/patient/documents') },
  ]

  const quickActions = [
    { icon: Calendar, label: 'Book Appointment', to: '/patient/hospitals' },
    { icon: FileText, label: 'My Records', to: '/patient/documents' },
  ]

  return (
    <div>
      <DashboardPageHeader
        role="patient"
        title="Patient Dashboard"
        subtitle="Manage appointments, view records, and upload medical files"
        action={
          <Link to="/patient/hospitals" className="btn-primary inline-flex items-center text-sm">
            <Plus className="w-4 h-4 mr-2" />
            Book Appointment
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
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
            <Link to="/patient/appointments" className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors">
              View all
            </Link>
          </div>
          
          <div className="space-y-3">
            {loading ? (
              [1,2].map(i => <div key={i} className="h-20 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl" />)
            ) : upcomingAppts.length === 0 ? (
              <div className="text-center py-6 text-slate-500">No upcoming appointments.</div>
            ) : (
              upcomingAppts.slice(0, 4).map((appointment) => (
                <Link
                  key={appointment.id}
                  to={`/patient/appointments/${appointment.id}`}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-700/30 border-l-4 border-l-teal-500 hover:border-slate-300 dark:hover:border-slate-600/50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-teal-500/15">
                      <Calendar className="w-5 h-5 text-teal-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors">{appointment.doctorName}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {appointment.hospitalName} &bull; {appointment.appointmentDate} at {appointment.appointmentTime}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-teal-500 transition-colors" />
                </Link>
              ))
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="dashboard-card"
        >
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.label}
                  to={action.to}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-700/30 hover:border-teal-500/30 dark:hover:bg-slate-800/70 hover:shadow-sm transition-all group"
                >
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                    <Icon className="w-5 h-5 text-teal-500" />
                  </div>
                  <span className="font-medium text-slate-900 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{action.label}</span>
                </Link>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default PatientDashboard
