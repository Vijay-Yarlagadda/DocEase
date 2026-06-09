import { useEffect, useState, useMemo, useContext } from 'react'
import { motion } from 'framer-motion'
import { Search, User, Clock, ClipboardList } from 'lucide-react'
import { getPatientsByHospital, getAppointmentsByHospital } from '../../services/adminService'
import { AuthContext } from '../../context/AuthContext'
import { useToast } from '../Toast'
import { PanelSkeleton } from './SkeletonLoader'

const PatientManagementPanel = () => {
  const [patients, setPatients] = useState([])
  const [appointments, setAppointments] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const { showError } = useToast()

  const { user } = useContext(AuthContext)

  useEffect(() => {
    const hospitalId = user?.uid || user?.hospitalId || null
    if (!hospitalId) {
      setLoading(false)
      return
    }

    Promise.all([getPatientsByHospital(hospitalId), getAppointmentsByHospital(hospitalId)])
      .then(([patientList, appointmentList]) => {
        setPatients(patientList)
        setAppointments(appointmentList)
      })
      .catch((err) => showError(err.message || 'Failed to load patient data'))
      .finally(() => setLoading(false))
  }, [showError, user])

  const patientsWithStats = useMemo(() => {
    return patients.map((patient) => {
      const count = appointments.filter(
        (appt) =>
          appt.patientEmail === patient.email ||
          appt.patientEmail === patient.mail ||
          appt.patientId === patient.id ||
          appt.patientName === patient.name
      ).length
      return { ...patient, appointmentCount: count }
    })
  }, [patients, appointments])

  const filteredPatients = useMemo(() => {
    const q = search.toLowerCase()
    return patientsWithStats.filter(
      (patient) =>
        !q ||
        patient.name?.toLowerCase().includes(q) ||
        patient.email?.toLowerCase().includes(q) ||
        patient.phone?.toLowerCase().includes(q)
    )
  }, [patientsWithStats, search])

  const handleSelectPatient = (patient) => setSelectedPatient(patient)

  if (loading) return <PanelSkeleton rows={6} />

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="dashboard-card xl:col-span-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Registered Patients</p>
            <p className="text-xs text-slate-500">Search patients and review appointment history counts.</p>
          </div>
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patients..."
              className="dashboard-input pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          {filteredPatients.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-10">No patients match your search.</p>
          ) : (
            filteredPatients.map((patient) => (
              <button
                key={patient.id}
                type="button"
                onClick={() => handleSelectPatient(patient)}
                className="w-full text-left p-4 rounded-2xl bg-white/90 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-700/30 hover:border-accent/40 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white truncate">{patient.name || 'Patient'}</p>
                    <p className="text-xs text-slate-500 truncate">{patient.email || patient.mail || 'No email'}</p>
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{patient.appointmentCount} appts</span>
                </div>
              </button>
            ))
          )}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="dashboard-card">
        <div className="flex items-center gap-2 mb-5">
          <User className="w-5 h-5 text-accent" />
          <div>
            <p className="text-base font-semibold text-slate-900 dark:text-white">Patient Profile</p>
            <p className="text-xs text-slate-500">Medical files are not shown here for privacy.</p>
          </div>
        </div>

        {selectedPatient ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedPatient.name || 'Patient'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{selectedPatient.email || selectedPatient.mail || 'No email'}</p>
            </div>
            <div className="space-y-2 text-sm text-slate-400">
              <p><span className="text-slate-200">Phone:</span> {selectedPatient.phone || 'Not provided'}</p>
              <p><span className="text-slate-200">Joined:</span> {selectedPatient.createdAt?.toDate ? selectedPatient.createdAt.toDate().toLocaleDateString() : 'Unknown'}</p>
              <p><span className="text-slate-200">Appointments:</span> {selectedPatient.appointmentCount}</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="rounded-2xl border border-slate-200/70 dark:border-slate-700/40 bg-white/90 dark:bg-slate-900/60 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-accent" />
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Appointment History</p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Search appointments use the main scheduler or doctor directories to review patient visit history.</p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 dark:border-slate-700/40 bg-white/90 dark:bg-slate-900/60 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ClipboardList className="w-4 h-4 text-cyan-400" />
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Privacy</p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Patient medical documents are only accessible to the patient and assigned doctors.</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Select a patient to see their profile summary and appointment history count.</p>
        )}
      </motion.div>
    </div>
  )
}

export default PatientManagementPanel
