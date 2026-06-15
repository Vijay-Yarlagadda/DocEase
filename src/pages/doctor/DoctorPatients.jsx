import { useState, useEffect, useContext, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Users, User, Calendar, Activity, Search, MapPin, Phone } from 'lucide-react'
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader'
import { getDoctorAppointments } from '../../services/appointmentService'
import { AuthContext } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'

const DoctorPatients = () => {
  const { user } = useContext(AuthContext)
  const { showError } = useToast()
  
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchPatients = async () => {
      if (!user?.uid) return
      try {
        const data = await getDoctorAppointments(user.uid)
        // Only consider approved or completed appointments as "my patients"
        const validAppointments = data.filter(a => a.status === 'approved' || a.status === 'completed')
        setAppointments(validAppointments)
      } catch (err) {
        showError('Failed to load patients')
      } finally {
        setLoading(false)
      }
    }
    fetchPatients()
  }, [user?.uid])

  // Process appointments into unique patients
  const uniquePatients = useMemo(() => {
    const patientMap = new Map()
    
    appointments.forEach(appt => {
      if (!patientMap.has(appt.patientId)) {
        patientMap.set(appt.patientId, {
          id: appt.patientId,
          name: appt.patientName || 'Unknown Patient',
          email: appt.patientEmail || '', // Assuming you might have email
          totalVisits: 0,
          appointments: []
        })
      }
      
      const p = patientMap.get(appt.patientId)
      p.totalVisits += 1
      p.appointments.push(appt)
    })
    
    // Sort appointments for each patient to find the latest
    Array.from(patientMap.values()).forEach(p => {
      p.appointments.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
      p.lastVisit = p.appointments[0].appointmentDate
    })
    
    return Array.from(patientMap.values())
  }, [appointments])

  // Filter patients based on search
  const filteredPatients = uniquePatients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <DashboardPageHeader
        role="doctor"
        title="My Patients"
        subtitle="Manage and view the profiles of your confirmed patients"
      />

      <div className="dashboard-card mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-50 dark:bg-teal-900/20 text-teal-500 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Patient Directory</h2>
              <p className="text-sm text-slate-500">{uniquePatients.length} Total Unique Patients</p>
            </div>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search patients..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="dashboard-input w-full pl-10"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-40 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="text-center p-12 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 shadow-sm">
          <User className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Patients Found</h3>
          <p className="text-slate-500">
            {searchTerm ? 'No patients match your search criteria.' : 'You have no confirmed patients yet. Approve pending appointments to see them here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient, index) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4 mb-5">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-teal-500/30 group-hover:scale-105 transition-transform">
                  {patient.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {patient.name}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Patient ID: {patient.id.slice(0, 6)}</p>
                </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1.5"><Activity className="w-4 h-4 text-teal-500" /> Total Consultations</span>
                  <span className="font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">{patient.totalVisits}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1.5"><Calendar className="w-4 h-4 text-blue-500" /> Most Recent Visit</span>
                  <span className="font-medium text-slate-900 dark:text-white">{patient.lastVisit}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DoctorPatients
