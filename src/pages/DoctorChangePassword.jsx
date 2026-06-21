import { useState, useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Shield, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { doctorChangePassword } from '../services/authService'
import { auth } from '../services/firebase'
import { AuthContext } from '../context/AuthContext'
import { useToast } from '../components/Toast'

const DoctorChangePassword = () => {
  const loc = useLocation()
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const { setUser } = useContext(AuthContext)

  const initialEmail = loc.state?.email || ''
  const tempPassword = loc.state?.tempPassword || ''
  const doctorName = loc.state?.doctorName || ''

  const [currentPassword, setCurrentPassword] = useState(loc.state?.tempPassword || '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!initialEmail) {
    return (
      <div className="auth-page min-h-screen flex items-center justify-center px-4">
        <div className="auth-card rounded-2xl p-8 text-center max-w-md">
          <p className="text-slate-300 mb-4">Session expired. Please log in again.</p>
          <button onClick={() => navigate('/login')} className="auth-btn">Go to Login</button>
        </div>
      </div>
    )
  }

  const validate = () => {
    if (!currentPassword || !newPassword || !confirmPassword) { showError('All fields are required'); return false }
    if (newPassword.length < 8) { showError('New password must be at least 8 characters'); return false }
    if (newPassword !== confirmPassword) { showError('Passwords do not match'); return false }
    if (newPassword === currentPassword) { showError('New password must differ from the current password'); return false }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const result = await doctorChangePassword(currentPassword, newPassword, initialEmail)

      const idToken = await auth.currentUser?.getIdToken()
      if (idToken) localStorage.setItem('docease_token', idToken)

      const updatedUser = {
        ...result,
        name: doctorName,
        role: 'doctor',
        mustChangePassword: false,
      }
      setUser(updatedUser)
      localStorage.setItem('docease_user', JSON.stringify(updatedUser))
      localStorage.setItem(`pwd_changed_${result.uid}`, 'true')

      showSuccess('Password updated successfully!')
      setTimeout(() => navigate('/doctor/dashboard'), 800)
    } catch (err) {
      showError(err.message || 'Unable to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page min-h-screen flex items-center justify-center px-4 py-24">
      <div className="auth-page-glow auth-page-glow--left" aria-hidden="true" />
      <div className="auth-page-glow auth-page-glow--right" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-600 to-cyan-400 mb-4 shadow-lg shadow-cyan-500/20">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Set Your New Password</h1>
          {doctorName && <p className="text-slate-400 text-sm">Welcome, <span className="text-cyan-400">{doctorName}</span></p>}
          <p className="text-slate-500 text-xs mt-2">For security, you must change your temporary password before continuing.</p>
        </div>

        <div className="auth-card rounded-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input value={initialEmail} readOnly className="dashboard-input opacity-60 cursor-not-allowed" />
            </div>

            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-300 mb-2">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className="dashboard-input pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowCurrent((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  className="dashboard-input pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowNew((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className="dashboard-input pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowConfirm((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="auth-btn">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  Update Password & Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default DoctorChangePassword
