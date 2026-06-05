import { useEffect, useState } from 'react'
import { adminCreateDoctor, getAllDoctors } from '../services/authService'
import { useToast } from './Toast'

const DoctorManagement = () => {
  const [form, setForm] = useState({ name: '', email: '', qualification: '', specialization: '', experience: '' })
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)
  const [createdTemp, setCreatedTemp] = useState(null)
  const { showSuccess, showError } = useToast()

  const fetchDoctors = async () => {
    try {
      const list = await getAllDoctors()
      setDoctors(list)
    } catch (err) {
      showError(err.message || 'Unable to load doctors')
    }
  }

  useEffect(() => { fetchDoctors() }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { name, email, qualification, specialization, experience } = form
      if (!name || !email) throw new Error('Name and email are required')
      const res = await adminCreateDoctor(name.trim(), email.trim(), qualification.trim(), specialization.trim(), Number(experience || 0))
      setCreatedTemp(res)
      showSuccess('Doctor created — temporary password shown below')
      setForm({ name: '', email: '', qualification: '', specialization: '', experience: '' })
      await fetchDoctors()
    } catch (err) {
      showError(err.message || 'Unable to create doctor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700/30">
        <h3 className="text-base font-semibold text-white mb-4">Create Doctor</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="dashboard-input" />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="dashboard-input" />
          <input name="qualification" value={form.qualification} onChange={handleChange} placeholder="Qualification" className="dashboard-input" />
          <input name="specialization" value={form.specialization} onChange={handleChange} placeholder="Specialization" className="dashboard-input" />
          <input name="experience" value={form.experience} onChange={handleChange} placeholder="Experience (years)" type="number" className="dashboard-input sm:col-span-2" />
          <div className="flex justify-end sm:col-span-2">
            <button type="submit" disabled={loading} className="btn-primary text-sm">
              {loading ? 'Creating...' : 'Create Doctor'}
            </button>
          </div>
        </form>
        {createdTemp && (
          <div className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/20">
            <p className="text-sm text-slate-300">
              Temporary password for <strong className="text-white">{createdTemp.email}</strong>:
            </p>
            <div className="mt-2 flex items-center gap-2">
              <code className="px-3 py-1.5 bg-slate-900 rounded-lg text-accent text-sm">{createdTemp.tempPassword}</code>
              <button onClick={() => navigator.clipboard.writeText(createdTemp.tempPassword)} className="text-sm text-accent hover:text-cyan-300 transition-colors">
                Copy
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-700/30">
        <h3 className="text-base font-semibold text-white mb-4">All Doctors</h3>
        <div className="space-y-2">
          {doctors.length === 0 && <p className="text-sm text-slate-500">No doctors yet</p>}
          {doctors.map((d) => (
            <div key={d.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/30 flex justify-between items-center">
              <div>
                <div className="font-medium text-white">{d.name}</div>
                <div className="text-sm text-slate-500">{d.email} &bull; {d.specialization || '—'}</div>
              </div>
              <div className="text-sm">
                {d.firstLogin ? (
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 text-xs font-medium">
                    Awaiting first login
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                    Active
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DoctorManagement
