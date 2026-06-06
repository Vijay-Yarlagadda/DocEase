import { useEffect, useState, useContext } from 'react'
import { motion } from 'framer-motion'
import { Building2, MapPin, Phone, Mail, Globe, Save, Eye, MapPinOff } from 'lucide-react'
import { AuthContext } from '../../context/AuthContext'
import { getHospitalProfile, updateHospitalProfile, getHospitalsWithStats } from '../../services/adminService'
import { useToast } from '../Toast'
import { PanelSkeleton } from './SkeletonLoader'

const HospitalProfilePanel = () => {
  const { user } = useContext(AuthContext)
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    description: '',
  })
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { showSuccess, showError } = useToast()

  const hospitalId = user?.uid || 'default'
  const isOwnHospital = (hospital) => hospital.id === hospitalId

  useEffect(() => {
    if (!user) return

    Promise.all([getHospitalProfile(hospitalId), getHospitalsWithStats()])
      .then(([profile, list]) => {
        setForm({
          name: profile.name || '',
          address: profile.address || '',
          phone: profile.phone || '',
          email: profile.email || '',
          website: profile.website || '',
          description: profile.description || '',
        })
        setHospitals(list)
      })
      .catch((err) => showError(err.message || 'Failed to load hospital data'))
      .finally(() => setLoading(false))
  }, [user, hospitalId, showError])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateHospitalProfile(hospitalId, form)
      setHospitals((prev) =>
        prev.map((hospital) =>
          hospital.id === hospitalId ? { ...hospital, ...form, doctorCount: hospital.doctorCount, appointmentCount: hospital.appointmentCount } : hospital
        )
      )
      showSuccess('Hospital profile updated successfully')
    } catch (err) {
      showError(err.message || 'Failed to update hospital profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PanelSkeleton rows={6} />

  const fields = [
    { name: 'name', label: 'Hospital Name', icon: Building2, type: 'text' },
    { name: 'address', label: 'Address', icon: MapPin, type: 'text' },
    { name: 'phone', label: 'Contact Phone', icon: Phone, type: 'tel' },
    { name: 'email', label: 'Contact Email', icon: Mail, type: 'email' },
    { name: 'website', label: 'Website', icon: Globe, type: 'text' },
  ]

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="dashboard-card xl:col-span-2"
      >
        <div className="flex items-center gap-2 mb-5">
          <Building2 className="w-5 h-5 text-accent" />
          <div>
            <h3 className="text-base font-semibold text-white">My Hospital Profile</h3>
            <p className="text-xs text-slate-500">Only your hospital details can be edited here.</p>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {fields.map(({ name, label, icon: Icon, type }) => (
            <div key={name} className={name === 'address' ? 'md:col-span-2' : ''}>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  className="dashboard-input pl-10"
                  required={name === 'name' || name === 'email'}
                />
              </div>
            </div>
          ))}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="dashboard-input resize-none"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Eye className="w-4 h-4" />
            Edit your hospital profile and ensure branding, contact, and address information is up to date.
          </div>
          <button type="submit" disabled={saving} className="btn-primary text-sm inline-flex items-center gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Update Hospital'}
          </button>
        </div>
      </motion.form>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="dashboard-card"
      >
        <div className="flex items-center gap-2 mb-5">
          <MapPinOff className="w-5 h-5 text-accent" />
          <div>
            <h3 className="text-base font-semibold text-white">Hospital Directory</h3>
            <p className="text-xs text-slate-500">Browse all registered hospitals. Your hospital is editable, others are view-only.</p>
          </div>
        </div>

        <div className="space-y-3 max-h-[36rem] overflow-y-auto pr-1">
          {hospitals.map((hospital) => (
            <div
              key={hospital.id}
              className={`p-4 rounded-2xl border ${isOwnHospital(hospital) ? 'border-accent/40 bg-slate-900/70' : 'border-slate-700/40 bg-slate-900/50'} transition-all hover:shadow-lg`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-white">{hospital.name || 'Unnamed Hospital'}</h4>
                  <p className="text-xs text-slate-400 mt-1">{hospital.address || 'Address not available'}</p>
                </div>
                <span className={`text-[10px] uppercase tracking-[0.18em] px-2 py-1 rounded-full ${isOwnHospital(hospital) ? 'bg-accent/15 text-accent border border-accent/20' : 'bg-slate-800/60 text-slate-300 border border-slate-700/40'}`}>
                  {isOwnHospital(hospital) ? 'My Hospital' : 'Read-only'}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                <div><span className="text-slate-200 font-semibold">Doctors:</span> {hospital.doctorCount ?? 0}</div>
                <div><span className="text-slate-200 font-semibold">Appointments:</span> {hospital.appointmentCount ?? 0}</div>
                <div><span className="text-slate-200 font-semibold">Contact:</span> {hospital.phone || hospital.email || 'N/A'}</div>
                <div><span className="text-slate-200 font-semibold">Location:</span> {hospital.address ? 'Yes' : 'No'}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default HospitalProfilePanel
