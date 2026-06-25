import { useState, useEffect, useContext } from 'react'
import { motion } from 'framer-motion'
import { Calendar as CalendarIcon, Clock, XCircle, CheckCircle, AlertCircle, Trash2, Settings } from 'lucide-react'
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader'
import { getDoctorLeaves, addLeave, deleteLeave } from '../../services/leaveService'
import { updateUserProfile } from '../../services/authService'
import { AuthContext } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'

const DoctorSchedule = () => {
  const { user, refreshUserProfile } = useContext(AuthContext)
  const { showSuccess, showError } = useToast()
  
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [leaveDate, setLeaveDate] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Settings State
  const [slotDuration, setSlotDuration] = useState(user?.appointmentSettings?.slotDuration || 30)
  const [startTime, setStartTime] = useState(user?.appointmentSettings?.startTime || '09:00')
  const [endTime, setEndTime] = useState(user?.appointmentSettings?.endTime || '17:00')
  const [workingDays, setWorkingDays] = useState(user?.appointmentSettings?.workingDays || [1, 2, 3, 4, 5])
  const [breakStart, setBreakStart] = useState(user?.appointmentSettings?.breakStart || '13:00')
  const [breakEnd, setBreakEnd] = useState(user?.appointmentSettings?.breakEnd || '14:00')
  const [savingSettings, setSavingSettings] = useState(false)

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    setSavingSettings(true)
    try {
      const updates = {
        appointmentSettings: {
          slotDuration: parseInt(slotDuration),
          startTime,
          endTime,
          workingDays,
          breakStart,
          breakEnd
        }
      }
      await updateUserProfile(user, updates)
      if (refreshUserProfile) await refreshUserProfile()
      showSuccess('Appointment settings saved!')
    } catch (err) {
      showError('Failed to save settings')
    } finally {
      setSavingSettings(false)
    }
  }

  const toggleWorkingDay = (dayIndex) => {
    if (workingDays.includes(dayIndex)) {
      setWorkingDays(workingDays.filter(d => d !== dayIndex))
    } else {
      setWorkingDays([...workingDays, dayIndex].sort())
    }
  }

  // Calculate minimum allowed leave date (3 days from now)
  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 3)
  const minDateStr = minDate.toISOString().split('T')[0]

  const fetchLeaves = async () => {
    try {
      const data = await getDoctorLeaves(user.uid)
      // Sort upcoming leaves first
      data.sort((a, b) => new Date(a.date) - new Date(b.date))
      setLeaves(data)
    } catch (err) {
      showError('Failed to load leaves')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.uid) {
      fetchLeaves()
    }
  }, [user?.uid])

  const handleAddLeave = async (e) => {
    e.preventDefault()
    if (!leaveDate) return
    
    // Check if a leave for this date already exists
    if (leaves.some(l => l.date === leaveDate)) {
      showError('You already have a leave scheduled for this date')
      return
    }

    setSubmitting(true)
    try {
      await addLeave(user.uid, leaveDate, reason || 'Personal Leave')
      showSuccess('Leave scheduled successfully')
      setLeaveDate('')
      setReason('')
      await fetchLeaves()
    } catch (err) {
      showError(err.message || 'Failed to schedule leave')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteLeave = async (leaveId) => {
    const confirmed = window.confirm('Are you sure you want to cancel this leave?')
    if (!confirmed) return
    
    try {
      await deleteLeave(leaveId)
      showSuccess('Leave cancelled successfully')
      await fetchLeaves()
    } catch (err) {
      showError('Failed to cancel leave')
    }
  }

  const upcomingLeaves = leaves.filter(l => new Date(l.date) >= new Date(new Date().setHours(0,0,0,0)))
  const pastLeaves = leaves.filter(l => new Date(l.date) < new Date(new Date().setHours(0,0,0,0)))

  return (
    <div className="grid lg:grid-cols-12 gap-8 lg:items-start max-w-7xl mx-auto">
      {/* Left Column: Sticky Sidebar */}
      <div className="lg:col-span-4 sticky top-24 flex flex-col gap-6">
        
        {/* Premium Sidebar Header */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-900 dark:via-slate-800 dark:to-slate-950 p-8 shadow-2xl border border-slate-700/50"
        >
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-teal-500/20 blur-3xl rounded-full pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 bg-cyan-500/20 blur-3xl rounded-full pointer-events-none"></div>
          
          <div className="relative z-10">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-teal-900 bg-teal-400 mb-6 shadow-[0_0_15px_rgba(45,212,191,0.5)]">
              Doctor Portal
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight leading-tight">
              Schedule &<br/>Leaves
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed opacity-90">
              Manage your availability, set working hours, and request time off seamlessly.
            </p>
          </div>
        </motion.div>

        {/* Schedule Leave Form Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/50 dark:border-slate-700/50 rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/20"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/30 text-white">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Schedule Leave</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Plan your days off</p>
            </div>
          </div>
            
          <div className="bg-amber-50/80 dark:bg-amber-500/10 backdrop-blur-sm p-4 rounded-2xl border border-amber-200/50 dark:border-amber-500/20 mb-8 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
              Leaves must be scheduled at least <strong className="font-bold">3 days in advance</strong> to allow patients time to reschedule.
            </p>
          </div>

          <form onSubmit={handleAddLeave} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                Select Date
              </label>
              <input 
                type="date" 
                required
                min={minDateStr}
                value={leaveDate}
                onChange={e => setLeaveDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                Reason <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input 
                type="text" 
                placeholder="e.g. Personal Time Off"
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all outline-none placeholder:text-slate-400"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={submitting}
              className="w-full mt-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Scheduling...
                </>
              ) : 'Confirm Leave'}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Right Column: Settings & Leaves List */}
      <div className="lg:col-span-8 space-y-8">
        
        {/* Appointment Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/50 dark:border-slate-700/50 rounded-[2rem] p-6 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-black/20"
        >
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Appointment Settings</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Configure your daily working hours and slots</p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  Slot Duration
                </label>
                <div className="relative">
                  <select 
                    value={slotDuration} 
                    onChange={e => setSlotDuration(e.target.value)}
                    className="w-full appearance-none bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none pr-10"
                  >
                    <option value="10">10 Minutes</option>
                    <option value="15">15 Minutes</option>
                    <option value="20">20 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="45">45 Minutes</option>
                    <option value="60">60 Minutes</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  Working Days
                </label>
                <div className="flex gap-2 p-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-x-auto">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleWorkingDay(idx)}
                      className={`flex-1 min-w-[2.5rem] h-10 rounded-lg text-sm font-bold transition-all ${
                        workingDays.includes(idx) 
                          ? 'bg-gradient-to-b from-indigo-500 to-blue-600 text-white shadow-md shadow-indigo-500/30 scale-105' 
                          : 'bg-transparent text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 hover:scale-105'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  Daily Start Time
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required 
                    className="w-full pl-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  Daily End Time
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required 
                    className="w-full pl-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  Break Start <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <input type="time" value={breakStart} onChange={e => setBreakStart(e.target.value)} 
                    className="w-full pl-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  Break End <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <input type="time" value={breakEnd} onChange={e => setBreakEnd(e.target.value)} 
                    className="w-full pl-11 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none" 
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700/50 flex justify-end">
              <button 
                type="submit" 
                disabled={savingSettings} 
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-bold py-3 px-8 rounded-xl shadow-lg shadow-slate-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center gap-2"
              >
                {savingSettings ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : 'Save Settings'}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Upcoming Leaves */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/50 dark:border-slate-700/50 rounded-[2rem] p-6 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-black/20"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
            <span className="w-2 h-8 rounded-full bg-teal-500"></span>
            Upcoming Leaves
          </h2>
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => <div key={i} className="h-24 animate-pulse bg-slate-100 dark:bg-slate-800/50 rounded-2xl" />)}
            </div>
          ) : upcomingLeaves.length === 0 ? (
            <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700/50">
              <div className="w-20 h-20 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-lg font-medium text-slate-600 dark:text-slate-300">You have no upcoming leaves scheduled.</p>
              <p className="text-sm text-slate-500 mt-1">Patients can book appointments on all your working days.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {upcomingLeaves.map(leave => (
                <div key={leave.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl hover:shadow-lg hover:border-teal-200 dark:hover:border-teal-900/50 transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl flex flex-col items-center justify-center shrink-0">
                      <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                        {new Date(leave.date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-xl font-black leading-none">
                        {new Date(leave.date).getDate()}
                      </span>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {new Date(leave.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        {leave.reason || 'Personal Leave'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteLeave(leave.id)}
                    className="mt-4 sm:mt-0 px-4 py-2 text-sm font-medium text-rose-500 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 dark:hover:text-white rounded-lg transition-all flex items-center justify-center gap-2 sm:opacity-0 sm:group-hover:opacity-100"
                    title="Cancel Leave"
                  >
                    <Trash2 className="w-4 h-4" />
                    Cancel Leave
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
        
        {pastLeaves.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="px-4"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 opacity-70">Past Leaves History</h3>
            <div className="grid gap-3 opacity-60">
              {pastLeaves.map(leave => (
                <div key={leave.id} className="flex items-center gap-4 p-4 bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-700/50 rounded-xl">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-lg">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">{leave.date}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{leave.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default DoctorSchedule
