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
} from 'lucide-react'
import {
  adminCreateDoctor,
} from '../../services/authService'
import {
  getAllDoctors,
  updateDoctor,
  deleteDoctor,
  toggleDoctorActive,
  resetDoctorPassword,
} from '../../services/adminService'
import { useToast } from '../Toast'
import { PanelSkeleton } from './SkeletonLoader'

const emptyForm = { name: '', email: '', qualification: '', specialization: '', experience: '' }

const DoctorManagementPanel = ({ showAddForm = true }) => {
  const [doctors, setDoctors] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editDoctor, setEditDoctor] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [createdTemp, setCreatedTemp] = useState(null)
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
        (statusFilter === 'active' && d.active !== false && !d.firstLogin) ||
        (statusFilter === 'inactive' && d.active === false) ||
        (statusFilter === 'pending' && d.firstLogin)
      return matchesSearch && matchesStatus
    })
  }, [doctors, search, statusFilter])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { name, email, qualification, specialization, experience } = form
      if (!name || !email) throw new Error('Name and email are required')
      const res = await adminCreateDoctor(name.trim(), email.trim(), qualification.trim(), specialization.trim(), Number(experience || 0))
      setCreatedTemp(res)
      showSuccess('Doctor created successfully')
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
    if (!window.confirm(`Reset password for Dr. ${doctor.name}?`)) return
    try {
      const res = await resetDoctorPassword(doctor.id)
      setResetResult({ email: doctor.email, tempPassword: res.tempPassword })
      showSuccess('Temporary password generated')
    } catch (err) {
      showError(err.message || 'Unable to reset password')
    }
  }

  if (loading) return <PanelSkeleton rows={6} />

  return (
    <div className="space-y-6">
      {showAddForm && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="dashboard-card">
          <div className="flex items-center gap-2 mb-5">
            <UserPlus className="w-5 h-5 text-accent" />
            <h3 className="text-base font-semibold text-white">Add Doctor</h3>
          </div>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {['name', 'email', 'qualification', 'specialization'].map((field) => (
              <input
                key={field}
                name={field}
                value={form[field]}
                onChange={handleChange}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                className="dashboard-input capitalize-placeholder"
                required={field === 'name' || field === 'email'}
              />
            ))}
            <input
              name="experience"
              value={form.experience}
              onChange={handleChange}
              placeholder="Experience (years)"
              type="number"
              min="0"
              className="dashboard-input sm:col-span-2"
            />
            <div className="flex justify-end sm:col-span-2">
              <button type="submit" disabled={submitting} className="btn-primary text-sm">
                {submitting ? 'Creating...' : 'Create Doctor'}
              </button>
            </div>
          </form>
          {createdTemp && (
            <div className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-sm text-slate-300">
                Temporary password for <strong className="text-white">{createdTemp.email}</strong>:
              </p>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <code className="px-3 py-1.5 bg-slate-900 rounded-lg text-accent text-sm">{createdTemp.tempPassword}</code>
                <button type="button" onClick={() => navigator.clipboard.writeText(createdTemp.tempPassword)} className="text-sm text-accent hover:text-cyan-300">
                  Copy
                </button>
              </div>
            </div>
          )}
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
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search doctors..."
                className="dashboard-input pl-10 text-sm"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="dashboard-input pl-10 text-sm appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Awaiting Login</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {resetResult && (
          <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-amber-200">New temp password for {resetResult.email}</p>
              <code className="text-accent text-sm mt-1 block">{resetResult.tempPassword}</code>
            </div>
            <button onClick={() => setResetResult(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
        )}

        <div className="space-y-2">
          {filteredDoctors.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-8">No doctors found</p>
          )}
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
                    {d.firstLogin ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 text-[10px] font-medium">Awaiting Login</span>
                    ) : d.active === false ? (
                      <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20 text-[10px] font-medium">Inactive</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[10px] font-medium">Active</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 truncate">{d.email}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{d.specialization || 'General'} &bull; {d.experience || 0} yrs exp.</p>
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
