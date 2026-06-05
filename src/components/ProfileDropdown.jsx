import { useState, useContext, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, LogOut, ChevronDown } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'

const ProfileDropdown = ({ variant = 'sidebar' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useContext(AuthContext)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    setIsOpen(false)
    logout()
  }

  const initials = (user?.name || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  if (variant === 'navbar') {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-800/60 transition-colors"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary text-xs font-bold text-white">
            {initials}
          </span>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-slate-200 leading-tight">
              {user?.name || 'Profile'}
            </p>
            <p className="text-[11px] text-slate-500 capitalize leading-tight">
              {user?.role}
            </p>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-56 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl shadow-black/40 py-1 z-50"
            >
              <div className="px-4 py-3 border-b border-slate-700/50">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-700/50 flex items-center gap-2.5 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-slate-700/50 flex items-center gap-2.5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800/80 transition-colors"
      >
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary text-xs font-bold text-white flex-shrink-0">
          {initials}
        </span>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium text-slate-200 truncate">{user?.name || 'Profile'}</p>
          <p className="text-xs text-slate-500 capitalize truncate">{user?.role}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 left-0 right-0 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-xl py-1 z-50"
          >
            <div className="px-4 py-2.5 border-b border-slate-700/50">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700/50 flex items-center gap-2 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-slate-700/50 flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProfileDropdown
