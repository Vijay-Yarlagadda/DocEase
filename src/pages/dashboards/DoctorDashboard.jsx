import { useEffect, useState, useContext } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Calendar,
  Users,
  FileText,
  ClipboardList,
  User,
  Stethoscope,
  Award,
  Briefcase,
} from 'lucide-react'
import { AuthContext } from '../../context/AuthContext'
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader'
import AnimatedStatCard from '../../components/admin/AnimatedStatCard'
import { StatCardSkeleton } from '../../components/admin/SkeletonLoader'
import { getDoctorUpcomingAppointments } from '../../services/doctorService'
import { getDisplayName, getUserEmail } from '../../utils/userProfile'

const DoctorDashboard = () => {
  const { user } = useContext(AuthContext)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid) { setLoading(false); return }
    getDoctorUpcomingAppointments(user.uid, getUserEmail(user))
      .then(setAppointments)
      .finally(() => setLoading(false))
  }, [user?.uid])

  const stats = [
    { icon: Calendar, label: "Today's Schedule", value: appointments.length, change: `${appointments.length} upcoming`, gradient: 'from-blue-600 to-blue-400' },
    { icon: Users, label: 'Assigned Patients', value: new Set(appointments.map((a) => a.patientName)).size, change: 'From appointments', gradient: 'from-cyan-600 to-cyan-400' },
    { icon: FileText, label: 'Patient Documents', value: '—', change: 'View records section', gradient: 'from-teal-600 to-teal-400' },
    { icon: ClipboardList, label: 'Consultations', value: '—', change: 'Manage records', gradient: 'from-purple-600 to-purple-400' },
  ]

  const sections = [
    { icon: User, label: 'View Profile', desc: 'Your qualifications & details', to: '/doctor/settings', color: 'hover:border-cyan-500/30' },
    { icon: Calendar, label: 'Assigned Appointments', desc: `${appointments.length} upcoming`, to: '/doctor/appointments', color: 'hover:border-blue-500/30' },
    { icon: FileText, label: 'Patient Documents', desc: 'Medical files & reports', to: '/doctor/records', color: 'hover:border-teal-500/30' },
    { icon: ClipboardList, label: 'Consultation Records', desc: 'Notes & prescriptions', to: '/doctor/records', color: 'hover:border-purple-500/30' },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <DashboardPageHeader
        role="doctor"
        title={`Welcome, ${getDisplayName(user)}`}
        subtitle="Manage appointments, patient documents, and consultation records"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : stats.map((stat, i) => <AnimatedStatCard key={stat.label} {...stat} delay={i * 0.08} loading={loading} />)}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {sections.map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
              <Link to={s.to} className={`block p-5 rounded-xl bg-white/95 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-700/40 ${s.color} hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-all group h-full`}>
                <Icon className="w-6 h-6 text-accent mb-3 group-hover:scale-110 transition-transform" />
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{s.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.desc}</p>
              </Link>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 dashboard-card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Assigned Appointments</h2>
            <Link to="/doctor/appointments" className="text-sm text-accent hover:text-cyan-300">View all</Link>
          </div>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-slate-700/30 animate-pulse" />
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-10">No upcoming appointments assigned yet.</p>
          ) : (
            <div className="space-y-3">
              {appointments.slice(0, 5).map((a) => (
                <motion.div key={a.id} whileHover={{ x: 4 }} className="flex items-center justify-between p-4 rounded-xl bg-white/95 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-700/30 border-l-4 border-l-cyan-500">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{a.patientName || 'Patient'}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{a.date} {a.time ? `at ${a.time}` : ''} &bull; {a.type || 'Consultation'}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 capitalize">
                    {a.status || 'confirmed'}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="dashboard-card">
          <div className="flex items-center gap-2 mb-5">
            <Stethoscope className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">My Profile</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/95 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-700/30">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 to-cyan-400 flex items-center justify-center text-white font-bold">
                {getDisplayName(user).slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{getDisplayName(user)}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{getUserEmail(user)}</p>
              </div>
            </div>
            {user?.specialization && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Stethoscope className="w-4 h-4 text-accent" />
                {user.specialization}
              </div>
            )}
            {user?.qualification && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Award className="w-4 h-4 text-accent" />
                {user.qualification}
              </div>
            )}
            {user?.experience != null && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Briefcase className="w-4 h-4 text-accent" />
                {user.experience} years experience
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default DoctorDashboard
