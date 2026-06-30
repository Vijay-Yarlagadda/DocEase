import { useState, useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Users,
  Calendar,
  Settings,
  Activity,
  LayoutDashboard,
  ShieldCheck,
  UserPlus,
  ClipboardList,
  Menu,
  X,
  Moon,
  Sun,
  Bell,
} from 'lucide-react'
import { AuthContext } from '../../context/AuthContext'
import DocEaseLogo from '../DocEaseLogo'
import ProfileDropdown from '../ProfileDropdown'
import NotificationDropdown from './NotificationDropdown'

const rolePortal = {
  admin: { label: 'Admin', gradient: 'from-blue-900 to-blue-600' },
  doctor: { label: 'Doctor', gradient: 'from-cyan-600 to-cyan-400' },
  patient: { label: 'Patient', gradient: 'from-teal-600 to-teal-400' },
  superadmin: { label: 'Super Admin', gradient: 'from-fuchsia-700 to-pink-500' },
}

const DashboardNavbar = ({ darkMode, toggleDarkMode }) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useContext(AuthContext)

  const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Overview', to: '/admin/dashboard' },
    { icon: Building2, label: 'Hospitals', to: '/admin/hospitals' },
    { icon: UserPlus, label: 'Doctors', to: '/admin/doctors' },
    { icon: Calendar, label: 'Appointments', to: '/admin/appointments' },
    { icon: Users, label: 'Users', to: '/admin/users' },
    { icon: Activity, label: 'Analytics', to: '/admin/analytics' },
    { icon: Settings, label: 'Settings', to: '/admin/settings' },
  ]

  const doctorMenuItems = [
    { icon: LayoutDashboard, label: 'Overview', to: '/doctor/dashboard' },
    { icon: Users, label: 'Patients', to: '/doctor/patients' },
    { icon: Calendar, label: 'Appointments', to: '/doctor/appointments' },
    { icon: Calendar, label: 'Schedule', to: '/doctor/schedule' },
  ]

  const patientMenuItems = [
    { icon: LayoutDashboard, label: 'Overview', to: '/patient/dashboard' },
    { icon: Building2, label: 'Hospitals', to: '/patient/hospitals' },
    { icon: Calendar, label: 'Appointments', to: '/patient/appointments' },
    { icon: ClipboardList, label: 'Documents', to: '/patient/documents' },
  ]

  const superAdminMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/super-admin/dashboard' },
    { icon: ShieldCheck, label: 'Verification', to: '/super-admin/verification' },
    { icon: Building2, label: 'Hospitals', to: '/super-admin/hospitals' },
    { icon: Activity, label: 'Analytics', to: '/super-admin/analytics' },
    { icon: Settings, label: 'Settings', to: '/super-admin/settings' },
  ]

  let menuItems = []
  switch (user?.role) {
    case 'admin':
      menuItems = adminMenuItems
      break
    case 'doctor':
      menuItems = doctorMenuItems
      break
    case 'patient':
      menuItems = patientMenuItems
      break
    case 'superadmin':
      menuItems = superAdminMenuItems
      break
    default:
      menuItems = []
  }

  const portal = rolePortal[user?.role] || rolePortal.admin

  return (
    <header className="dashboard-topbar">
      <div className="flex items-center gap-6 lg:gap-10">
        <DocEaseLogo to={`/${user?.role || 'admin'}/dashboard`} />

        <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold text-white bg-gradient-to-r ${portal.gradient}`}>
          {portal.label}
        </span>

        <nav className="hidden lg:flex items-center gap-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'text-accent'
                    : 'text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="dashboard-nav-indicator"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="hidden sm:block">
          <NotificationDropdown />
        </div>

        <div className="hidden lg:block w-px h-6 bg-slate-700/60" />

        <ProfileDropdown variant="navbar" />

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden absolute top-[calc(100%+8px)] left-4 right-4 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl overflow-hidden transition-colors duration-300 origin-top"
          >
            <div className="px-4 py-4 space-y-1 bg-white/95 dark:bg-slate-900/95">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary/15 text-accent border border-primary/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </NavLink>
                )
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}

export default DashboardNavbar
