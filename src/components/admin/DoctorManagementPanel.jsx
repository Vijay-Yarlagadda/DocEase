import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  UserPlus,
  Pencil,
  Trash2,
  KeyRound,
  Power,
  X,
  Filter,
  Stethoscope,
  RefreshCw,
  Lock,
} from 'lucide-react'
import { adminCreateDoctor, generateTempPassword } from '../../services/authService'
import {
  getAllDoctors,
  updateDoctor,
  deleteDoctor,
  toggleDoctorActive,
  resetDoctorPassword,
} from '../../services/adminService'
import { useToast } from '../Toast'
import { PanelSkeleton } from './SkeletonLoader'
import DoctorCreatedSuccessModal from './DoctorCreatedSuccessModal'

const emptyForm = {
  name: '',
  email: '',
  tempPassword: '',
  qualification: '',
  specialization: '',
  experience: '',
}

const DoctorManagementPanel = ({ showAddForm = true }) => {
  const [doctors, setDoctors] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editDoctor, setEditDoctor] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [createdDoctor, setCreatedDoctor] = useState(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [resetResult, setResetResult] = useState(null)
  const { showSuccess, showError } = useToast()

  const fetchDoctors = async () => {
    try {
      const list = await getAllDoctors()
      setDoctors(list.map((d) => ({ ...d, active: d.active !== false })))
    } catch (err) {
      showError(err.message || 'Unable to load doctors')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDoctors() }, [])

  const needsPasswordChange = (d) => d.mustChangePassword === true || d.firstLogin === true

  const filteredDoctors = useMemo(() => {
    return doctors.filter((d) => {
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        d.name?.toLowerCase().includes(q) ||
        d.email?.toLowerCase().includes(q) ||
        d.specialization?.toLowerCase().includes(q)
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && d.active !== false && !needsPasswordChange(d)) ||
        (statusFilter === 'inactive' && d.active === false) ||
        (statusFilter === 'pending' && needsPasswordChange(d))
      return matchesSearch && matchesStatus
    })
  }, [doctors, search, statusFilter])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleGeneratePassword = () => {
    setForm({ ...form, tempPassword: generateTempPassword(12) })
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { name, email, tempPassword, qualification, specialization, experience } = form
      if (!name || !email || !tempPassword) throw new Error('Name, email, and temporary password are required')
      if (tempPassword.length < 8) throw new Error('Temporary password must be at least 8 characters')

      const res = await adminCreateDoctor(
        name.trim(),
        email.trim(),
        tempPassword,
        qualification.trim(),
        specialization.trim(),
        Number(experience || 0)
      )

      setCreatedDoctor({ ...res, name: name.trim() })
      setShowSuccessModal(true)
      setForm(emptyForm)
      await fetchDoctors()
    } catch (err) {
      showError(err.message || 'Unable to create doctor')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditSave = async (e) => {
    e.preventDefault()
    if (!editDoctor) return
    setSubmitting(true)
    try {
      await updateDoctor(editDoctor.id, {
        name: editDoctor.name,
        qualification: editDoctor.qualification,
        specialization: editDoctor.specialization,
        experience: editDoctor.experience,
      })
      showSuccess('Doctor updated successfully')
      setEditDoctor(null)
      await fetchDoctors()
    } catch (err) {
      showError(err.message || 'Unable to update doctor')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (doctor) => {
    if (!window.confirm(`Delete Dr. ${doctor.name}? This cannot be undone.`)) return
    try {
      await deleteDoctor(doctor.id)
      showSuccess('Doctor removed')
      await fetchDoctors()
    } catch (err) {
      showError(err.message || 'Unable to delete doctor')
    }
  }

  const handleToggleActive = async (doctor) => {
    try {
      const next = doctor.active === false
      await toggleDoctorActive(doctor.id, next)
      showSuccess(next ? 'Doctor activated' : 'Doctor deactivated')
      await fetchDoctors()
    } catch (err) {
      showError(err.message || 'Unable to update doctor status')
    }
  }

  const handleResetPassword = async (doctor) => {
    if (!window.confirm(`Reset password for Dr. ${doctor.name}? A new temporary password will be generated.`)) return
    try {
      const res = await resetDoctorPassword(doctor.id)
      setResetResult({ email: doctor.email, tempPassword: res.tempPassword, name: doctor.name })
      showSuccess('Temporary password generated — doctor must change it on next login')
      await fetchDoctors()
    } catch (err) {
      showError(err.message || 'Unable to reset password')
    }
  }

  if (loading) return <PanelSkeleton rows={6} />

  return (
    <div className="space-y-6">
      {showAddForm && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="dashboard-card">
          <div className="flex items-center gap-2 mb-2">
            <UserPlus className="w-5 h-5 text-accent" />
            <h3 className="text-base font-semibold text-white">Add Doctor</h3>
          </div>
          <p className="text-xs text-slate-500 mb-5">Only hospital admins can create doctor accounts. Doctors cannot self-register.</p>

          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Doctor Name *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Dr. John Smith" className="dashboard-input" required />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Email *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="doctor@hospital.com" className="dashboard-input" required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-slate-400 mb-1">Temporary Password *</label>
              <div className="flex gap-2">
                <input
                  name="tempPassword"
                  type="text"
                  value={form.tempPassword}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  className="dashboard-input flex-1"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="px-3 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-accent hover:border-accent/30 transition-colors inline-flex items-center gap-1.5 text-sm whitespace-nowrap"
                >
                  <RefreshCw className="w-4 h-4" />
                  Generate
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Qualification</label>
              <input name="qualification" value={form.qualification} onChange={handleChange} placeholder="MBBS, MD" className="dashboard-input" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Specialization</label>
              <input name="specialization" value={form.specialization} onChange={handleChange} placeholder="Cardiology" className="dashboard-input" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-slate-400 mb-1">Experience (years)</label>
              <input name="experience" type="number" min="0" value={form.experience} onChange={handleChange} placeholder="5" className="dashboard-input" />
            </div>
            <div className="flex justify-end sm:col-span-2">
              <button type="submit" disabled={submitting} className="btn-primary text-sm inline-flex items-center gap-2">
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Create Doctor Account
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="dashboard-card">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-accent" />
            <h3 className="text-base font-semibold text-white">All Doctors</h3>
            <span className="text-xs text-slate-500">({filteredDoctors.length})</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:ml-auto w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search doctors..." className="dashboard-input pl-10 text-sm" />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="dashboard-input pl-10 text-sm appearance-none cursor-pointer">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Must Change Password</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {resetResult && (
          <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-amber-200 font-medium">Password reset for {resetResult.name}</p>
                <p className="text-xs text-slate-400 mt-1">Email: {resetResult.email}</p>
                <code className="text-accent text-sm mt-2 block">{resetResult.tempPassword}</code>
              </div>
              <button onClick={() => setResetResult(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(resetResult.tempPassword)}
              className="mt-2 text-xs text-accent hover:text-cyan-300"
            >
              Copy password
            </button>
          </div>
        )}

        <div className="space-y-2">
          {filteredDoctors.length === 0 && <p className="text-sm text-slate-500 text-center py-8">No doctors found</p>}
          {filteredDoctors.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/30 hover:border-slate-600/50 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-white">{d.name}</p>
                    {needsPasswordChange(d) ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 text-[10px] font-medium inline-flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Must Change Password
                      </span>
                    ) : d.active === false ? (
                      <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20 text-[10px] font-medium">Inactive</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[10px] font-medium">Active</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 truncate">{d.email}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{d.specialization || 'General'} &bull; {d.experience || 0} yrs &bull; {d.qualification || '—'}</p>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  <button onClick={() => setEditDoctor({ ...d })} className="p-2 rounded-lg text-slate-400 hover:text-accent hover:bg-slate-800 transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleResetPassword(d)} className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors" title="Reset Password"><KeyRound className="w-4 h-4" /></button>
                  <button onClick={() => handleToggleActive(d)} className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors" title={d.active === false ? 'Activate' : 'Deactivate'}><Power className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(d)} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <DoctorCreatedSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        doctor={createdDoctor}
      />

      <AnimatePresence>
        {editDoctor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setEditDoctor(null)}
          >
            <motion.form
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 12 }}
              onSubmit={handleEditSave}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-slate-800/95 border border-slate-700/50 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-white">Edit Doctor</h3>
                <button type="button" onClick={() => setEditDoctor(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                <input value={editDoctor.name} onChange={(e) => setEditDoctor({ ...editDoctor, name: e.target.value })} className="dashboard-input" placeholder="Name" required />
                <input value={editDoctor.qualification || ''} onChange={(e) => setEditDoctor({ ...editDoctor, qualification: e.target.value })} className="dashboard-input" placeholder="Qualification" />
                <input value={editDoctor.specialization || ''} onChange={(e) => setEditDoctor({ ...editDoctor, specialization: e.target.value })} className="dashboard-input" placeholder="Specialization" />
                <input type="number" value={editDoctor.experience || ''} onChange={(e) => setEditDoctor({ ...editDoctor, experience: e.target.value })} className="dashboard-input" placeholder="Experience (years)" />
              </div>
              <div className="flex gap-3 mt-5">
                <button type="button" onClick={() => setEditDoctor(null)} className="flex-1 px-4 py-2.5 rounded-xl text-sm border border-slate-700 text-slate-300">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 btn-primary text-sm">{submitting ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DoctorManagementPanel
