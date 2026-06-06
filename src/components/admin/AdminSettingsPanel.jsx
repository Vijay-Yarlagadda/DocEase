import { useEffect, useState, useContext } from 'react'
import { motion } from 'framer-motion'
import { User, Shield, Bell, Globe, Eye, Lock, Save } from 'lucide-react'
import { AuthContext } from '../../context/AuthContext'
import { getHospitalProfile, updateHospitalProfile } from '../../services/adminService'
import { updateUserProfile, updateCurrentUserPassword } from '../../services/authService'
import { useToast } from '../Toast'
import { PanelSkeleton } from './SkeletonLoader'

const AdminSettingsPanel = () => {
  const { user, setUser } = useContext(AuthContext)
  const [profile, setProfile] = useState({ name: '', phone: '' })
  const [hospital, setHospital] = useState({ name: '', address: '', phone: '', email: '', website: '' })
  const [notifications, setNotifications] = useState({ emailUpdates: true, systemAlerts: true })
  const [security, setSecurity] = useState({ twoFactor: false })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingHospital, setSavingHospital] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const { showSuccess, showError } = useToast()

  const hospitalId = user?.hospitalId || user?.uid || 'default'

  useEffect(() => {
    if (!user) return

    getHospitalProfile(hospitalId)
      .then((hospitalProfile) => {
        setProfile({ name: user.name || '', phone: user.phone || '' })
        setHospital({
          name: hospitalProfile.name || '',
          address: hospitalProfile.address || '',
          phone: hospitalProfile.phone || '',
          email: hospitalProfile.email || '',
          website: hospitalProfile.website || '',
        })
      })
      .catch((err) => showError(err.message || 'Failed to load settings'))
      .finally(() => setLoading(false))
  }, [user, hospitalId, showError])

  const handleProfileChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value })
  const handleHospitalChange = (e) => setHospital({ ...hospital, [e.target.name]: e.target.value })
  const handlePasswordChange = (e) => setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value })

  const saveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const updated = await updateUserProfile(user, profile)
      setUser(updated)
      localStorage.setItem('docease_user', JSON.stringify(updated))
      showSuccess('Profile updated successfully')
    } catch (err) {
      showError(err.message || 'Failed to save profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const saveHospital = async (e) => {
    e.preventDefault()
    setSavingHospital(true)
    try {
      await updateHospitalProfile(hospitalId, hospital)
      showSuccess('Hospital information saved')
    } catch (err) {
      showError(err.message || 'Failed to save hospital details')
    } finally {
      setSavingHospital(false)
    }
  }

  const submitPassword = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showError('The new passwords do not match')
      return
    }
    setChangingPassword(true)
    try {
      await updateCurrentUserPassword(passwordForm.currentPassword, passwordForm.newPassword, user.email)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      showSuccess('Password updated successfully')
    } catch (err) {
      showError(err.message || 'Failed to update password')
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) return <PanelSkeleton rows={5} />

  return (
    <div className="space-y-6">
      <motion.form initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} onSubmit={saveProfile} className="dashboard-card">
        <div className="flex items-center gap-2 mb-5">
          <User className="w-5 h-5 text-accent" />
          <div>
            <p className="text-base font-semibold text-slate-900 dark:text-white">Admin Profile</p>
            <p className="text-xs text-slate-500">Update the admin contact information used across the dashboard.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Name</label>
            <input name="name" value={profile.name} onChange={handleProfileChange} className="dashboard-input" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Phone</label>
            <input name="phone" value={profile.phone} onChange={handleProfileChange} className="dashboard-input" />
          </div>
        </div>
        <div className="flex justify-end mt-5">
          <button type="submit" disabled={savingProfile} className="btn-primary inline-flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4" />
            {savingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </motion.form>

      <motion.form initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} onSubmit={saveHospital} className="dashboard-card">
        <div className="flex items-center gap-2 mb-5">
          <Globe className="w-5 h-5 text-accent" />
          <div>
            <p className="text-base font-semibold text-slate-900 dark:text-white">Hospital Information</p>
            <p className="text-xs text-slate-500">Edit the hospital profile associated with your admin account.</p>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Hospital Name</label>
            <input name="name" value={hospital.name} onChange={handleHospitalChange} className="dashboard-input" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Phone</label>
            <input name="phone" value={hospital.phone} onChange={handleHospitalChange} className="dashboard-input" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Email</label>
            <input name="email" value={hospital.email} onChange={handleHospitalChange} className="dashboard-input" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Website</label>
            <input name="website" value={hospital.website} onChange={handleHospitalChange} className="dashboard-input" />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-xs text-slate-400 mb-1.5">Address</label>
            <input name="address" value={hospital.address} onChange={handleHospitalChange} className="dashboard-input" />
          </div>
        </div>
        <div className="flex justify-end mt-5">
          <button type="submit" disabled={savingHospital} className="btn-primary inline-flex items-center gap-2 text-sm">
            <Save className="w-4 h-4" />
            {savingHospital ? 'Saving...' : 'Update Hospital'}
          </button>
        </div>
      </motion.form>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="dashboard-card">
        <div className="flex items-center gap-2 mb-5">
          <Bell className="w-5 h-5 text-accent" />
          <div>
            <p className="text-base font-semibold text-slate-900 dark:text-white">Notification Preferences</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manage alerts and system updates for your hospital team.</p>
          </div>
        </div>
        <div className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <label key={key} className="flex items-center justify-between rounded-2xl border border-slate-200/70 dark:border-slate-700/40 bg-white/90 dark:bg-slate-900/50 p-4">
              <div>
                <p className="text-sm text-slate-900 dark:text-white capitalize">{key.replace(/[A-Z]/g, ' $&')}</p>
                <p className="text-xs text-slate-500">{key === 'emailUpdates' ? 'Receive email updates and announcements.' : 'System alerts for new activity and appointments.'}</p>
              </div>
              <input
                type="checkbox"
                checked={value}
                onChange={() => setNotifications({ ...notifications, [key]: !value })}
                className="h-4 w-4 text-accent rounded bg-white border border-slate-300 dark:bg-slate-800 dark:border-slate-700"
              />
            </label>
          ))}
        </div>
      </motion.div>

      <motion.form initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} onSubmit={submitPassword} className="dashboard-card">
        <div className="flex items-center gap-2 mb-5">
          <Lock className="w-5 h-5 text-accent" />
          <div>
            <p className="text-base font-semibold text-slate-900 dark:text-white">Security Settings</p>
            <p className="text-xs text-slate-500">Change your password and keep your admin account secure.</p>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <label className="block text-xs text-slate-400 mb-1.5">Current Password</label>
            <input name="currentPassword" type="password" value={passwordForm.currentPassword} onChange={handlePasswordChange} className="dashboard-input" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">New Password</label>
            <input name="newPassword" type="password" value={passwordForm.newPassword} onChange={handlePasswordChange} className="dashboard-input" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Confirm Password</label>
            <input name="confirmPassword" type="password" value={passwordForm.confirmPassword} onChange={handlePasswordChange} className="dashboard-input" />
          </div>
        </div>
        <div className="flex justify-end mt-5">
          <button type="submit" disabled={changingPassword} className="btn-primary inline-flex items-center gap-2 text-sm">
            <Eye className="w-4 h-4" />
            {changingPassword ? 'Updating...' : 'Change Password'}
          </button>
        </div>
      </motion.form>
    </div>
  )
}

export default AdminSettingsPanel
