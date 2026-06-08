import { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  ShieldCheck,
  Building2,
  Activity,
  Settings,
  X,
  LogOut,
} from 'lucide-react'
import { AuthContext } from '../../context/AuthContext'
import { getDisplayName, getUserEmail } from '../../utils/userProfile'

const navItems = [
  { label: 'Dashboard', to: '/super-admin/dashboard', icon: LayoutDashboard },
  { label: 'Hospital Verification', to: '/super-admin/verification', icon: ShieldCheck },
  { label: 'Hospitals', to: '/super-admin/hospitals', icon: Building2 },
  { label: 'Analytics', to: '/super-admin/analytics', icon: Activity },
  { label: 'Settings', to: '/super-admin/settings', icon: Settings },
]

const SuperAdminSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useContext(AuthContext)
  const displayName = getDisplayName(user)
  const email = getUserEmail(user) || 'superadmin@docease.com'

  return (
    <>
      <aside className="hidden xl:flex xl:w-80 shrink-0 flex-col border-r border-slate-800/70 bg-slate-950/95 p-6">
        <div className="mb-10">
          <div className="inline-flex items-center gap-3 px-3 py-2 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-600 to-pink-500 text-white shadow-lg">
              SA
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Super Admin</p>
              <p className="text-xs text-slate-500">Secure verification control</p>
            </div>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-3xl transition-all text-sm font-medium ${
                  isActive
                    ? 'bg-slate-900 text-white border border-fuchsia-500/30 shadow-sm shadow-fuchsia-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/70'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-6 text-sm text-slate-500 border-t border-slate-800/60">
          <div className="mb-4 flex items-center gap-3 rounded-3xl bg-slate-900/80 p-4 border border-slate-800">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-600 to-pink-500 text-white text-sm font-semibold">
              {displayName.split(' ').map((part) => part[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{displayName}</p>
              <p className="text-xs text-slate-500 truncate">{email}</p>
            </div>
          </div>

          <p className="font-semibold text-slate-100">Secure Access</p>
          <p className="mt-2 leading-6">Only Super Admin users can approve, reject, and review hospital verifications.</p>
          <button
            onClick={() => logout()}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-fuchsia-500/30 bg-fuchsia-500/10 px-4 py-3 text-sm font-semibold text-fuchsia-200 hover:bg-fuchsia-500/15 transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-xl xl:hidden"
          >
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
              className="absolute left-0 top-0 bottom-0 w-80 bg-slate-950 border-r border-slate-800 p-6"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-lg font-semibold text-white">Super Admin</p>
                  <p className="text-xs text-slate-500">Hidden dashboard</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-2xl bg-slate-900 text-slate-300 hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="space-y-2">
                {navItems.map(({ label, to, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-3xl transition-all text-sm font-medium ${
                        isActive
                          ? 'bg-slate-900 text-white border border-fuchsia-500/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-900/70'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </NavLink>
                ))}
              </nav>
              <button
                onClick={() => {
                  onClose()
                  logout()
                }}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-fuchsia-500/30 bg-fuchsia-500/10 px-4 py-3 text-sm font-semibold text-fuchsia-200 hover:bg-fuchsia-500/15 transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default SuperAdminSidebar
