import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, ShieldCheck, Hourglass, ShieldOff } from 'lucide-react'
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader'
import StatCard from '../../components/dashboard/StatCard'
import { getHospitalsWithStats } from '../../services/adminService'

const SuperAdminAnalytics = () => {
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getHospitalsWithStats()
      .then(setHospitals)
      .finally(() => setLoading(false))
  }, [])

  const counts = useMemo(() => {
    return hospitals.reduce(
      (totals, hospital) => {
        const status = hospital.verificationStatus || 'pending'
        totals.total += 1
        totals[status] = (totals[status] || 0) + 1
        totals.doctors += hospital.doctorCount || 0
        totals.appointments += hospital.appointmentCount || 0
        return totals
      },
      { total: 0, verified: 0, pending: 0, rejected: 0, doctors: 0, appointments: 0 }
    )
  }, [hospitals])

  const topHospitals = useMemo(() => {
    return [...hospitals]
      .sort((a, b) => (b.doctorCount || 0) - (a.doctorCount || 0))
      .slice(0, 5)
  }, [hospitals])

  return (
    <div>
      <DashboardPageHeader
        role="superadmin"
        title="Analytics"
        subtitle="Review verification performance and hospital operations in one premium dashboard."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard
          icon={ShieldCheck}
          label="Verified Hospitals"
          value={counts.verified}
          change="Approved by Super Admin"
          gradient="from-emerald-600 to-emerald-400"
        />
        <StatCard
          icon={Hourglass}
          label="Pending Reviews"
          value={counts.pending}
          change="Awaiting verification"
          gradient="from-orange-500 to-orange-300"
        />
        <StatCard
          icon={ShieldOff}
          label="Rejected Hospitals"
          value={counts.rejected}
          change="Requires corrections"
          gradient="from-rose-500 to-rose-400"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Doctors"
          value={counts.doctors}
          change="Affiliated hospital doctors"
          gradient="from-fuchsia-600 to-fuchsia-400"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.9fr] gap-6 mb-8">
        <motion.div
          className="dashboard-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-sm text-slate-500">Verification score</p>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Performance overview</h2>
            </div>
            <BarChart3 className="w-6 h-6 text-fuchsia-500" />
          </div>

          <div className="space-y-5">
            {['verified', 'pending', 'rejected'].map((status) => {
              const count = counts[status]
              const percent = counts.total ? Math.round((count / counts.total) * 100) : 0
              const color = status === 'verified' ? 'bg-emerald-500' : status === 'pending' ? 'bg-orange-500' : 'bg-rose-500'
              return (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span className="capitalize">{status}</span>
                    <span>{count} hospitals</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-900/10 overflow-hidden">
                    <div className={`${color} h-full`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        <motion.div
          className="dashboard-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
        >
          <div className="mb-6">
            <p className="text-sm text-slate-500">Top hospitals</p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Most active facilities</h2>
          </div>
          <div className="space-y-4">
            {topHospitals.length ? topHospitals.map((hospital) => (
              <div key={hospital.id} className="rounded-3xl border border-slate-200/70 dark:border-slate-800/70 bg-white/90 dark:bg-slate-900/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{hospital.name || 'Unnamed Hospital'}</p>
                    <p className="text-xs text-slate-500 mt-1">{hospital.verificationStatus || 'pending'}</p>
                  </div>
                  <span className="text-xs text-slate-500">{hospital.doctorCount ?? 0} doctors</span>
                </div>
              </div>
            )) : (
              <div className="rounded-3xl border border-slate-200/70 dark:border-slate-800/70 bg-white/90 dark:bg-slate-900/60 p-4 text-slate-500">
                No hospital data available yet.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default SuperAdminAnalytics
