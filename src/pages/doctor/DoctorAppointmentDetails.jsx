import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, User, FileText, Download, Eye, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import { getAppointmentById, updateAppointmentStatus } from '../../services/appointmentService'
import { getDocumentsForAppointment } from '../../services/documentService'
import { AuthContext } from '../../context/AuthContext'
import FilePreviewModal from '../../components/FilePreviewModal'
import { useToast } from '../../components/Toast'

const DoctorAppointmentDetails = () => {
  const { appointmentId } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const { showError, showSuccess } = useToast()

  const [appointment, setAppointment] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [previewDocument, setPreviewDocument] = useState(null)

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

        const docs = await getDocumentsForAppointment(appointmentId)
        setDocuments(docs)
      } catch (err) {
        showError('Failed to load appointment details')
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
    } catch (err) {
      showError(`Failed to mark appointment as ${newStatus}`)
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

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Appointment Details</h1>
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                appointment.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                appointment.status === 'approved' ? 'bg-teal-100 text-teal-700' : 
                appointment.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
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
                <button onClick={() => handleStatusChange('completed')} className="text-xs font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Mark Completed
                </button>
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

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Patient Medical Records</h2>

        <div className="space-y-3">
          {documents.length === 0 ? (
            <div className="text-center p-8 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700/50">
              <p className="text-slate-500 text-sm">The patient hasn't uploaded any documents for this appointment yet.</p>
              {appointment.status === 'pending' && <p className="text-slate-400 text-xs mt-2">Patients can only upload documents after you approve the appointment.</p>}
            </div>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-cyan-300 dark:hover:border-cyan-700 transition-colors gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-sm border border-slate-200 dark:border-slate-600">
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

      <FilePreviewModal document={previewDocument} onClose={() => setPreviewDocument(null)} />
    </div>
  )
}

export default DoctorAppointmentDetails
