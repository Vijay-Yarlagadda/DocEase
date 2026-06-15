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
    <div>
      <DashboardPageHeader
        role="doctor"
        title="Schedule & Leaves"
        subtitle="Manage your availability and upcoming days off"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="dashboard-card sticky top-24">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-teal-500" />
              Schedule Leave
            </h2>
            
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800/50 mb-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Leaves must be scheduled at least <strong>3 days in advance</strong> to allow patients time to reschedule.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddLeave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Date
                </label>
                <input 
                  type="date" 
                  required
                  min={minDateStr}
                  value={leaveDate}
                  onChange={e => setLeaveDate(e.target.value)}
                  className="dashboard-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Reason (Optional)
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Personal Time Off"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="dashboard-input"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={submitting}
                className="btn-primary w-full justify-center mt-2"
              >
                {submitting ? 'Scheduling...' : 'Confirm Leave'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="dashboard-card">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-teal-500" />
              Appointment Settings
            </h2>
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Slot Duration (Minutes)
                  </label>
                  <select 
                    value={slotDuration} 
                    onChange={e => setSlotDuration(e.target.value)}
                    className="dashboard-input bg-white dark:bg-slate-800"
                  >
                    <option value="10">10 mins</option>
                    <option value="15">15 mins</option>
                    <option value="20">20 mins</option>
                    <option value="30">30 mins</option>
                    <option value="45">45 mins</option>
                    <option value="60">60 mins</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Working Days
                  </label>
                  <div className="flex gap-1">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleWorkingDay(idx)}
                        className={`w-8 h-8 rounded-full text-xs font-semibold transition-colors ${workingDays.includes(idx) ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'}`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Daily Start Time
                  </label>
                  <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="dashboard-input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Daily End Time
                  </label>
                  <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="dashboard-input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Break Start (Optional)
                  </label>
                  <input type="time" value={breakStart} onChange={e => setBreakStart(e.target.value)} className="dashboard-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Break End (Optional)
                  </label>
                  <input type="time" value={breakEnd} onChange={e => setBreakEnd(e.target.value)} className="dashboard-input" />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={savingSettings} className="btn-primary">
                  {savingSettings ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>

          <div className="dashboard-card">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Upcoming Leaves</h2>
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map(i => <div key={i} className="h-20 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl" />)}
              </div>
            ) : upcomingLeaves.length === 0 ? (
              <div className="text-center p-8 bg-slate-50 dark:bg-slate-900/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <CheckCircle className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-500">You have no upcoming leaves scheduled.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {upcomingLeaves.map(leave => (
                  <div key={leave.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-lg">
                        <CalendarIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{leave.date}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{leave.reason}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteLeave(leave.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                      title="Cancel Leave"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {pastLeaves.length > 0 && (
            <div className="dashboard-card">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Past Leaves</h2>
              <div className="grid gap-3 opacity-60">
                {pastLeaves.map(leave => (
                  <div key={leave.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-xl">
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DoctorSchedule
