import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Eye } from 'lucide-react'
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader'
import SuperAdminStatusBadge from '../../components/superadmin/SuperAdminStatusBadge'
import { getAllHospitals } from '../../services/adminService'

const SuperAdminHospitals = () => {
  const [hospitals, setHospitals] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllHospitals()
      .then(setHospitals)
      .finally(() => setLoading(false))
  }, [])

  const filteredHospitals = useMemo(() => {
    const query = search.trim().toLowerCase()
    return hospitals.filter((hospital) => {
      const status = (hospital.verificationStatus || 'pending').toLowerCase()
      const matchesStatus = filter === 'all' || status === filter
      const matchesSearch = !query || [hospital.name, hospital.address, hospital.email, hospital.phone]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
      return matchesStatus && matchesSearch
    })
  }, [hospitals, filter, search])

  return (
    <div>
      <DashboardPageHeader
        role="superadmin"
        title="Hospitals"
        subtitle="View every registered hospital and verify contact, documents, and status details."
      />

      <div className="dashboard-card mb-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">Hospital directory</p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">All hospitals</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or address"
                className="w-full rounded-3xl border border-slate-200/70 bg-white/90 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/15 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-3xl border border-slate-200/70 bg-white/90 py-3 px-4 text-sm text-slate-900 outline-none focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/15 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="all">All statuses</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-slate-200/70 dark:border-slate-800/70 bg-white/95 dark:bg-slate-900/70">
        <div className="grid grid-cols-6 gap-4 px-5 py-4 text-xs uppercase tracking-[0.3em] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-950">
          <span className="col-span-2">Hospital</span>
          <span>Status</span>
          <span>Contact</span>
          <span>Documents</span>
          <span className="text-right">Details</span>
        </div>
        <div className="divide-y divide-slate-200/70 dark:divide-slate-800">
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="px-5 py-5 animate-pulse">
                <div className="h-4 rounded-full bg-slate-200 dark:bg-slate-800 w-3/4 mb-3" />
                <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800 w-1/2" />
              </div>
            ))
          ) : filteredHospitals.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No hospitals match your search.</div>
          ) : (
            filteredHospitals.map((hospital) => (
              <div key={hospital.id} className="grid grid-cols-6 gap-4 px-5 py-5 items-center text-sm text-slate-700 dark:text-slate-200">
                <div className="col-span-2">
                  <p className="font-semibold text-slate-900 dark:text-white">{hospital.name || 'Unnamed Hospital'}</p>
                  <p className="text-xs text-slate-500 mt-1">{hospital.address || 'No address provided'}</p>
                </div>
                <div><SuperAdminStatusBadge status={hospital.verificationStatus} /></div>
                <div>{hospital.phone || hospital.email || 'N/A'}</div>
                <div>{hospital.documents?.length ?? 0}</div>
                <div className="text-right text-slate-500">{hospital.documents?.length ? 'Documents ready' : 'No docs'}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default SuperAdminHospitals
