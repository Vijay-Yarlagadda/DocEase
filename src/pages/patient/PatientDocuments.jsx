import { useEffect, useMemo, useState, useContext } from 'react'
import { motion } from 'framer-motion'
import { Archive, FileText, Download, Trash2, Eye, Upload } from 'lucide-react'
import { AuthContext } from '../../context/AuthContext'
import { createPatientDocument, deletePatientDocument, getPatientDocuments } from '../../services/documentService'
import { getAllDoctors } from '../../services/authService'
import { uploadFileToCloudinary, validateCloudinaryFile, PATIENT_DOCUMENT_TYPES, MAX_PATIENT_FILE_SIZE } from '../../services/cloudinaryService'
import FilePreviewModal from '../../components/FilePreviewModal'
import { useToast } from '../../components/Toast'

const PatientDocuments = () => {
  const { user } = useContext(AuthContext)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [previewDocument, setPreviewDocument] = useState(null)
  const [doctors, setDoctors] = useState([])
  const [selectedDoctorUids, setSelectedDoctorUids] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const { showSuccess, showError } = useToast()

  const fetchDocuments = async () => {
    if (!user?.uid) return
    setLoading(true)
    try {
      const docs = await getPatientDocuments(user.uid)
      setDocuments(docs)
    } catch (err) {
      showError(err.message || 'Failed to load patient documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
    // load doctors for sharing
    getAllDoctors().then(setDoctors).catch(() => {})
  }, [user])

  const handleFileSelected = async (file) => {
    if (!file) return
    try {
      const validation = validateCloudinaryFile({
        file,
        allowedTypes: PATIENT_DOCUMENT_TYPES,
        maxSize: MAX_PATIENT_FILE_SIZE,
        label: 'Medical document',
      })
      if (!validation.valid) {
        showError(validation.error)
        return
      }

      setSelectedFile(file)
      setUploading(true)
      setProgress(0)

      const uploadResult = await uploadFileToCloudinary({
        file,
        folder: `patient-documents/${user.uid}`,
        onProgress: (value) => setProgress(value),
      })

      await createPatientDocument({
        patientUid: user.uid,
        patientName: user.name || '',
        patientEmail: user.email || '',
        fileName: file.name,
        fileUrl: uploadResult.secure_url,
        mimeType: file.type,
        sharedWith: selectedDoctorUids,
      })
      showSuccess('Document uploaded successfully')
      setSelectedFile(null)
      setProgress(0)
      fetchDocuments()
    } catch (err) {
      showError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    await handleFileSelected(file)
    event.target.value = ''
  }

  const handleDrop = async (event) => {
    event.preventDefault()
    event.stopPropagation()
    setDragActive(false)
    if (!event.dataTransfer.files?.length) return
    await handleFileSelected(event.dataTransfer.files[0])
  }

  const handleDelete = async (documentId) => {
    const confirmed = window.confirm('Are you sure you want to delete this document?')
    if (!confirmed) return
    try {
      await deletePatientDocument(documentId)
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId))
      showSuccess('Document deleted successfully')
    } catch (err) {
      showError(err.message || 'Failed to delete document')
    }
  }

  const documentCountText = useMemo(() => {
    if (documents.length === 0) return 'No documents uploaded yet.'
    return `${documents.length} ${documents.length === 1 ? 'document' : 'documents'} uploaded`
  }, [documents.length])

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="dashboard-card mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">My Medical Documents</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Upload medical reports, prescriptions, and imaging files securely to Cloudinary.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-slate-50 px-4 py-2 text-sm text-slate-600 dark:border-slate-700/50 dark:bg-slate-800/60 dark:text-slate-300">
            <Archive className="w-4 h-4" />
            {documentCountText}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className={`dashboard-card border-dashed ${dragActive ? 'border-accent/80 bg-accent/5' : 'border-slate-300/70 bg-transparent'}`}
      >
        <div
          onDragOver={(event) => {
            event.preventDefault()
            event.stopPropagation()
            setDragActive(true)
          }}
          onDragLeave={(event) => {
            event.preventDefault()
            event.stopPropagation()
            setDragActive(false)
          }}
          onDrop={handleDrop}
          className="relative cursor-pointer rounded-3xl border border-slate-300/70 p-10 text-center transition-all"
        >
          <input type="file" id="patient-document-upload" className="hidden" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
          <label htmlFor="patient-document-upload" className="flex flex-col items-center justify-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg shadow-slate-900/10">
              <Upload className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Drag & drop medical files here</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Upload PDF, JPG, JPEG, or PNG files up to 20MB.</p>
            </div>
            <button type="button" className="btn-secondary inline-flex items-center gap-2 px-4 py-2">
              <Upload className="w-4 h-4" />
              Select a file
            </button>
          </label>
          <div className="mt-4 w-full text-left">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Share with doctors</label>
            <select
              multiple
              value={selectedDoctorUids}
              onChange={(e) => setSelectedDoctorUids(Array.from(e.target.selectedOptions).map((o) => o.value))}
              className="w-full rounded-2xl border p-2 text-sm"
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name || d.email || d.id}</option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-2">Select one or more doctors to share this document with.</p>
          </div>
        </div>
        {uploading && (
          <div className="mt-4 rounded-2xl bg-slate-200/70 p-4 dark:bg-slate-800/70">
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
              <span>Uploading {selectedFile?.name || 'file'}…</span>
              <span>{progress}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-300 dark:bg-slate-700">
              <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="dashboard-card mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Uploaded Documents</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Review, preview, download, or remove your uploaded medical files.</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((index) => (
              <div key={index} className="h-24 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300/70 bg-slate-50 p-10 text-center text-slate-500 dark:border-slate-700/70 dark:bg-slate-900/60 dark:text-slate-400">
            No medical documents uploaded yet. Use the area above to add secured Cloudinary files.
          </div>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc) => (
              <motion.div key={doc.id} whileHover={{ y: -2 }} className="rounded-3xl border border-slate-200/70 bg-white/95 p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/70">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-900 dark:text-white">{doc.fileName}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Uploaded by you on {new Date(doc.uploadedAt?.toDate ? doc.uploadedAt.toDate() : doc.uploadedAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => setPreviewDocument(doc)} className="btn-secondary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm">
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                    <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="btn-primary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm">
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                    <button onClick={() => handleDelete(doc.id)} className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700 hover:bg-rose-100 transition-colors dark:border-rose-600/50 dark:bg-rose-500/10 dark:text-rose-300">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <FilePreviewModal document={previewDocument} onClose={() => setPreviewDocument(null)} />
    </div>
  )
}

export default PatientDocuments
