import { useState, useEffect, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { Building2, MapPin, Phone, Mail, ChevronRight, Stethoscope, Calendar, Clock, X, Check, Search, Globe } from 'lucide-react'
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader'
import { getVerifiedHospitals, getDoctorsByHospital } from '../../services/patientService'
import { bookAppointment, getDoctorAppointmentsByDate, subscribeToDoctorAppointmentsByDate } from '../../services/appointmentService'
import { checkDoctorLeaveOnDate, subscribeToDoctorLeaveOnDate } from '../../services/leaveService'
import { AuthContext } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'
import { formatDoctorName } from '../../utils/userProfile'

const POPULAR_CITIES = [
  'Mumbai', 'Delhi NCR', 'Bengaluru', 'Hyderabad', 
  'Chandigarh', 'Ahmedabad', 'Chennai', 'Pune', 
  'Kolkata', 'Kochi'
]

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

  const [selectedLocation, setSelectedLocation] = useState(() => localStorage.getItem('userLocation') || '')
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [locationSearch, setLocationSearch] = useState('')

  const generateTimeSlots = (doctor, selectedDateStr) => {
    const settings = doctor?.appointmentSettings || {}
    const duration = settings.slotDuration || 30
    const startStr = settings.startTime || '09:00'
    const endStr = settings.endTime || '17:00'
    const breakStart = settings.breakStart || ''
    const breakEnd = settings.breakEnd || ''
    const workingDays = settings.workingDays || [1, 2, 3, 4, 5]

    if (selectedDateStr) {
      const dayOfWeek = new Date(selectedDateStr).getDay()
      if (!workingDays.includes(dayOfWeek)) {
        const dayName = new Date(selectedDateStr).toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })
        return { notWorkingDay: true, dayName, morning: [], afternoon: [], evening: [] }
      }
    }

    const parseTime = (tStr) => {
      if (!tStr) return null
      const [h, m] = tStr.split(':').map(Number)
      return h * 60 + m
    }

    const formatTime = (totalMins) => {
      const h = Math.floor(totalMins / 60)
      const m = totalMins % 60
      const ampm = h >= 12 ? 'PM' : 'AM'
      const h12 = h % 12 || 12
      const hh = String(h12).padStart(2, '0')
      const mm = String(m).padStart(2, '0')
      return `${hh}:${mm} ${ampm}`
    }

    const startMins = parseTime(startStr)
    const endMins = parseTime(endStr)
    const bStart = parseTime(breakStart)
    const bEnd = parseTime(breakEnd)

    const slots = { notWorkingDay: false, morning: [], afternoon: [], evening: [] }

    for (let current = startMins; current + duration <= endMins; current += duration) {
      if (bStart !== null && bEnd !== null) {
        if (current >= bStart && current < bEnd) continue
        if (current + duration > bStart && current < bEnd) continue
      }
      const h = Math.floor(current / 60)
      const formatted = formatTime(current)
      if (h < 12) slots.morning.push(formatted)
      else if (h < 17) slots.afternoon.push(formatted)
      else slots.evening.push(formatted)
    }
    return slots
  }

  const generatedSlots = bookingDoctor ? generateTimeSlots(bookingDoctor, date) : { notWorkingDay: false, morning: [], afternoon: [], evening: [] }

  // Get tomorrow's date for the min attribute
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDateStr = tomorrow.toISOString().split('T')[0]

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const data = await getVerifiedHospitals()
        setHospitals(data)
        
        // If no location selected, show location modal
        if (!localStorage.getItem('userLocation')) {
          setShowLocationModal(true)
        }
      } catch (err) {
        showError('Failed to load hospitals')
      } finally {
        setLoading(false)
      }
    }
    fetchHospitals()
  }, [])

  useEffect(() => {
    let unsubscribeLeave = () => {}
    let unsubscribeAppts = () => {}

    if (!date || !bookingDoctor) {
      setBookedSlots([])
      setIsDoctorOnLeave(false)
      setCheckingSlots(false)
      return
    }

    setCheckingSlots(true)
    const docId = bookingDoctor.uid || bookingDoctor.id

    unsubscribeLeave = subscribeToDoctorLeaveOnDate(docId, date, (onLeave) => {
      setIsDoctorOnLeave(onLeave)
      setCheckingSlots(false)
      
      if (!onLeave) {
        unsubscribeAppts = subscribeToDoctorAppointmentsByDate(docId, date, (appointments) => {
          const booked = appointments
            .filter(app => app.status !== 'rejected')
            .map(app => app.appointmentTime)
          setBookedSlots(booked)
        }, (err) => {
          console.error("Appointments subscription failed:", err)
          setCheckingSlots(false)
        })
      } else {
        unsubscribeAppts()
      }
    }, (err) => {
      console.error("Leave subscription failed:", err)
      setCheckingSlots(false)
    })

    return () => {
      unsubscribeLeave()
      unsubscribeAppts()
    }
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

  const handleLocationSelect = (loc) => {
    setSelectedLocation(loc)
    if (loc) {
      localStorage.setItem('userLocation', loc)
    } else {
      localStorage.removeItem('userLocation')
    }
    setShowLocationModal(false)
    setSelectedHospital(null)
    setDoctors([])
    setLocationSearch('')
  }

  const filteredHospitals = hospitals.filter(h => {
    if (!selectedLocation) return true
    const searchStr = selectedLocation.toLowerCase()
    return (h.pincode?.toLowerCase() || '').includes(searchStr) || 
           (h.address?.toLowerCase() || '').includes(searchStr) ||
           (h.name?.toLowerCase() || '').includes(searchStr)
  })

  return (
    <div>
      <DashboardPageHeader
        role="patient"
        title="Hospital Directory"
        subtitle="Find verified hospitals and book appointments with top doctors"
        action={
          <button
            onClick={() => setShowLocationModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-teal-300 dark:hover:border-teal-700 transition-all group"
          >
            <MapPin className="w-4 h-4 text-teal-500 group-hover:scale-110 transition-transform" />
            {selectedLocation || 'All Locations'}
          </button>
        }
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
          ) : filteredHospitals.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-2xl border border-slate-200 dark:border-slate-800">
              <MapPin className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No hospitals found</p>
              <p className="text-sm mt-1">Try changing your location filter.</p>
              <button 
                onClick={() => setShowLocationModal(true)}
                className="mt-4 px-4 py-2 bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 rounded-lg text-sm font-medium hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors"
              >
                Change Location
              </button>
            </div>
          ) : (
            filteredHospitals.map(hospital => (
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
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-black/20/50 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm min-h-[400px]"
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
                          <h4 className="font-semibold text-slate-900 dark:text-white">{formatDoctorName(doc.name)}</h4>
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
                        className="w-full py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 dark:hover:bg-teal-900/30 dark:hover:text-teal-300 dark:hover:border-teal-800 transition-all shadow-sm group-hover:shadow-md"
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

      {/* Location Modal */}
      {createPortal(
        <AnimatePresence>
          {showLocationModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl shadow-slate-200/50 dark:shadow-black/50 rounded-3xl overflow-hidden w-full max-w-md border border-slate-200 dark:border-slate-800 flex flex-col"
              >
                <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-teal-500/10 to-transparent dark:from-teal-500/5">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <MapPin className="w-6 h-6 text-teal-500" />
                      Select Location
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Filter hospitals by your pincode</p>
                  </div>
                  {localStorage.getItem('userLocation') !== null && (
                    <button onClick={() => setShowLocationModal(false)} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar max-h-[60vh] bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="Search by city, area, or pincode..."
                        value={locationSearch}
                        onChange={(e) => setLocationSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="mb-3 flex justify-between items-center">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {locationSearch.trim() === '' ? 'Popular Cities' : 'Search Results'}
                    </p>
                  </div>
                  
                  {locationSearch.trim() !== '' ? (
                    <div className="space-y-3">
                      <button
                        onClick={() => handleLocationSelect(locationSearch.trim())}
                        className="w-full py-4 px-4 rounded-2xl border border-teal-200 dark:border-teal-800/50 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 text-sm font-bold transition-all flex items-center gap-3 hover:bg-teal-100 dark:hover:bg-teal-900/40"
                      >
                        <Search className="w-5 h-5 opacity-70" />
                        Search for "{locationSearch.trim()}"
                      </button>
                      <button
                        onClick={() => handleLocationSelect('')}
                        className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium transition-all hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      >
                        View All Locations instead
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleLocationSelect('')}
                        className={`py-4 px-4 rounded-2xl border text-sm font-bold transition-all flex flex-col items-center justify-center gap-2 ${!selectedLocation ? 'bg-teal-50 border-teal-500 text-teal-700 shadow-md shadow-teal-500/20 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700/50' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-teal-300 hover:text-teal-600 hover:shadow-sm'}`}
                      >
                        <Globe className="w-5 h-5 opacity-70" />
                        All Locations
                      </button>
                      {POPULAR_CITIES.map(city => (
                        <button
                          key={city}
                          onClick={() => handleLocationSelect(city)}
                          className={`py-4 px-4 rounded-2xl border text-sm font-bold transition-all flex flex-col items-center justify-center gap-2 ${selectedLocation === city ? 'bg-teal-50 border-teal-500 text-teal-700 shadow-md shadow-teal-500/20 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700/50' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-teal-300 hover:text-teal-600 hover:shadow-sm'}`}
                        >
                          <Building2 className="w-5 h-5 opacity-70" />
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Booking Modal */}
      {createPortal(
        <AnimatePresence>
          {bookingDoctor && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-3xl overflow-hidden w-full max-w-md border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]"
              >
                <div className="flex-shrink-0 flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                  <h3 className="font-bold text-slate-900 dark:text-white">Book Appointment</h3>
                  <button onClick={() => setBookingDoctor(null)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar">
                  <div className="mb-6 p-4 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800/50">
                    <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold mb-1 uppercase tracking-wider">Doctor</p>
                    <p className="font-bold text-slate-900 dark:text-white text-lg">{formatDoctorName(bookingDoctor.name)}</p>
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
                      ) : generatedSlots.notWorkingDay ? (
                        <div className="text-sm text-amber-600 dark:text-amber-400 py-6 text-center bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-900/50 font-medium flex flex-col items-center gap-2">
                          <X className="w-6 h-6 text-amber-500" />
                          <div className="space-y-1">
                            <p>Doctor does not take appointments on {generatedSlots.dayName}s.</p>
                            <p className="text-xs text-amber-500/80 font-normal">This is based on their regular Schedule Settings, not a leave.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                          {generatedSlots.morning.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Morning</p>
                              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {generatedSlots.morning.map(t => (
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
                          )}
                          
                          {generatedSlots.afternoon.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Afternoon</p>
                              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {generatedSlots.afternoon.map(t => (
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
                          )}
                          
                          {generatedSlots.evening.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Evening</p>
                              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {generatedSlots.evening.map(t => (
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
                          )}
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
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}

export default PatientHospitals
