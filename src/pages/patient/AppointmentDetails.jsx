import { useState, useEffect, useContext, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, Stethoscope, UploadCloud, FileText, Trash2, Eye, AlertCircle, ArrowLeft, Camera, User, Download } from 'lucide-react'
import { getAppointmentById, deleteAppointment } from '../../services/appointmentService'
import { getDocumentsForAppointment, createPatientDocument, deletePatientDocument } from '../../services/documentService'
import { uploadFileToCloudinary } from '../../services/cloudinaryService'
import { getReportForAppointment } from '../../services/reportService'
import { AuthContext } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'

const AppointmentDetails = () => {
  const { appointmentId } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const { showSuccess, showError } = useToast()

  const [appointment, setAppointment] = useState(null)
  const [documents, setDocuments] = useState([])
  const [report, setReport] = useState(null)
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

        const docs = await getDocumentsForAppointment(appointmentId, user)
        setDocuments(docs)

        const existingReport = await getReportForAppointment(appointmentId, user)
        setReport(existingReport)
      } catch (err) {
        showError('Failed to load appointment details')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [appointmentId, user.uid, navigate])

  const handleCancelAppointment = async () => {
    const confirmed = window.confirm('Are you sure you want to cancel this appointment? This action cannot be undone.')
    if (!confirmed) return
    try {
      await deleteAppointment(appointmentId)
      showSuccess('Appointment cancelled successfully')
      navigate('/patient/appointments')
    } catch (err) {
      showError(err.message || 'Failed to cancel appointment')
    }
  }

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
        patientUid: user.uid || user.id,
        patientName: user.name || user.firstName,
        patientEmail: user.email,
        doctorId: appointment.doctorId,
        hospitalId: appointment.hospitalId,
        fileName: file.name,
        fileUrl: uploadResult.secure_url,
        mimeType: file.type,
        uploadedByRole: 'patient'
      })
      
      showSuccess('Document uploaded successfully')
      
      // Refresh documents
      const docs = await getDocumentsForAppointment(appointmentId, user)
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

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <button 
        onClick={() => navigate('/patient/appointments')}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Appointments
      </button>

      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
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
          {appointment.status === 'pending' && (
            <button 
              onClick={handleCancelAppointment}
              className="px-4 py-2 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:text-rose-400 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 rounded-lg transition-colors border border-rose-200 dark:border-rose-800"
            >
              Cancel Appointment
            </button>
          )}
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

      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Documents & Prescriptions</h2>
          {(appointment.status === 'approved' || appointment.status === 'completed') && (
            <div>
              <input
                type="file"
                id="doc-upload"
                className="hidden"
                accept=".pdf,image/*"
                onChange={handleFileChange}
                disabled={uploading}
              />
              <label 
                htmlFor="doc-upload"
                className={`btn-primary px-4 py-2 text-sm cursor-pointer inline-flex items-center gap-2 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </label>
            </div>
          )}
        </div>

        <div className="space-y-8">
          {/* Doctor Prescriptions */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-300 mb-3 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-cyan-600" /> Doctor's Prescriptions
            </h3>
            <div className="space-y-3">
              {documents.filter(doc => doc.uploadedByRole === 'doctor').length === 0 ? (
                <div className="text-center p-6 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                  <p className="text-slate-500 text-sm">Your doctor hasn't uploaded any prescriptions yet.</p>
                </div>
              ) : (
                documents.filter(doc => doc.uploadedByRole === 'doctor').map((doc) => (
                  <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-cyan-50/50 dark:bg-cyan-900/10 border border-cyan-100 dark:border-cyan-800/50 rounded-xl hover:border-cyan-300 dark:hover:border-cyan-700 transition-colors gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm border border-cyan-200 dark:border-cyan-700">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{doc.fileName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Uploaded {new Date(doc.uploadedAt?.toDate()).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="btn-primary px-3 py-1.5 text-xs inline-flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" /> View
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Patient Documents */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-300 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-teal-600" /> My Uploaded Documents
            </h3>
            <div className="space-y-3">
              {documents.filter(doc => doc.uploadedByRole !== 'doctor').length === 0 ? (
                <div className="text-center p-6 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                  <p className="text-slate-500 text-sm">You haven't uploaded any medical records yet.</p>
                </div>
              ) : (
                documents.filter(doc => doc.uploadedByRole !== 'doctor').map((doc) => (
                  <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-teal-300 dark:hover:border-teal-700 transition-colors gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm border border-slate-200 dark:border-slate-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{doc.fileName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Uploaded {new Date(doc.uploadedAt?.toDate()).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="btn-secondary px-3 py-1.5 text-xs inline-flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" /> View
                      </a>
                      <button 
                        onClick={() => handleDelete(doc.id)} 
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors ml-1"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {report && (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Medical Report</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2">Diagnosis</h3>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-slate-700 dark:text-slate-300 text-sm border border-slate-200 dark:border-slate-700">
                {report.diagnosis}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2">Prescription</h3>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-slate-700 dark:text-slate-300 text-sm border border-slate-200 dark:border-slate-700 whitespace-pre-line">
                {report.prescription}
              </div>
            </div>
            {report.recommendations && (
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-300 mb-2">Recommendations</h3>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-slate-700 dark:text-slate-300 text-sm border border-slate-200 dark:border-slate-700">
                  {report.recommendations}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AppointmentDetails
