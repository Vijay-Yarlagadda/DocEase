import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Search } from 'lucide-react'
import {
  getAllAppointments,
  getUpcomingAppointments,
  getAppointmentStats,
} from '../../services/adminService'
import { useToast } from '../Toast'
import { PanelSkeleton } from './SkeletonLoader'

const statusStyle = {
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  confirmed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  completed: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/20',
}

const StatPill = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/90 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-700/30">
    <div className={`p-2 rounded-lg ${color}`}>
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">{value}</p>
      <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
    </div>
  </div>
)

const AppointmentManagementPanel = ({ compact = false }) => {
  const [appointments, setAppointments] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')
  const { showError } = useToast()

  useEffect(() => {
    Promise.all([getAllAppointments(), getUpcomingAppointments(), getAppointmentStats()])
      .then(([all, up, st]) => {
        setAppointments(all)
        setUpcoming(up)
        setStats(st)
      })
      .catch((err) => showError(err.message || 'Failed to load appointments'))
      .finally(() => setLoading(false))
  }, [])

  const displayed = useMemo(() => {
    const base = tab === 'upcoming' ? upcoming : appointments
    const q = search.toLowerCase()
    if (!q) return base
    return base.filter(
      (a) =>
        a.patientName?.toLowerCase().includes(q) ||
        a.doctorName?.toLowerCase().includes(q) ||
        a.status?.toLowerCase().includes(q)
    )
  }, [appointments, upcoming, tab, search])

  if (loading) return <PanelSkeleton rows={compact ? 4 : 6} />

  return (
    <div className="space-y-6">
      {stats && !compact && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <StatPill icon={Calendar} label="Total" value={stats.total} color="bg-blue-500/15 text-blue-400" />
          <StatPill icon={Clock} label="Today" value={stats.today} color="bg-cyan-500/15 text-cyan-400" />
          <StatPill icon={AlertCircle} label="Pending" value={stats.pending} color="bg-amber-500/15 text-amber-400" />
          <StatPill icon={CheckCircle} label="Confirmed" value={stats.confirmed} color="bg-emerald-500/15 text-emerald-400" />
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="dashboard-card">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              {tab === 'upcoming' ? 'Upcoming Appointments' : 'All Appointments'}
            </h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:ml-auto w-full sm:w-auto">
            <div className="flex rounded-lg border border-slate-700/50 overflow-hidden">
              {['all', 'upcoming'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    tab === t ? 'bg-primary/20 text-accent' : 'text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="relative sm:w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="dashboard-input pl-10 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2 max-h-[28rem] overflow-y-auto">
          {displayed.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-10">No appointments found</p>
          )}
          {displayed.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ x: 4 }}
              className="flex flex-col sm:flex-row sm:items-center gap-2 p-4 rounded-xl bg-white/90 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-700/30 border-l-4 border-l-primary hover:border-slate-300 dark:hover:border-slate-600/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 dark:text-white truncate">{a.patientName || 'Patient'}</p>
                <p className="text-sm text-slate-500 truncate">
                  Dr. {a.doctorName || '—'} &bull; {a.date} {a.time ? `at ${a.time}` : ''}
                </p>
              </div>
              <span className={`self-start sm:self-center px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize border ${statusStyle[a.status] || statusStyle.pending}`}>
                {a.status || 'pending'}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default AppointmentManagementPanel
