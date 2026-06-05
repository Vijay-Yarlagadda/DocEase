import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Mail, Phone, Save } from 'lucide-react'
import { getDisplayName, getUserEmail, getRoleStyle } from '../utils/userProfile'

const EditProfileModal = ({ isOpen, onClose, user, onSave, saving = false }) => {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const roleStyle = getRoleStyle(user?.role)

  useEffect(() => {
    if (isOpen && user) {
      setName(getDisplayName(user))
      setPhone(user?.phone || '')
    }
  }, [isOpen, user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return
    await onSave({ name: trimmedName, phone: phone.trim() })
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`h-1.5 bg-gradient-to-r ${roleStyle.gradient}`} />

            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
              <div>
                <h2 className="text-lg font-semibold text-white">Edit Profile</h2>
                <p className="text-xs text-slate-500 mt-0.5">Update your Firestore profile details</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label htmlFor="profile-name" className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="profile-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    disabled={saving}
                    className="dashboard-input pl-10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="profile-email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="profile-email"
                    type="email"
                    value={getUserEmail(user)}
                    disabled
                    className="dashboard-input pl-10 opacity-60 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1.5">Email is managed by your account and cannot be changed here</p>
              </div>

              <div>
                <label htmlFor="profile-phone" className="block text-sm font-medium text-slate-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="profile-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 234 567 8900"
                    disabled={saving}
                    className="dashboard-input pl-10"
                  />
                </div>
              </div>

              {user?.role === 'doctor' && (
                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/40 text-xs text-slate-500">
                  Specialization and qualification are managed by your hospital admin.
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 border border-slate-700/50 hover:bg-slate-700/50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 btn-primary text-sm py-2.5 inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default EditProfileModal
