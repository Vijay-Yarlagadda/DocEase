import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Building2, ShieldCheck, Hourglass, ShieldOff, Sparkles, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader'
import StatCard from '../../components/dashboard/StatCard'
import { getAllHospitals } from '../../services/adminService'

const SuperAdminDashboard = () => {
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllHospitals()
      .then(setHospitals)
      .finally(() => setLoading(false))
  }, [])

  const counts = useMemo(() => {
    return hospitals.reduce(
      (totals, hospital) => {
        const status = hospital.verificationStatus || 'pending'
        totals.total += 1
        totals[status] = (totals[status] || 0) + 1
        return totals
      },
      { total: 0, verified: 0, pending: 0, rejected: 0 }
    )
  }, [hospitals])

  const stats = [
    {
      icon: Building2,
      label: 'Total Hospitals',
      value: counts.total,
      change: 'All registered hospital profiles',
      gradient: 'from-fuchsia-600 to-pink-500',
    },
    {
      icon: ShieldCheck,
      label: 'Verified Hospitals',
      value: counts.verified,
      change: 'Approved and live',
      gradient: 'from-emerald-600 to-emerald-400',
    },
    {
      icon: Hourglass,
      label: 'Pending Hospitals',
      value: counts.pending,
      change: 'Awaiting Super Admin review',
      gradient: 'from-orange-500 to-orange-300',
    },
    {
      icon: ShieldOff,
      label: 'Rejected Hospitals',
      value: counts.rejected,
      change: 'Requires admin follow-up',
      gradient: 'from-rose-500 to-rose-400',
    },
  ]

  const topPending = useMemo(() => hospitals.filter((hospital) => (hospital.verificationStatus || 'pending') === 'pending').slice(0, 5), [hospitals])

  return (
    <div>
      <DashboardPageHeader
        role="superadmin"
        title="Super Admin Dashboard"
        subtitle="Manage hospital verification, approvals, and system health in a secure control center."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {stats.map((item, index) => (
          <StatCard key={item.label} {...item} delay={index * 0.07} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-6 mb-8">
        <motion.div
          className="dashboard-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <p className="text-sm text-slate-500">Verification Queue</p>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Pending hospitals</h2>
            </div>
            <Link to="/super-admin/verification" className="text-xs uppercase tracking-[0.18em] text-fuchsia-500 font-semibold hover:text-fuchsia-400">
              Review all <ArrowRight className="inline-block w-3 h-3 ml-1" />
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-20 rounded-3xl bg-slate-100/80 dark:bg-slate-900/70 animate-pulse" />
              ))
            ) : topPending.length ? (
              topPending.map((hospital) => (
                <div key={hospital.id} className="rounded-3xl border border-slate-200/70 dark:border-slate-800/70 bg-white/90 dark:bg-slate-900/60 p-4">
                  <p className="font-semibold text-slate-900 dark:text-white">{hospital.name || 'Unnamed Hospital'}</p>
                  <p className="text-sm text-slate-500 mt-1">{hospital.address || 'No address provided'}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span className="px-2 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/15">Pending verification</span>
                    <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{hospital.documents?.length ?? 0} documents</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-slate-200/70 dark:border-slate-800/70 bg-white/90 dark:bg-slate-900/60 p-6 text-slate-500">
                No pending hospitals at the moment. Great work keeping the network secure.
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          className="dashboard-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-slate-500">Verification health</p>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Status distribution</h2>
            </div>
            <Sparkles className="w-6 h-6 text-fuchsia-500" />
          </div>

          <div className="space-y-4">
            {['verified', 'pending', 'rejected'].map((status) => {
              const value = counts[status]
              const percent = counts.total ? Math.round((value / counts.total) * 100) : 0
              const colors = {
                verified: 'bg-emerald-500',
                pending: 'bg-orange-500',
                rejected: 'bg-rose-500',
              }
              return (
                <div key={status}>
                  <div className="flex items-center justify-between text-sm text-slate-500 mb-1">
                    <span className="capitalize">{status}</span>
                    <span>{value} hospitals</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800/80 overflow-hidden">
                    <div className={`${colors[status]} h-full`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      <div className="dashboard-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <p className="text-sm text-slate-500">Hospital snapshot</p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Recently registered hospitals</h2>
          </div>
          <Link to="/super-admin/hospitals" className="text-xs uppercase tracking-[0.18em] text-fuchsia-500 font-semibold hover:text-fuchsia-400">
            Explore hospitals <ArrowRight className="inline-block w-3 h-3 ml-1" />
          </Link>
        </div>
        <div className="grid gap-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-24 rounded-3xl bg-slate-100/80 dark:bg-slate-900/70 animate-pulse" />
            ))
          ) : hospitals.slice(0, 4).map((hospital) => (
            <div key={hospital.id} className="rounded-3xl border border-slate-200/70 dark:border-slate-800/70 bg-white/90 dark:bg-slate-900/60 p-4 grid grid-cols-1 md:grid-cols-[1fr_150px] gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{hospital.name || 'Unnamed Hospital'}</p>
                <p className="text-sm text-slate-500 mt-1">{hospital.address || 'Address unavailable'}</p>
                <p className="mt-3 text-xs text-slate-500">Admin email: {hospital.email || hospital.contact || 'Unknown'}</p>
              </div>
              <div className="flex flex-col justify-between gap-3">
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Status
                  <span className={`px-2 py-1 rounded-full ${hospital.verificationStatus === 'verified' ? 'bg-emerald-500/10 text-emerald-300' : hospital.verificationStatus === 'rejected' ? 'bg-rose-500/10 text-rose-300' : 'bg-orange-500/10 text-orange-300'}`}>
                    {hospital.verificationStatus || 'pending'}
                  </span>
                </div>
                <div className="text-right text-sm font-semibold text-slate-900 dark:text-white">{hospital.documents?.length ?? 0} documents</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SuperAdminDashboard
