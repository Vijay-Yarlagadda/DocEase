import { useState, useContext, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { User, UserCog, UserPlus, LogOut } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import { updateUserProfile } from '../services/authService'
import { useToast } from './Toast'
import EditProfileModal from './EditProfileModal'
import ViewProfileModal from './ViewProfileModal'
import {
  getDisplayName,
  getUserEmail,
  getInitials,
  getRoleStyle,
} from '../utils/userProfile'

const MenuButton = ({ icon: Icon, label, onClick, danger = false }) => (
  <button
    onClick={onClick}
    className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2.5 transition-colors ${
      danger
        ? 'text-red-400 hover:bg-red-500/10'
        : 'text-slate-300 hover:bg-slate-700/40'
    }`}
  >
    <Icon className={`w-4 h-4 ${danger ? '' : 'text-accent'}`} />
    <span>{label}</span>
  </button>
)

const ProfileDropdown = ({ variant = 'navbar' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const { user, logout, setUser, refreshUserProfile } = useContext(AuthContext)
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

  const displayName = getDisplayName(user)
  const email = getUserEmail(user)
  const initials = getInitials(user)
  const roleStyle = getRoleStyle(user?.role)
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    if (user?.uid || user?.email || user?.mail) {
      refreshUserProfile?.(user)
    }
  }, [user?.uid])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const closeMenu = () => setIsOpen(false)

  const handleViewProfile = () => {
    closeMenu()
    setShowViewModal(true)
  }

  const handleEditProfile = () => {
    closeMenu()
    setShowEditModal(true)
  }

  const handleAddDoctor = () => {
    closeMenu()
    navigate('/admin/add-doctor')
  }

  const handleLogout = () => {
    closeMenu()
    logout()
  }

  const handleSaveProfile = async (updates) => {
    setSaving(true)
    try {
      const updated = await updateUserProfile(user, updates)
      setUser(updated)
      localStorage.setItem('docease_user', JSON.stringify(updated))
      showSuccess('Profile updated successfully')
    } catch (err) {
      showError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center rounded-full bg-gradient-to-br ${roleStyle.gradient} text-xs font-bold text-white ring-2 ${roleStyle.ring} hover:scale-105 transition-transform duration-200 ${
            variant === 'navbar' ? 'w-9 h-9' : 'w-10 h-10'
          }`}
          aria-label="Open profile menu"
        >
          {initials}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className={`absolute bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 w-64 ${
                variant === 'navbar' ? 'right-0 top-full mt-2' : 'bottom-full mb-2 right-0'
              }`}
            >
              <div className="px-4 py-4 border-b border-slate-700/50">
                <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                <p className="text-xs text-slate-400 truncate mt-0.5">{email || 'No email'}</p>
                <span className={`inline-flex mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${roleStyle.badge}`}>
                  {roleStyle.label}
                </span>
              </div>

              <div className="py-1">
                <MenuButton icon={User} label="View Profile" onClick={handleViewProfile} />
                <MenuButton icon={UserCog} label="Edit Profile" onClick={handleEditProfile} />
                {isAdmin && (
                  <MenuButton icon={UserPlus} label="Add Doctors" onClick={handleAddDoctor} />
                )}
                <div className="my-1 border-t border-slate-700/50" />
                <MenuButton icon={LogOut} label="Logout" onClick={handleLogout} danger />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ViewProfileModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        user={user}
      />

      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={user}
        onSave={handleSaveProfile}
        saving={saving}
      />
    </>
  )
}

export default ProfileDropdown
