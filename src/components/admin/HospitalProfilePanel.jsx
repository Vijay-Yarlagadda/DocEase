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
    hospitalDocuments: [],
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

  const normalizeCloudinaryUrl = (value) => {
    if (!value) return ''
    try {
      return new URL(value).href
    } catch {
      return value.startsWith('http') ? value : `https://${value}`
    }
  }

  const getHospitalDocument = (field) => {
    const metadata = form.hospitalDocuments?.find((doc) => doc.id === field)
    const url = normalizeCloudinaryUrl(metadata?.url || form[field])
    const defaultName = field === 'registrationCertificateUrl' ? 'Registration Certificate.pdf' : 'Hospital License.pdf'
    return {
      ...metadata,
      url,
      fileName: metadata?.name || defaultName,
    }
  }

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
          hospitalDocuments: profile.hospitalDocuments || [],
        })
        setHospitals(list)
      })
      .catch((err) => showError(err.message || 'Failed to load hospital data'))
      .finally(() => setLoading(false))
  }, [user, hospitalId, showError])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const saveUploadedDocument = async (field, url, docs) => {
    const previousUrl = form[field]
    console.log('[Hospital Document] Saving uploaded document', { field, previousUrl, newUrl: url })

    try {
      const updatedProfile = await updateHospitalProfile(hospitalId, {
        [field]: url,
        hospitalDocuments: docs,
      })

      console.log('[Hospital Document] Firestore update result', updatedProfile)

      setForm((prev) => ({
        ...prev,
        [field]: updatedProfile[field] || url,
        hospitalDocuments: updatedProfile.hospitalDocuments || docs,
      }))

      setHospitals((prev) =>
        prev.map((hospital) =>
          hospital.id === hospitalId ? { ...hospital, ...updatedProfile } : hospital
        )
      )

      return updatedProfile
    } catch (err) {
      console.error('[Hospital Document] Firestore update failed', err)
      throw err
    }
  }

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

      const secureUrl = uploadResult.secure_url || uploadResult.url || uploadResult.secureUrl
      if (!secureUrl) {
        throw new Error('Cloudinary upload did not return a valid secure URL.')
      }
      const existingDocs = form.hospitalDocuments?.filter((doc) => doc.id !== field) || []
      const fileName = uploadResult.original_filename
        ? uploadResult.format
          ? `${uploadResult.original_filename}.${uploadResult.format}`
          : uploadResult.original_filename
        : file.name

      const newDocs = [
        ...existingDocs,
        {
          id: field,
          label,
          url: secureUrl,
          name: fileName,
          uploadedAt: new Date().toISOString(),
          type: file.type || 'application/pdf',
        },
      ]

      console.log('[Hospital Document] Upload completed', {
        field,
        previousUrl: form[field],
        newCloudinaryUrl: secureUrl,
        uploadResult,
      })

      await saveUploadedDocument(field, secureUrl, newDocs)
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
        hospitalDocuments: [],
      })
      showSuccess('Hospital deleted successfully. You can re-add hospital details anytime.')
    } catch (err) {
      showError(err.message || 'Failed to delete hospital profile')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <PanelSkeleton rows={6} />

  const isNewHospital = !form.name && !form.email && !form.address && !form.registrationCertificateUrl && !form.hospitalLicenseUrl

  const fields = [
    { name: 'name', label: 'Hospital Name', icon: Building2, type: 'text', placeholder: 'e.g. Saint Mary’s Medical Center' },
    { name: 'address', label: 'Address', icon: MapPin, type: 'text', placeholder: 'e.g. 124 Wellness Drive, Austin, TX' },
    { name: 'phone', label: 'Contact Phone', icon: Phone, type: 'tel', placeholder: '+1 (555) 123-4567' },
    { name: 'email', label: 'Contact Email', icon: Mail, type: 'email', placeholder: 'contact@hospital.com' },
    { name: 'website', label: 'Website', icon: Globe, type: 'text', placeholder: 'www.hospital-example.com' },
  ]

  const renderVerificationDocumentField = ({ field, label, hint }) => {
    const documentMeta = getHospitalDocument(field)
    const documentUrl = documentMeta.url
    const uploadedAt = documentMeta.uploadedAt ? new Date(documentMeta.uploadedAt).toLocaleString() : 'Unknown upload time'

    const openBlankTab = () => {
      const win = window.open('', '_blank', 'noopener,noreferrer')
      if (!win) throw new Error('Popup blocked by browser')
      win.document.write('<title>Loading document...</title><p style="font-family:system-ui,sans-serif; padding:16px;">Loading document...</p>')
      return win
    }

    const handleViewDocument = async (e) => {
      e.preventDefault()
      if (!documentUrl) {
        showError('Document URL not found')
        return
      }
      console.log('[Document Viewer] Opening hospital document in new tab', {
        label,
        url: documentUrl,
      })

      try {
        const win = window.open(documentUrl, '_blank', 'noopener,noreferrer')
        if (win) return
      } catch (err) {
        // popup blocked or invalid URL; continue to fallback
      }

      try {
        const token = localStorage.getItem('docease_token')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        let resp = await fetch(documentUrl, { method: 'GET', headers })
        
        // Fallback for corrupted raw URLs
        if (!resp.ok && documentUrl.includes('/raw/upload/')) {
          const imageFallback = documentUrl.replace('/raw/upload/', '/image/upload/')
          const fallbackResp = await fetch(imageFallback, { method: 'GET', headers })
          if (fallbackResp.ok) resp = fallbackResp
        }

        if (!resp.ok) throw new Error(`Fetch failed: ${resp.status}`)
        const blob = await resp.blob()
        const objectUrl = URL.createObjectURL(blob)
        const win = openBlankTab()
        win.location.href = objectUrl
        setTimeout(() => URL.revokeObjectURL(objectUrl), 60 * 1000)
      } catch (err) {
        console.error('[Document Viewer] open in new tab failed', err)
        showError('Unable to open document in new tab. Try downloading instead.')
      }
    }

    return (
      <div key={field} className="rounded-3xl border border-slate-200/70 bg-white p-4 dark:border-slate-700/60 dark:bg-slate-950">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{label}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{hint}</p>
          </div>
          <label htmlFor={field} className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-sky-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition duration-300 hover:from-sky-700 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-300/50">
            <Upload className="w-4 h-4" />
            {form[field] ? 'Replace file' : 'Upload file'}
          </label>
        </div>
        <input
          id={field}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => uploadVerificationDocument(e, field, label)}
        />

        <div className="mt-4">
          {documentUrl ? (
            <div className="animated-border-ring animate-animated-border">
              <div className="animated-border-ring__content rounded-3xl border border-slate-200/70 p-4 shadow-sm dark:border-slate-700/60">
                <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Document uploaded successfully</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Uploaded on {uploadedAt}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-end">
                    <button
                      onClick={handleViewDocument}
                      className="inline-flex items-center justify-center rounded-full border border-transparent bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-slate-900/30 transition duration-300 ease-out hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400/40"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">No document uploaded yet.</p>
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
    )
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="dashboard-card xl:col-span-2"
        autoComplete="off"
      >
        <div className="flex items-center gap-2 mb-5">
          <Building2 className="w-5 h-5 text-accent" />
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">My Hospital Profile</h3>
            <p className="text-xs text-slate-500">Only your hospital details can be edited here.</p>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {fields.map(({ name, label, icon: Icon, type, placeholder }) => (
            <div key={name} className={name === 'address' ? 'md:col-span-2' : ''}>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  autoComplete="off"
                  className="block w-full rounded-3xl border border-slate-200/70 bg-white/90 px-4 py-3 pl-10 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-accent/10 dark:border-slate-700/60 dark:bg-slate-950 dark:text-slate-100"
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
              placeholder="Describe the hospital, specialties, and services offered."
              autoComplete="off"
              className="block w-full rounded-3xl border border-slate-200/70 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-accent/10 resize-none dark:border-slate-700/60 dark:bg-slate-950 dark:text-slate-100"
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
            ].map(renderVerificationDocumentField)}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Eye className="w-4 h-4" />
            {isNewHospital ? 'Complete your hospital registration details and submit to begin the verification process.' : 'Update your hospital details when changes are required.'}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            {!isNewHospital && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || saving}
                className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? 'Deleting...' : 'Delete Hospital'}
              </button>
            )}
            <button
              type="submit"
              disabled={saving || deleting}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm transition ${isNewHospital ? 'bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-700 hover:to-cyan-600' : 'bg-gradient-to-r from-fuchsia-600 to-pink-500 hover:from-fuchsia-700 hover:to-pink-600'}`}
            >
              <Save className="w-4 h-4" />
              {saving ? (isNewHospital ? 'Creating...' : 'Saving...') : isNewHospital ? 'Create Hospital' : 'Update Hospital'}
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
