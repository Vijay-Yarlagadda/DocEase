import { useEffect, useState, useContext } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { UserCheck, Users, Calendar, CalendarDays, ArrowRight, Building2, Stethoscope } from 'lucide-react'
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader'
import AnimatedStatCard from '../../components/admin/AnimatedStatCard'
import AppointmentChart from '../../components/admin/AppointmentChart'
import NotificationsPanel from '../../components/admin/NotificationsPanel'
import AppointmentManagementPanel from '../../components/admin/AppointmentManagementPanel'
import { StatCardSkeleton } from '../../components/admin/SkeletonLoader'
import {
  getAdminDashboardStats,
  getWeeklyAppointmentData,
  getAdminNotifications,
  getUpcomingAppointments,
} from '../../services/adminService'
import { AuthContext } from '../../context/AuthContext'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [chartData, setChartData] = useState([])
  const [notifications, setNotifications] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [loading, setLoading] = useState(true)

  const { user } = useContext(AuthContext)

  useEffect(() => {
    const hospitalId = user?.uid || user?.hospitalId || null
    if (!hospitalId) {
      setLoading(false)
      return
    }

    Promise.all([
      getAdminDashboardStats(hospitalId),
      getWeeklyAppointmentData(undefined, hospitalId),
      getAdminNotifications(),
      getUpcomingAppointments(),
    ])
      .then(([s, chart, notifs, up]) => {
        setStats(s)
        setChartData(chart)
        setNotifications(notifs)
        setUpcoming(up.slice(0, 5))
      })
      .finally(() => setLoading(false))
  }, [user])

  const navigate = useNavigate()

  const statCards = stats
    ? [
        { icon: UserCheck, label: 'Total Doctors', value: stats.totalDoctors, change: 'Registered physicians', gradient: 'from-cyan-600 to-cyan-400', onClick: () => navigate('/admin/doctors') },
        { icon: Users, label: 'Total Patients', value: stats.totalPatients, change: 'Active patient accounts', gradient: 'from-teal-600 to-teal-400', onClick: () => navigate('/admin/users') },
        { icon: Calendar, label: "Today's Appointments", value: stats.todayAppointments, change: 'Scheduled for today', gradient: 'from-blue-600 to-blue-400', onClick: () => navigate('/admin/appointments') },
        { icon: CalendarDays, label: 'Total Appointments', value: stats.totalAppointments, change: 'All time bookings', gradient: 'from-purple-600 to-purple-400', onClick: () => navigate('/admin/appointments') },
      ]
    : []

  const quickLinks = [
    { icon: Building2, label: 'Hospital Profile', to: '/admin/hospitals', color: 'hover:border-blue-500/30' },
    { icon: Stethoscope, label: 'Manage Doctors', to: '/admin/doctors', color: 'hover:border-cyan-500/30' },
    { icon: Calendar, label: 'Appointments', to: '/admin/appointments', color: 'hover:border-teal-500/30' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <DashboardPageHeader
        role="admin"
        title="Admin Dashboard"
        subtitle="Overview of doctors, patients, appointments, and hospital operations"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((stat, index) => (
              <AnimatedStatCard key={stat.label} {...stat} delay={index * 0.08} />
            ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {quickLinks.map((link, i) => {
          const Icon = link.icon
          return (
            <motion.div
              key={link.to}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
            >
              <Link
                to={link.to}
                className={`flex items-center justify-between p-4 rounded-xl bg-white/95 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-700/40 ${link.color} hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-all group`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{link.label}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </Link>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2">
          <AppointmentChart data={chartData} loading={loading} />
        </div>
        <NotificationsPanel notifications={notifications} loading={loading} />
      </div>

      {!loading && upcoming.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="dashboard-card mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Upcoming Appointments</h3>
            <Link to="/admin/appointments" className="text-xs text-accent hover:text-cyan-300 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {upcoming.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-white/95 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-700/30">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{a.patientName || 'Patient'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Dr. {a.doctorName || '—'} &bull; {a.date}</p>
                </div>
                <span className="inline-flex items-center justify-center whitespace-nowrap shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 capitalize">
                  {a.status || 'pending'}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <AppointmentManagementPanel compact />
    </motion.div>
  )
}

export default AdminDashboard
