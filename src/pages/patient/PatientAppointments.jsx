import { useState, useEffect, useContext } from 'react'
import { motion } from 'framer-motion'
import { Calendar as CalendarIcon, Clock, MapPin, Stethoscope, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader'
import { getPatientAppointments } from '../../services/appointmentService'
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

const PatientAppointments = () => {
  const { user } = useContext(AuthContext)
  const { showError } = useToast()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await getPatientAppointments(user.uid)
        // Sort by date (descending)
        data.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
        setAppointments(data)
      } catch (err) {
        showError('Failed to load appointments')
      } finally {
        setLoading(false)
      }
    }
    fetchAppointments()
  }, [user.uid])

  const filteredAppointments = appointments.filter(appt => {
    if (activeTab === 'upcoming') return ['pending', 'approved'].includes(appt.status)
    if (activeTab === 'completed') return appt.status === 'completed'
    if (activeTab === 'missed') return appt.status === 'missed'
    if (activeTab === 'cancelled') return appt.status === 'cancelled'
    return true
  })

  return (
    <div>
      <DashboardPageHeader
        role="patient"
        title="My Appointments"
        subtitle="View and manage your doctor appointments and medical records"
        action={
          <Link to="/patient/hospitals" className="btn-primary inline-flex items-center text-sm">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Book New Appointment
          </Link>
        }
      />

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {['upcoming', 'completed', 'missed', 'cancelled'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border ${
              activeTab === tab 
                ? 'bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-500/20 dark:border-teal-500' 
                : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="dashboard-card"
      >
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl" />)}
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center p-12 bg-slate-50 dark:bg-slate-900/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <CalendarIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Appointments Yet</h3>
            <p className="text-slate-500 mb-6">You haven't booked any appointments yet.</p>
            <Link to="/patient/hospitals" className="btn-primary inline-flex items-center">
              Book Your First Appointment
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredAppointments.map(appt => (
              <Link 
                key={appt.id} 
                to={`/patient/appointments/${appt.id}`}
                className="group p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {appt.doctorName}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {appt.hospitalName}</span>
                      <span className="flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5" /> {appt.appointmentDate}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {appt.appointmentTime}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-slate-100 dark:border-slate-800 pt-4 md:pt-0">
                  <StatusBadge status={appt.status} />
                  <div className="flex items-center gap-1 text-sm font-medium text-teal-600 dark:text-teal-400">
                    Details <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default PatientAppointments
