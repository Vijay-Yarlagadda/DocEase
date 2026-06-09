import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, CheckCircle2, XCircle, Eye, Filter, ArrowRight } from 'lucide-react'
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader'
import SuperAdminStatusBadge from '../../components/superadmin/SuperAdminStatusBadge'
import PDFViewer from '../../components/PDFViewer'
import { approveHospital, getAllHospitals, rejectHospital } from '../../services/adminService'

const statusOptions = ['all', 'verified', 'pending', 'rejected']

const HospitalDetailsModal = ({ hospital, onClose, onViewDocument }) => {
  if (!hospital) return null
  
  const handleViewDocument = (url, docName) => {
    if (!url) return
    console.log('[Document Viewer] Opening document', {
      documentName: docName,
      url,
    })
    onViewDocument(url, docName)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4 py-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.93 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl rounded-3xl border border-slate-800/80 bg-slate-950/95 p-6 shadow-2xl my-8"
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-sm text-slate-400 uppercase tracking-[0.2em]">Hospital details</p>
            <h2 className="text-2xl font-semibold text-white">{hospital.name || 'Hospital information'}</h2>
          </div>
          <button onClick={onClose} className="rounded-2xl bg-slate-800/90 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">
            Close
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-[0.2em]">Status</p>
              <div className="mt-2"><SuperAdminStatusBadge status={hospital.verificationStatus} /></div>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-[0.2em]">Address</p>
              <p className="mt-1 text-slate-100">{hospital.address || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-[0.2em]">Admin Email</p>
              <p className="mt-1 text-slate-100">{hospital.email || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-[0.2em]">Contact</p>
              <p className="mt-1 text-slate-100">{hospital.phone || 'Not provided'}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-[0.2em]">Description</p>
              <p className="mt-2 text-slate-300">{hospital.description || 'No description available.'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-[0.2em]">Verification Documents</p>
              <div className="mt-3 space-y-2">
                {hospital.registrationCertificateUrl ? (
                  <button
                    onClick={() => handleViewDocument(hospital.registrationCertificateUrl, 'Registration Certificate')}
                    className="w-full flex items-center gap-2 rounded-2xl border border-emerald-500/50 bg-emerald-500/10 p-3 text-sm text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400 transition text-left font-medium cursor-pointer"
                  >
                    <span>📄</span>
                    <span>Registration Certificate</span>
                    <span className="ml-auto text-xs">→</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-700/50 bg-slate-800/50 p-3 text-sm text-slate-500">
                    <span>📄</span>
                    <span>Registration Certificate - Not uploaded</span>
                  </div>
                )}
                {hospital.hospitalLicenseUrl ? (
                  <button
                    onClick={() => handleViewDocument(hospital.hospitalLicenseUrl, 'Hospital License')}
                    className="w-full flex items-center gap-2 rounded-2xl border border-blue-500/50 bg-blue-500/10 p-3 text-sm text-blue-300 hover:bg-blue-500/20 hover:border-blue-400 transition text-left font-medium cursor-pointer"
                  >
                    <span>📄</span>
                    <span>Hospital License</span>
                    <span className="ml-auto text-xs">→</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-700/50 bg-slate-800/50 p-3 text-sm text-slate-500">
                    <span>📄</span>
                    <span>Hospital License - Not uploaded</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const SuperAdminVerification = () => {
  const [hospitals, setHospitals] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [selectedHospital, setSelectedHospital] = useState(null)
  const [pdfViewerState, setPdfViewerState] = useState({ isOpen: false, url: null, fileName: null })

  useEffect(() => {
    getAllHospitals()
      .then(setHospitals)
      .finally(() => setLoading(false))
  }, [])

  const filteredHospitals = useMemo(() => {
    return hospitals
      .filter((hospital) => {
        const status = (hospital.verificationStatus || 'pending').toLowerCase()
        return filter === 'all' || status === filter
      })
      .filter((hospital) => {
        const query = search.trim().toLowerCase()
        if (!query) return true
        return [hospital.name, hospital.address, hospital.email, hospital.phone]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query))
      })
  }, [hospitals, filter, search])

  const handleStatusUpdate = async (hospitalId, status) => {
    setUpdatingId(hospitalId)
    try {
      if (status === 'verified') {
        await approveHospital(hospitalId)
      } else {
        await rejectHospital(hospitalId)
      }
      setHospitals((prev) => prev.map((hospital) => (
        hospital.id === hospitalId ? { ...hospital, verificationStatus: status } : hospital
      )))
    } catch (error) {
      console.error('Status update failed', error)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div>
      <DashboardPageHeader
        role="superadmin"
        title="Hospital Verification"
        subtitle="Review, approve, and reject hospitals submitted for verification."
      />

      <div className="grid gap-6 mb-8 xl:grid-cols-[1fr_0.45fr]">
        <div className="dashboard-card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <p className="text-sm text-slate-500">Verification workflow</p>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Approval queue</h2>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setFilter('all')} className={`rounded-full px-4 py-2 text-xs font-semibold ${filter === 'all' ? 'bg-fuchsia-500 text-white' : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'}`}>
                All
              </button>
              {statusOptions.filter((status) => status !== 'all').map((statusOption) => (
                <button
                  type="button"
                  key={statusOption}
                  onClick={() => setFilter(statusOption)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold ${filter === statusOption ? 'bg-slate-100 text-slate-900' : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'}`}
                >
                  {statusOption}
                </button>
              ))}
            </div>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hospitals, email or address"
              className="w-full rounded-3xl border border-slate-200/70 bg-white/90 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/15 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-slate-200/70 dark:border-slate-800/70 bg-white/95 dark:bg-slate-900/70">
            <div className="grid grid-cols-6 gap-4 px-5 py-4 text-xs uppercase tracking-[0.3em] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-950">
              <span className="col-span-2">Hospital</span>
              <span>Status</span>
              <span>Contact</span>
              <span>Docs</span>
              <span className="text-right">Actions</span>
            </div>
            <div className="divide-y divide-slate-200/70 dark:divide-slate-800">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="px-5 py-4 animate-pulse">
                    <div className="h-4 rounded-full bg-slate-200 dark:bg-slate-800 w-3/4 mb-3" />
                    <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800 w-1/2" />
                  </div>
                ))
              ) : filteredHospitals.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No hospitals match your filters.</div>
              ) : (
                filteredHospitals.map((hospital) => (
                  <div key={hospital.id} className="grid grid-cols-6 gap-4 px-5 py-4 items-center text-sm text-slate-700 dark:text-slate-200">
                    <div className="col-span-2">
                      <button type="button" onClick={() => setSelectedHospital(hospital)} className="text-left font-semibold text-slate-900 dark:text-white hover:text-fuchsia-500 transition">
                        {hospital.name || 'Unnamed Hospital'}
                      </button>
                      <p className="text-xs text-slate-500 mt-1">{hospital.address || 'Address not provided'}</p>
                    </div>
                    <div><SuperAdminStatusBadge status={hospital.verificationStatus} /></div>
                    <div>{hospital.phone || hospital.email || 'N/A'}</div>
                    <div>{(hospital.registrationCertificateUrl ? 1 : 0) + (hospital.hospitalLicenseUrl ? 1 : 0)}</div>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        disabled={updatingId === hospital.id}
                        onClick={() => handleStatusUpdate(hospital.id, 'verified')}
                        className="rounded-2xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-400 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={updatingId === hospital.id}
                        onClick={() => handleStatusUpdate(hospital.id, 'rejected')}
                        className="rounded-2xl bg-rose-500 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-400 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <motion.div
          className="dashboard-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm text-slate-500">Verification guide</p>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Approval workflow</h2>
            </div>
            <Filter className="w-5 h-5 text-fuchsia-500" />
          </div>
          <div className="space-y-4 text-sm text-slate-500">
            <p>Review each hospital submission carefully. Verify the accuracy of uploaded documents before approving.</p>
            <p>Once approved, the hospital is marked verified and becomes trusted for platform operations.</p>
            <p>Rejected hospitals should be updated by the hospital admin and resubmitted when corrections are complete.</p>
          </div>
        </motion.div>
      </div>

      {selectedHospital && (
        <HospitalDetailsModal 
          hospital={selectedHospital} 
          onClose={() => setSelectedHospital(null)}
          onViewDocument={(url, fileName) => setPdfViewerState({ isOpen: true, url, fileName })}
        />
      )}

      <PDFViewer
        isOpen={pdfViewerState.isOpen}
        url={pdfViewerState.url}
        fileName={pdfViewerState.fileName}
        onClose={() => setPdfViewerState({ isOpen: false, url: null, fileName: null })}
      />
    </div>
  )
}

export default SuperAdminVerification
