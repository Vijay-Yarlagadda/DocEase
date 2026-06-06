import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Building2, MapPin, Phone, Mail, Globe, Save } from 'lucide-react'
import { getHospitalProfile, updateHospitalProfile } from '../../services/adminService'
import { useToast } from '../Toast'
import { PanelSkeleton } from './SkeletonLoader'

const HospitalProfilePanel = ({ compact = false }) => {
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    description: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { showSuccess, showError } = useToast()

  useEffect(() => {
    getHospitalProfile()
      .then((data) => setForm({
        name: data.name || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        website: data.website || '',
        description: data.description || '',
      }))
      .catch((err) => showError(err.message || 'Failed to load hospital profile'))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateHospitalProfile('default', form)
      showSuccess('Hospital profile updated successfully')
    } catch (err) {
      showError(err.message || 'Failed to update hospital profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PanelSkeleton rows={compact ? 3 : 6} />

  const fields = [
    { name: 'name', label: 'Hospital Name', icon: Building2, type: 'text' },
    { name: 'address', label: 'Address', icon: MapPin, type: 'text' },
    { name: 'phone', label: 'Contact Phone', icon: Phone, type: 'tel' },
    { name: 'email', label: 'Contact Email', icon: Mail, type: 'email' },
    { name: 'website', label: 'Website', icon: Globe, type: 'text' },
  ]

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="dashboard-card"
    >
      <div className="flex items-center gap-2 mb-5">
        <Building2 className="w-5 h-5 text-accent" />
        <h3 className="text-base font-semibold text-white">Hospital Profile</h3>
      </div>

      <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
        {fields.map(({ name, label, icon: Icon, type }) => (
          <div key={name} className={name === 'address' && !compact ? 'md:col-span-2' : ''}>
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
        {!compact && (
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="dashboard-input resize-none"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end mt-5">
        <button type="submit" disabled={saving} className="btn-primary text-sm inline-flex items-center gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </motion.form>
  )
}

export default HospitalProfilePanel
