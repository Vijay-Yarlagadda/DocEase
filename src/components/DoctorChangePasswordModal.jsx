import { useState } from 'react'
import { doctorChangePassword } from '../services/authService'
import { useToast } from './Toast'

const DoctorChangePasswordModal = ({ isOpen, onClose, email, doctorName, tempPassword }) => {
  const { showSuccess, showError } = useToast()
  const [currentPassword, setCurrentPassword] = useState(tempPassword || '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

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
      await doctorChangePassword(currentPassword, newPassword, email)
      showSuccess('Password changed successfully')
      onClose && onClose()
    } catch (err) {
      showError(err.message || 'Unable to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow w-full max-w-md">
        <h3 className="text-lg font-semibold mb-3">Change Temporary Password</h3>
        {doctorName && <p className="text-sm mb-2">{doctorName} — {email}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} type="password" placeholder="Current temporary password" className="input" />
          <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" placeholder="New password" className="input" />
          <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" placeholder="Confirm new password" className="input" />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DoctorChangePasswordModal
