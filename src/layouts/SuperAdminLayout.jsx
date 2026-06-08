import { useState, useContext } from 'react'
import { Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, Moon, Sun } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import DocEaseLogo from '../components/DocEaseLogo'
import SuperAdminSidebar from '../components/superadmin/SuperAdminSidebar'
import ProfileDropdown from '../components/ProfileDropdown'
import { getDisplayName, getUserEmail } from '../utils/userProfile'

const SuperAdminLayout = ({ darkMode, toggleDarkMode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useContext(AuthContext)
  const displayName = getDisplayName(user)
  const email = getUserEmail(user) || 'superadmin@docease.com'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="xl:flex xl:min-h-screen">
        <SuperAdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col">
          <div className="sticky top-0 z-20 border-b border-slate-800/70 bg-slate-950/95 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3 px-4 py-3 xl:px-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="xl:hidden flex items-center justify-center w-11 h-11 rounded-2xl border border-slate-800/80 bg-slate-900/80 text-slate-200 hover:bg-slate-800 transition"
                  aria-label="Open navigation"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <DocEaseLogo to="/super-admin/dashboard" collapsed />
                <div className="hidden sm:block text-sm text-slate-400">
                  Super Admin Workspace
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleDarkMode}
                  className="flex items-center justify-center w-11 h-11 rounded-2xl border border-slate-800/80 bg-slate-900/80 text-slate-200 hover:bg-slate-800 transition"
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <div className="hidden md:flex flex-col text-right text-xs text-slate-500">
                  <span className="font-semibold text-slate-100">{displayName}</span>
                  <span>{email}</span>
                </div>

                <ProfileDropdown />
              </div>
            </div>
          </div>

          <main className="flex-1 px-4 py-6 xl:px-8 xl:py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={window.location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  )
}

export default SuperAdminLayout
