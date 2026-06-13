import { useState, useEffect, useContext, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, Stethoscope, UploadCloud, FileText, Trash2, Download, AlertCircle, ArrowLeft } from 'lucide-react'
import { getAppointmentById } from '../../services/appointmentService'
import { getDocumentsForAppointment, createPatientDocument, deletePatientDocument } from '../../services/documentService'
import { uploadFileToCloudinary } from '../../services/cloudinaryService'
import { AuthContext } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'

const AppointmentDetails = () => {
  const { appointmentId } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const { showSuccess, showError } = useToast()

  const [appointment, setAppointment] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const appt = await getAppointmentById(appointmentId)
        if (!appt || appt.patientId !== user.uid) {
          showError('Appointment not found or unauthorized')
          navigate('/patient/appointments')
          return
        }
        setAppointment(appt)

        const docs = await getDocumentsForAppointment(appointmentId)
        setDocuments(docs)
      } catch (err) {
        showError('Failed to load appointment details')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [appointmentId, user.uid, navigate])

  const handleFileSelected = async (file) => {
    if (!file) return

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      showError('File is too large. Maximum size is 10MB')
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      const uploadResult = await uploadFileToCloudinary({
        file,
        folder: `patient-documents/${user.uid}/appointments/${appointmentId}`,
        onProgress: (value) => setProgress(value),
      })

      const newDocId = await createPatientDocument({
        appointmentId,
        patientUid: user.uid,
        patientName: user.name || '',
        patientEmail: user.email || '',
        doctorId: appointment.doctorId,
        hospitalId: appointment.hospitalId,
        fileName: file.name,
        fileUrl: uploadResult.secure_url,
        mimeType: file.type,
      })
      
      showSuccess('Document uploaded successfully')
      
      // Refresh documents
      const docs = await getDocumentsForAppointment(appointmentId)
      setDocuments(docs)
      setProgress(0)
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

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-40 animate-pulse bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="h-64 animate-pulse bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    )
  }

  if (!appointment) return null

  const canUpload = appointment.status === 'approved' || appointment.status === 'completed'

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <button 
        onClick={() => navigate('/patient/appointments')}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Appointments
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Appointment Details</h1>
            <p className="text-slate-500 flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                appointment.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                appointment.status === 'approved' ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-700'
              }`}>
                {appointment.status}
              </span>
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50">
          <div>
            <p className="text-sm font-medium text-slate-400 mb-1 flex items-center gap-1.5"><Stethoscope className="w-4 h-4" /> Doctor</p>
            <p className="font-semibold text-slate-900 dark:text-white">{appointment.doctorName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400 mb-1 flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Hospital</p>
            <p className="font-semibold text-slate-900 dark:text-white">{appointment.hospitalName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400 mb-1 flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Date</p>
            <p className="font-semibold text-slate-900 dark:text-white">{appointment.appointmentDate}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400 mb-1 flex items-center gap-1.5"><Clock className="w-4 h-4" /> Time</p>
            <p className="font-semibold text-slate-900 dark:text-white">{appointment.appointmentTime}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Medical Records</h2>

        {/* Upload Area */}
        {canUpload ? (
          <div
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); }}
            onDrop={handleDrop}
            className={`mb-8 border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              dragActive 
                ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' 
                : 'border-slate-300 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            {uploading ? (
              <div className="max-w-xs mx-auto">
                <div className="flex justify-between text-sm mb-2 text-slate-600 dark:text-slate-300">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-teal-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ) : (
              <>
                <UploadCloud className="w-12 h-12 mx-auto text-teal-500 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Upload Documents for Doctor</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  Drag and drop files here, or click to browse. Max 10MB per file.
                </p>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="file-upload"
                  className="btn-primary inline-block cursor-pointer shadow-lg shadow-teal-500/25"
                >
                  Browse Files
                </label>
              </>
            )}
          </div>
        ) : (
          <div className="mb-8 p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-400">Waiting for Doctor Approval</h3>
              <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
                You cannot upload medical documents until the doctor confirms and approves this appointment. Please check back later.
              </p>
            </div>
          </div>
        )}

        {/* Document List */}
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Uploaded Files ({documents.length})</h3>
          {documents.length === 0 ? (
            <div className="text-center p-8 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700/50">
              <p className="text-slate-500 text-sm">No documents uploaded for this appointment yet.</p>
            </div>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{doc.fileName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Uploaded {new Date(doc.uploadedAt?.toDate()).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-teal-600 bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
                    <Download className="w-4 h-4" />
                  </a>
                  {canUpload && (
                    <button onClick={() => handleDelete(doc.id)} className="p-2 text-slate-400 hover:text-rose-600 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default AppointmentDetails
