import { useEffect, useState, useContext, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Activity, CalendarDays, Users, BarChart3 } from 'lucide-react'
import { AuthContext } from '../../context/AuthContext'
import {
  getDoctorAppointmentStats,
  getMonthlyAppointmentTrends,
  getPatientRegistrationTrends,
  getHospitalPerformanceMetrics,
} from '../../services/adminService'
import { useToast } from '../Toast'
import { PanelSkeleton } from './SkeletonLoader'

const barColors = ['from-blue-600 to-cyan-400', 'from-cyan-600 to-teal-400', 'from-purple-600 to-blue-400']

const MiniBarRow = ({ label, value, percent }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
      <span>{label}</span>
      <span className="font-semibold text-slate-900 dark:text-white">{value}</span>
    </div>
    <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
      <div className="h-full rounded-full bg-gradient-to-r from-accent to-secondary" style={{ width: `${percent}%` }} />
    </div>
  </div>
)

const AdminAnalyticsPanel = () => {
  const { user } = useContext(AuthContext)
  const [doctorStats, setDoctorStats] = useState([])
  const [monthlyTrend, setMonthlyTrend] = useState([])
  const [patientTrend, setPatientTrend] = useState([])
  const [hospitalMetrics, setHospitalMetrics] = useState([])
  const [loading, setLoading] = useState(true)
  const { showError } = useToast()

  useEffect(() => {
    if (!user) return

    Promise.all([
      getDoctorAppointmentStats(user.uid),
      getMonthlyAppointmentTrends(6, user.uid),
      getPatientRegistrationTrends(6),
      getHospitalPerformanceMetrics(),
    ])
      .then(([doctorStats, monthlyTrend, patientTrend, hospitalMetrics]) => {
        setDoctorStats(doctorStats)
        setMonthlyTrend(monthlyTrend)
        setPatientTrend(patientTrend)
        setHospitalMetrics(hospitalMetrics)
      })
      .catch((err) => showError(err.message || 'Failed to load analytics data'))
      .finally(() => setLoading(false))
  }, [user, showError])

  const topDoctors = useMemo(
    () => [...doctorStats].sort((a, b) => b.appointmentCount - a.appointmentCount).slice(0, 4),
    [doctorStats]
  )

  if (loading) return <PanelSkeleton rows={5} />

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="dashboard-card"
        >
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="w-5 h-5 text-accent" />
            <div>
              <p className="text-base font-semibold text-slate-900 dark:text-white">Monthly Appointment Trends</p>
              <p className="text-xs text-slate-500">Last 6 months</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {monthlyTrend.map((item) => (
              <MiniBarRow
                key={item.key}
                label={item.label}
                value={item.count}
                percent={Math.min(item.count * 8, 100)}
              />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="dashboard-card"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-accent" />
            <div>
              <p className="text-base font-semibold text-slate-900 dark:text-white">Patient Registrations</p>
              <p className="text-xs text-slate-500">Recent patient signups</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {patientTrend.map((item) => (
              <MiniBarRow
                key={item.key}
                label={item.label}
                value={item.count}
                percent={Math.min(item.count * 12, 100)}
              />
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="dashboard-card"
      >
        <div className="flex items-center justify-between mb-5 gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent" />
            <div>
              <p className="text-base font-semibold text-slate-900 dark:text-white">Top Performing Doctors</p>
              <p className="text-xs text-slate-500">Doctor-wise appointment breakdown</p>
            </div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {topDoctors.map((doctor, index) => (
            <div key={doctor.id} className="rounded-2xl border border-slate-200/70 dark:border-slate-700/40 bg-white/90 dark:bg-slate-900/50 p-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">{doctor.name || 'Unnamed'}</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">{doctor.appointmentCount}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{doctor.specialization || 'General'}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="dashboard-card"
      >
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 className="w-5 h-5 text-accent" />
          <div>
            <p className="text-base font-semibold text-slate-900 dark:text-white">Hospital Performance Metrics</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Doctor and appointment performance by hospital</p>
          </div>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {hospitalMetrics.map((hospital) => (
            <div key={hospital.id} className="rounded-2xl border border-slate-200/70 dark:border-slate-700/40 bg-white/90 dark:bg-slate-900/50 p-4">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{hospital.name}</p>
              <div className="grid gap-2 mt-3 text-slate-500 dark:text-slate-400 text-[13px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-700 dark:text-slate-300">Doctors</span>
                  <span className="text-slate-900 dark:text-white">{hospital.doctorCount}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-700 dark:text-slate-300">Appointments</span>
                  <span className="text-slate-900 dark:text-white">{hospital.appointmentCount}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-700 dark:text-slate-300">Patients</span>
                  <span className="text-slate-900 dark:text-white">{hospital.patientCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default AdminAnalyticsPanel
