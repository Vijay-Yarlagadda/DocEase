import { useState, useContext, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthContext } from '../../context/AuthContext'
import { updateUserProfile } from '../../services/authService'
import { useToast } from '../../components/Toast'
import { User, MapPin, Phone, Calendar } from 'lucide-react'

const ProfileCompletionModal = () => {
  const { user, setUser } = useContext(AuthContext)
  const { showSuccess, showError } = useToast()
  
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    age: '',
    place: '',
    phone: ''
  })

  useEffect(() => {
    // Only show for patients who are missing required fields
    if (user && user.role === 'patient') {
      const isMissingDetails = !user.age || !user.place || !user.phone
      setIsOpen(isMissingDetails)
      
      // Pre-fill whatever might already exist
      setFormData({
        age: user.age || '',
        place: user.place || '',
        phone: user.phone || ''
      })
    } else {
      setIsOpen(false)
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.age || !formData.place || !formData.phone) {
      showError('Please fill out all fields')
      return
    }

    setLoading(true)
    try {
      const updatedUser = await updateUserProfile(user, {
        age: Number(formData.age),
        place: formData.place,
        phone: formData.phone
      })
      // Update local context
      setUser(updatedUser)
      // Save to localStorage so persistence isn't broken
      localStorage.setItem('docease_user', JSON.stringify(updatedUser))
      
      showSuccess('Profile completed successfully!')
      setIsOpen(false)
    } catch (err) {
      showError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative"
          >
            {/* Header */}
            <div className="bg-teal-500 p-6 text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Complete Your Profile</h2>
              <p className="text-teal-50">Please provide a few more details to continue using DocEase.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-teal-500" /> Age
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="e.g. 25"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-teal-500" /> Location / Place
                </label>
                <input
                  type="text"
                  required
                  value={formData.place}
                  onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                  placeholder="e.g. Mumbai, India"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-teal-500" /> Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 outline-none transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-teal-500/25 flex justify-center disabled:opacity-70"
                >
                  {loading ? 'Saving...' : 'Save & Continue'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default ProfileCompletionModal
