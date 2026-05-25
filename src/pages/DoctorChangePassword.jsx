import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { doctorChangePassword } from '../services/authService'
import { useToast } from '../components/Toast'

const DoctorChangePassword = () => {
  const loc = useLocation()
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()

  const initialEmail = loc.state?.email || ''
  const tempPassword = loc.state?.tempPassword || ''
  const doctorName = loc.state?.doctorName || ''

  const [currentPassword, setCurrentPassword] = useState(tempPassword)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showError('All fields are required')
      return false
    }
    if (newPassword.length < 8) {
      showError('New password must be at least 8 characters')
      return false
    }
    if (newPassword !== confirmPassword) {
      showError('Passwords do not match')
      return false
    }
    if (newPassword === currentPassword) {
      showError('New password must be different from temporary password')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await doctorChangePassword(currentPassword, newPassword, initialEmail)
      showSuccess('Password changed successfully — redirecting to dashboard')
      setTimeout(() => navigate('/doctor/dashboard'), 1200)
    } catch (err) {
      showError(err.message || 'Unable to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-20 min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Change Temporary Password</h2>
        {doctorName && <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Hello, {doctorName}</p>}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Enter your temporary password and choose a new secure password.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input value={initialEmail} readOnly className="w-full p-2 rounded border bg-gray-50 dark:bg-gray-700" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Current (temporary) password</label>
            <input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} type="password" required className="w-full p-2 rounded border bg-gray-50 dark:bg-gray-700" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">New password</label>
            <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" required className="w-full p-2 rounded border bg-gray-50 dark:bg-gray-700" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Confirm new password</label>
            <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" required className="w-full p-2 rounded border bg-gray-50 dark:bg-gray-700" />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DoctorChangePassword
