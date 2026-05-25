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
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Create Doctor</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="input" />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="input" />
          <input name="qualification" value={form.qualification} onChange={handleChange} placeholder="Qualification" className="input" />
          <input name="specialization" value={form.specialization} onChange={handleChange} placeholder="Specialization" className="input" />
          <input name="experience" value={form.experience} onChange={handleChange} placeholder="Experience (years)" type="number" className="input" />
          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Creating...' : 'Create Doctor'}</button>
          </div>
        </form>
        {createdTemp && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-gray-700 rounded">
            <p className="text-sm">Temporary password for <strong>{createdTemp.email}</strong>:</p>
            <div className="mt-2 flex items-center gap-2">
              <code className="px-2 py-1 bg-white dark:bg-gray-800 rounded">{createdTemp.tempPassword}</code>
              <button onClick={() => navigator.clipboard.writeText(createdTemp.tempPassword)} className="text-sm text-blue-600">Copy</button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Doctors</h3>
        <div className="space-y-3">
          {doctors.length === 0 && <p className="text-sm text-gray-500">No doctors yet</p>}
          {doctors.map((d) => (
            <div key={d.id} className="p-3 border rounded flex justify-between items-center">
              <div>
                <div className="font-medium">{d.name}</div>
                <div className="text-sm text-gray-500">{d.email} • {d.specialization || '—'}</div>
              </div>
              <div className="text-sm">
                {d.firstLogin ? <span className="px-2 py-1 bg-yellow-100 rounded">Awaiting first login</span> : <span className="px-2 py-1 bg-green-100 rounded">Active</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DoctorManagement
