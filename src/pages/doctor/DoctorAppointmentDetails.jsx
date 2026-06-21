import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, User, FileText, Download, Eye, ArrowLeft, CheckCircle, XCircle, Stethoscope } from 'lucide-react'
import { getAppointmentById, updateAppointmentStatus, notifyPatientPrescriptionUploaded } from '../../services/appointmentService'
import { getDocumentsForAppointment, createPatientDocument } from '../../services/documentService'
import { uploadFileToCloudinary } from '../../services/cloudinaryService'
import PrescriptionBuilder from './PrescriptionBuilder'
import DocumentViewerModal from '../../components/DocumentViewerModal'
import { formatDoctorName } from '../../utils/userProfile'
import { AuthContext } from '../../context/AuthContext'
import FilePreviewModal from '../../components/FilePreviewModal'
import { useToast } from '../../components/Toast'
import { generateReport, getReportForAppointment } from '../../services/reportService'
import { sendNotification } from '../../services/notificationService'

const DoctorAppointmentDetails = () => {
  const { appointmentId } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const { showError, showSuccess } = useToast()

  const [appointment, setAppointment] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [previewDocument, setPreviewDocument] = useState(null)
  
  const [report, setReport] = useState(null)
  const [generatingReport, setGeneratingReport] = useState(false)
  const [reportForm, setReportForm] = useState({
    diagnosis: '',
    prescription: '',
    recommendations: ''
  })
  
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const appt = await getAppointmentById(appointmentId)
        // Check if doctor matches
        if (!appt || (appt.doctorId !== user.uid && appt.doctorId !== user.id)) {
          showError('Appointment not found or unauthorized')
          navigate('/doctor/appointments')
          return
        }
        setAppointment(appt)

        const docs = await getDocumentsForAppointment(appointmentId, user)
        setDocuments(docs)

        const existingReport = await getReportForAppointment(appointmentId, user)
        setReport(existingReport)
      } catch (err) {
        console.error('FETCH DATA ERROR:', err)
        showError('Failed to load appointment details: ' + (err.message || 'Unknown error'))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [appointmentId, user, navigate])

  const handleStatusChange = async (newStatus) => {
    try {
      await updateAppointmentStatus(appointmentId, newStatus)
      setAppointment(prev => ({ ...prev, status: newStatus }))
      showSuccess(`Appointment marked as ${newStatus}`)

      // Send notification to patient
      await sendNotification({
        recipientId: appointment.patientId,
        title: `Appointment ${newStatus}`,
        message: `Your appointment with ${formatDoctorName(user.name || user.firstName)} has been marked as ${newStatus}.`,
        type: 'appointment',
        link: `/patient/appointments/${appointmentId}`
      })
    } catch (err) {
      showError(`Failed to mark appointment as ${newStatus}`)
    }
  }

  const handleFileSelected = async (file) => {
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      showError('File is too large. Maximum size is 10MB')
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      const uploadResult = await uploadFileToCloudinary({
        file,
        folder: `patient-documents/${appointment.patientId}/appointments/${appointmentId}`,
        onProgress: (value) => setProgress(value),
      })

      await createPatientDocument({
        appointmentId,
        patientUid: appointment.patientId,
        patientName: appointment.patientName,
        patientEmail: '', 
        doctorId: user.uid || user.id,
        hospitalId: appointment.hospitalId,
        fileName: file.name,
        fileUrl: uploadResult.secure_url,
        mimeType: file.type,
        uploadedByRole: 'doctor'
      })
      
      showSuccess('Prescription document uploaded successfully')
      
      const docs = await getDocumentsForAppointment(appointmentId, user)
      setDocuments(docs)
      setProgress(0)

      // Notify via Email
      await notifyPatientPrescriptionUploaded(appointment.patientId, user.name || user.firstName)

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

  const handleGenerateReport = async (e) => {
    e.preventDefault()
    if (!reportForm.diagnosis || !reportForm.prescription) {
      showError('Diagnosis and Prescription are required')
      return
    }

    setGeneratingReport(true)
    try {
      const reportData = {
        appointmentId,
        doctorId: user.uid || user.id,
        patientId: appointment.patientId,
        diagnosis: reportForm.diagnosis,
        prescription: reportForm.prescription,
        recommendations: reportForm.recommendations,
      }
      
      const newReportId = await generateReport(reportData)
      setReport({ id: newReportId, ...reportData })
      showSuccess('Medical report generated successfully')

      // Notify patient
      await sendNotification({
        recipientId: appointment.patientId,
        title: 'New Medical Report',
        message: `${formatDoctorName(user.name || user.firstName)} has generated a medical report for your recent appointment.`,
        type: 'report',
        link: `/patient/appointments/${appointmentId}`
      })

      // Notify via Email
      await notifyPatientPrescriptionUploaded(appointment.patientId, user.name || user.firstName)

    } catch (err) {
      showError('Failed to generate report')
    } finally {
      setGeneratingReport(false)
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
        onClick={() => navigate('/doctor/appointments')}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Appointments
      </button>

      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Appointment Details</h1>
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                appointment.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                appointment.status === 'approved' ? 'bg-teal-100 text-teal-700' : 
                appointment.status === 'completed' ? 'bg-blue-100 text-blue-700' : 
                appointment.status === 'missed' ? 'bg-gray-200 text-gray-700' : 
                'bg-slate-100 text-slate-700'
              }`}>
                {appointment.status}
              </span>

              {appointment.status === 'pending' && (
                <div className="flex items-center gap-2">
                  <button onClick={() => handleStatusChange('approved')} className="text-xs font-medium bg-teal-50 text-teal-600 px-2 py-1 rounded hover:bg-teal-100 transition-colors">Approve</button>
                  <button onClick={() => handleStatusChange('cancelled')} className="text-xs font-medium bg-rose-50 text-rose-600 px-2 py-1 rounded hover:bg-rose-100 transition-colors">Reject</button>
                </div>
              )}
              {appointment.status === 'approved' && (
                <div className="flex items-center gap-2">
                  <button onClick={() => handleStatusChange('completed')} className="text-xs font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Mark Completed
                  </button>
                  <button onClick={() => handleStatusChange('missed')} className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200 transition-colors flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Mark Missed
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50">
          <div>
            <p className="text-sm font-medium text-slate-400 mb-1 flex items-center gap-1.5"><User className="w-4 h-4" /> Patient</p>
            <p className="font-semibold text-slate-900 dark:text-white">{appointment.patientName}</p>
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
                {uploading ? 'Uploading...' : 'Upload Prescription'}
              </label>
            </div>
          )}
        </div>

        <div className="space-y-8">
          {/* Doctor Prescriptions */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-300 mb-3 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-cyan-600" /> Uploaded Prescriptions
            </h3>
            <div className="space-y-3">
              {documents.filter(doc => doc.uploadedByRole === 'doctor').length === 0 ? (
                <div className="text-center p-6 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                  <p className="text-slate-500 text-sm">You haven't uploaded any prescriptions for this appointment.</p>
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
                      <button onClick={() => setPreviewDocument(doc)} className="btn-secondary px-3 py-1.5 text-xs inline-flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </button>
                      <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="btn-primary px-3 py-1.5 text-xs inline-flex items-center gap-1.5">
                        <Download className="w-3.5 h-3.5" /> Download
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
              <User className="w-4 h-4 text-teal-600" /> Patient Medical Records
            </h3>
            <div className="space-y-3">
              {documents.filter(doc => doc.uploadedByRole !== 'doctor').length === 0 ? (
                <div className="text-center p-6 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                  <p className="text-slate-500 text-sm">The patient hasn't uploaded any documents yet.</p>
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
                      <button onClick={() => setPreviewDocument(doc)} className="btn-secondary px-3 py-1.5 text-xs inline-flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </button>
                      <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="btn-primary px-3 py-1.5 text-xs inline-flex items-center gap-1.5">
                        <Download className="w-3.5 h-3.5" /> Download
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {appointment.status === 'completed' && (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Medical Report</h2>
          
          {report ? (
            <div className="space-y-6">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl text-sm mb-6 border border-emerald-100 dark:border-emerald-800/50 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Medical report generated successfully.
              </div>
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
          ) : (
            <form onSubmit={handleGenerateReport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Diagnosis <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={reportForm.diagnosis}
                  onChange={(e) => setReportForm({ ...reportForm, diagnosis: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="E.g., Viral Pharyngitis"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Prescription Notes <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows="4"
                  value={reportForm.prescription}
                  onChange={(e) => setReportForm({ ...reportForm, prescription: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                  placeholder="List medications, dosage, and duration..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Follow-up Recommendations
                </label>
                <textarea
                  rows="2"
                  value={reportForm.recommendations}
                  onChange={(e) => setReportForm({ ...reportForm, recommendations: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                  placeholder="E.g., Return in 7 days if symptoms persist."
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={generatingReport}
                  className="btn-primary"
                >
                  {generatingReport ? 'Generating...' : 'Generate Medical Report'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <FilePreviewModal document={previewDocument} onClose={() => setPreviewDocument(null)} />
    </div>
  )
}

export default DoctorAppointmentDetails
