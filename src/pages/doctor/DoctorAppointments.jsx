import { useState, useEffect, useContext } from 'react'
import { motion } from 'framer-motion'
import { Calendar as CalendarIcon, Clock, MapPin, User, ChevronRight, CheckCircle, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader'
import { getDoctorAppointments, updateAppointmentStatus } from '../../services/appointmentService'
import { AuthContext } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'

const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    approved: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    missed: 'bg-gray-200 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400',
  }
  const defaultStyle = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[status] || defaultStyle}`}>
      {status || 'Unknown'}
    </span>
  )
}

const DoctorAppointments = () => {
  const { user } = useContext(AuthContext)
  const { showError, showSuccess } = useToast()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      // Assuming user.uid is the doctor's ID, or user.id
      const doctorId = user.uid || user.id
      const data = await getDoctorAppointments(doctorId)
      // Sort by date (descending)
      data.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
      setAppointments(data)
    } catch (err) {
      showError('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [user])

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await updateAppointmentStatus(appointmentId, newStatus)
      showSuccess(`Appointment marked as ${newStatus}`)
      fetchAppointments()
    } catch (err) {
      showError(`Failed to mark appointment as ${newStatus}`)
    }
  }

  return (
    <div>
      <DashboardPageHeader
        role="doctor"
        title="My Appointments"
        subtitle="Manage patient appointments and approvals"
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="dashboard-card"
      >
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl" />)}
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center p-12 bg-slate-50 dark:bg-slate-900/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <CalendarIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Appointments</h3>
            <p className="text-slate-500">You don't have any appointments scheduled.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {appointments.map(appt => (
              <div 
                key={appt.id} 
                className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-200 dark:border-slate-800 hover:border-cyan-300 dark:hover:border-cyan-700 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      {appt.patientName}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5" /> {appt.appointmentDate}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {appt.appointmentTime}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-slate-100 dark:border-slate-800 pt-4 md:pt-0">
                  <StatusBadge status={appt.status} />
                  
                  {appt.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleStatusChange(appt.id, 'approved')}
                        className="p-2 text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-lg dark:bg-teal-900/20 dark:hover:bg-teal-900/40 transition-colors"
                        title="Approve"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleStatusChange(appt.id, 'cancelled')}
                        className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg dark:bg-rose-900/20 dark:hover:bg-rose-900/40 transition-colors"
                        title="Reject"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  <Link 
                    to={`/doctor/appointments/${appt.id}`}
                    className="flex items-center gap-1 text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300"
                  >
                    View Details <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default DoctorAppointments
