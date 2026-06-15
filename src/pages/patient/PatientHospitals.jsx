import { useState, useEffect, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, MapPin, Phone, Mail, ChevronRight, Stethoscope, Calendar, Clock, X, Check } from 'lucide-react'
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader'
import { getVerifiedHospitals, getDoctorsByHospital } from '../../services/patientService'
import { bookAppointment, getDoctorAppointmentsByDate } from '../../services/appointmentService'
import { checkDoctorLeaveOnDate } from '../../services/leaveService'
import { AuthContext } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'

const PatientHospitals = () => {
  const { user } = useContext(AuthContext)
  const { showSuccess, showError } = useToast()
  
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedHospital, setSelectedHospital] = useState(null)
  
  const [doctors, setDoctors] = useState([])
  const [doctorsLoading, setDoctorsLoading] = useState(false)
  
  const [bookingDoctor, setBookingDoctor] = useState(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [booking, setBooking] = useState(false)
  const [bookedSlots, setBookedSlots] = useState([])
  const [isDoctorOnLeave, setIsDoctorOnLeave] = useState(false)
  const [checkingSlots, setCheckingSlots] = useState(false)

  // Get tomorrow's date for the min attribute
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDateStr = tomorrow.toISOString().split('T')[0]

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const data = await getVerifiedHospitals()
        setHospitals(data)
      } catch (err) {
        showError('Failed to load hospitals')
      } finally {
        setLoading(false)
      }
    }
    fetchHospitals()
  }, [])

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!date || !bookingDoctor) {
        setBookedSlots([])
        setIsDoctorOnLeave(false)
        return
      }
      
      setCheckingSlots(true)
      const docId = bookingDoctor.uid || bookingDoctor.id
      try {
        const onLeave = await checkDoctorLeaveOnDate(docId, date)
        setIsDoctorOnLeave(onLeave)
        
        if (!onLeave) {
          const appointments = await getDoctorAppointmentsByDate(docId, date)
          // Mark 'pending', 'approved', 'completed' as booked. 'rejected' slots are free.
          const booked = appointments
            .filter(app => app.status !== 'rejected')
            .map(app => app.appointmentTime)
          setBookedSlots(booked)
        }
      } catch (err) {
        console.error("Failed to fetch availability", err)
      } finally {
        setCheckingSlots(false)
      }
    }
    
    fetchAvailability()
  }, [date, bookingDoctor])

  const handleSelectHospital = async (hospital) => {
    setSelectedHospital(hospital)
    setDoctorsLoading(true)
    try {
      const docs = await getDoctorsByHospital(hospital.id)
      setDoctors(docs)
    } catch (err) {
      showError('Failed to load doctors')
    } finally {
      setDoctorsLoading(false)
    }
  }

  const handleBook = async (e) => {
    e.preventDefault()
    if (!date || !time) {
      showError('Please select a date and time')
      return
    }
    
    setBooking(true)
    try {
      await bookAppointment({
        patientId: user.uid,
        patientName: user.name,
        doctorId: bookingDoctor.uid || bookingDoctor.id, // Support auth ID vs doc ID
        doctorName: bookingDoctor.name,
        hospitalId: selectedHospital.id,
        hospitalName: selectedHospital.name,
        appointmentDate: date,
        appointmentTime: time,
      })
      showSuccess('Appointment booked successfully! Waiting for doctor approval.')
      setBookingDoctor(null)
      setDate('')
      setTime('')
    } catch (err) {
      showError('Failed to book appointment')
    } finally {
      setBooking(false)
    }
  }

  return (
    <div>
      <DashboardPageHeader
        role="patient"
        title="Hospital Directory"
        subtitle="Find verified hospitals and book appointments with top doctors"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Hospital List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-fuchsia-500" />
            Verified Hospitals
          </h2>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
              ))}
            </div>
          ) : hospitals.length === 0 ? (
            <div className="p-6 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              No verified hospitals available yet.
            </div>
          ) : (
            hospitals.map(hospital => (
              <motion.button
                key={hospital.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectHospital(hospital)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedHospital?.id === hospital.id 
                    ? 'bg-fuchsia-50 border-fuchsia-200 dark:bg-fuchsia-900/20 dark:border-fuchsia-800/50 ring-1 ring-fuchsia-500 shadow-md' 
                    : 'bg-white border-slate-200 hover:border-fuchsia-300 dark:bg-slate-900/50 dark:border-slate-800 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1">{hospital.name}</h3>
                  <div className="flex-shrink-0 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Verified
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="line-clamp-1">{hospital.address}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    {hospital.phone}
                  </p>
                </div>
              </motion.button>
            ))
          )}
        </div>

        {/* Right Column: Doctors */}
        <div className="lg:col-span-2">
          {selectedHospital ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm min-h-[400px]"
            >
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedHospital.name}</h2>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> {selectedHospital.address}
                </p>
                {selectedHospital.description && (
                  <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    {selectedHospital.description}
                  </p>
                )}
              </div>

              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-500" />
                Available Doctors
              </h3>

              {doctorsLoading ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {[1, 2].map(i => <div key={i} className="h-32 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl" />)}
                </div>
              ) : doctors.length === 0 ? (
                <div className="text-center p-8 text-slate-500 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  No doctors listed for this hospital yet.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {doctors.map(doc => (
                    <div key={doc.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:border-teal-500/50 transition-colors group">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white">{doc.name}</h4>
                          <p className="text-xs text-teal-600 dark:text-teal-400 font-medium mt-0.5">{doc.specialization}</p>
                        </div>
                      </div>
                      <div className="space-y-1 mb-4">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-medium">Qual:</span> {doc.qualification || 'Not specified'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-medium">Exp:</span> {doc.experience ? `${doc.experience} years` : 'Not specified'}
                        </p>
                      </div>
                      <button 
                        onClick={() => setBookingDoctor(doc)}
                        className="w-full py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 dark:hover:bg-teal-900/30 dark:hover:text-teal-300 dark:hover:border-teal-800 transition-all shadow-sm group-hover:shadow-md"
                      >
                        Book Appointment
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-900/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <Building2 className="w-12 h-12 mb-4 opacity-20" />
              <p>Select a hospital from the list to view its doctors.</p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {bookingDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <h3 className="font-bold text-slate-900 dark:text-white">Book Appointment</h3>
                <button onClick={() => setBookingDoctor(null)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-6 p-4 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800/50">
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold mb-1 uppercase tracking-wider">Doctor</p>
                  <p className="font-bold text-slate-900 dark:text-white text-lg">{bookingDoctor.name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{bookingDoctor.specialization} &bull; {selectedHospital.name}</p>
                </div>

                <form onSubmit={handleBook} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      Date
                    </label>
                    <input 
                      type="date" 
                      required
                      min={minDateStr}
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="dashboard-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      Select Time Slot
                    </label>
                    
                    {checkingSlots ? (
                      <div className="text-sm text-slate-500 py-8 text-center flex flex-col items-center gap-2">
                        <div className="w-5 h-5 border-2 border-slate-300 border-t-cyan-500 rounded-full animate-spin"></div>
                        Checking availability...
                      </div>
                    ) : isDoctorOnLeave ? (
                      <div className="text-sm text-red-600 dark:text-red-400 py-6 text-center bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/50 font-medium flex flex-col items-center gap-2">
                        <X className="w-6 h-6 text-red-500" />
                        Doctor is not available on this date.
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                        <div>
                          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Morning</p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'].map(t => (
                              <button
                                key={t}
                                type="button"
                                disabled={bookedSlots.includes(t)}
                                onClick={() => setTime(t)}
                                className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition-all ${bookedSlots.includes(t) ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-600' : time === t ? 'bg-cyan-500 border-cyan-500 text-white shadow-md shadow-cyan-500/30' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-cyan-400 dark:hover:border-cyan-600'}`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Afternoon</p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {['12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'].map(t => (
                              <button
                                key={t}
                                type="button"
                                disabled={bookedSlots.includes(t)}
                                onClick={() => setTime(t)}
                                className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition-all ${bookedSlots.includes(t) ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-600' : time === t ? 'bg-cyan-500 border-cyan-500 text-white shadow-md shadow-cyan-500/30' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-cyan-400 dark:hover:border-cyan-600'}`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Evening</p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {['05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM'].map(t => (
                              <button
                                key={t}
                                type="button"
                                disabled={bookedSlots.includes(t)}
                                onClick={() => setTime(t)}
                                className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition-all ${bookedSlots.includes(t) ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-600' : time === t ? 'bg-cyan-500 border-cyan-500 text-white shadow-md shadow-cyan-500/30' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-cyan-400 dark:hover:border-cyan-600'}`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4">
                    <button 
                      type="submit" 
                      disabled={booking}
                      className="btn-primary w-full justify-center"
                    >
                      {booking ? 'Booking...' : 'Confirm Appointment'}
                    </button>
                    <p className="text-xs text-center text-slate-500 mt-3">
                      Your appointment will require approval from the doctor. You can upload medical records after approval.
                    </p>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PatientHospitals
