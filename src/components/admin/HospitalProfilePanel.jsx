import { useEffect, useState, useContext } from 'react'
import { motion } from 'framer-motion'
import { Building2, MapPin, Phone, Mail, Globe, Save, Eye, MapPinOff, Trash2, Upload } from 'lucide-react'
import { AuthContext } from '../../context/AuthContext'
import { getHospitalProfile, updateHospitalProfile, deleteHospital, getHospitalsWithStats } from '../../services/adminService'
import { uploadFileToCloudinary, validateCloudinaryFile, HOSPITAL_DOCUMENT_TYPES, MAX_HOSPITAL_FILE_SIZE } from '../../services/cloudinaryService'
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
    registrationCertificateUrl: '',
    hospitalLicenseUrl: '',
    verificationStatus: '',
  })
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploadingDocs, setUploadingDocs] = useState({ registrationCertificateUrl: false, hospitalLicenseUrl: false })
  const [uploadProgress, setUploadProgress] = useState({ registrationCertificateUrl: 0, hospitalLicenseUrl: 0 })
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
          registrationCertificateUrl: profile.registrationCertificateUrl || '',
          hospitalLicenseUrl: profile.hospitalLicenseUrl || '',
          verificationStatus: profile.verificationStatus || 'pending',
        })
        setHospitals(list)
      })
      .catch((err) => showError(err.message || 'Failed to load hospital data'))
      .finally(() => setLoading(false))
  }, [user, hospitalId, showError])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const uploadVerificationDocument = async (event, field, label) => {
    const fileInput = event.target
    const file = fileInput.files?.[0]
    if (!file) return

    const validation = validateCloudinaryFile({
      file,
      allowedTypes: HOSPITAL_DOCUMENT_TYPES,
      maxSize: MAX_HOSPITAL_FILE_SIZE,
      label,
    })

    if (!validation.valid) {
      showError(validation.error)
      return
    }

    setUploadingDocs((prev) => ({ ...prev, [field]: true }))
    setUploadProgress((prev) => ({ ...prev, [field]: 0 }))

    try {
      const uploadResult = await uploadFileToCloudinary({
        file,
        folder: `hospital-documents/${hospitalId}`,
        onProgress: (value) => setUploadProgress((prev) => ({ ...prev, [field]: value })),
      })

      setForm((prev) => ({
        ...prev,
        [field]: uploadResult.secure_url,
      }))
      showSuccess(`${label} uploaded successfully`)
    } catch (err) {
      showError(err.message || `Failed to upload ${label.toLowerCase()}`)
      fileInput.value = ''
    } finally {
      setUploadingDocs((prev) => ({ ...prev, [field]: false }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    if (!form.registrationCertificateUrl) {
      showError('Registration certificate is required for hospital verification.')
      setSaving(false)
      return
    }
    if (!form.hospitalLicenseUrl) {
      showError('Hospital license is required for hospital verification.')
      setSaving(false)
      return
    }

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

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Delete this hospital profile permanently? This cannot be undone.'
    )
    if (!confirmed) return

    setDeleting(true)
    try {
      await deleteHospital(hospitalId)
      setHospitals((prev) => prev.filter((hospital) => hospital.id !== hospitalId))
      setForm({
        name: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        description: '',
        registrationCertificateUrl: '',
        hospitalLicenseUrl: '',
        verificationStatus: 'pending',
      })
      showSuccess('Hospital deleted successfully. You can re-add hospital details anytime.')
    } catch (err) {
      showError(err.message || 'Failed to delete hospital profile')
    } finally {
      setDeleting(false)
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
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">My Hospital Profile</h3>
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

        <div className="mt-6 rounded-3xl border border-slate-200/70 bg-slate-50 p-5 dark:border-slate-700/60 dark:bg-slate-900/50">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Hospital Verification Documents</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Upload PDFs for registration certificate and hospital license. These documents are reviewed by Super Admin before verification.</p>
            </div>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${form.verificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-700' : form.verificationStatus === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-orange-100 text-orange-700'}`}>
              {form.verificationStatus || 'pending'}
            </span>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {[
              { field: 'registrationCertificateUrl', label: 'Registration Certificate', hint: 'PDF only, max 10MB' },
              { field: 'hospitalLicenseUrl', label: 'Hospital License', hint: 'PDF only, max 10MB' },
            ].map(({ field, label, hint }) => (
              <div key={field} className="rounded-3xl border border-slate-200/70 bg-white p-4 dark:border-slate-700/60 dark:bg-slate-950">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{hint}</p>
                  </div>
                  <label htmlFor={field} className="btn-secondary inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm">
                    <Upload className="w-4 h-4" />
                    {form[field] ? 'Replace' : 'Upload'}
                  </label>
                </div>

                <input
                  id={field}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => uploadVerificationDocument(e, field, label)}
                />

                <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                  {form[field] ? (
                    <div className="space-y-2">
                      <p className="text-slate-700 dark:text-slate-200">Uploaded file is ready for review.</p>
                      <div className="flex flex-wrap gap-2">
                        <a href={form[field]} target="_blank" rel="noreferrer" className="text-accent hover:text-accent-600 underline">
                          View document
                        </a>
                        <a href={form[field]} download className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white underline">
                          Download
                        </a>
                      </div>
                    </div>
                  ) : (
                    <p>No document uploaded yet.</p>
                  )}
                </div>

                {uploadingDocs[field] && (
                  <div className="mt-4 rounded-2xl bg-slate-200/70 p-3 dark:bg-slate-800/70">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Uploading {label.toLowerCase()}…</span>
                      <span>{uploadProgress[field]}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-300 dark:bg-slate-700">
                      <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${uploadProgress[field]}%` }} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Eye className="w-4 h-4" />
            Edit your hospital profile and ensure branding, contact, and address information is up to date.
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || saving}
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-slate-900/70 border-slate-200/70 dark:border-slate-700/40 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? 'Deleting...' : 'Delete Hospital'}
            </button>
            <button type="submit" disabled={saving || deleting} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-fuchsia-600 to-pink-500 hover:from-fuchsia-700 hover:to-pink-600 shadow-sm transition disabled:opacity-50">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Update Hospital'}
            </button>
          </div>
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
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Hospital Directory</h3>
            <p className="text-xs text-slate-500">Browse all registered hospitals. Your hospital is editable, others are view-only.</p>
          </div>
        </div>

        <div className="space-y-3 max-h-[36rem] overflow-y-auto pr-1">
          {hospitals.map((hospital) => (
            <div
              key={hospital.id}
              className={`p-4 rounded-2xl border ${isOwnHospital(hospital) ? 'border-accent/40 bg-white/90 dark:bg-slate-900/70' : 'border-slate-200/70 dark:border-slate-700/40 bg-white/90 dark:bg-slate-900/50'} transition-all hover:shadow-lg`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{hospital.name || 'Unnamed Hospital'}</h4>
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
