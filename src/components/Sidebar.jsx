import { useContext, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Menu,
  Building2,
  Users,
  Calendar,
  Settings,
  Activity,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  UserPlus,
  ClipboardList,
} from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import ProfileDropdown from './ProfileDropdown'

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false)
  const { user } = useContext(AuthContext)

  const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Overview', to: '/admin/dashboard' },
    { icon: Building2, label: 'Hospitals', to: '/admin/hospitals' },
    { icon: UserPlus, label: 'Add Doctor', to: '/admin/add-doctor' },
    { icon: Users, label: 'Users', to: '/admin/users' },
    { icon: Activity, label: 'Analytics', to: '/admin/analytics' },
    { icon: Settings, label: 'Settings', to: '/admin/settings' },
  ]

  const doctorMenuItems = [
    { icon: LayoutDashboard, label: 'Overview', to: '/doctor/dashboard' },
    { icon: Users, label: 'Patients', to: '/doctor/patients' },
    { icon: Calendar, label: 'Appointments', to: '/doctor/appointments' },
    { icon: ClipboardList, label: 'Records', to: '/doctor/records' },
    { icon: Settings, label: 'Settings', to: '/doctor/settings' },
  ]

  const patientMenuItems = [
    { icon: LayoutDashboard, label: 'Overview', to: '/patient/dashboard' },
    { icon: Calendar, label: 'Appointments', to: '/patient/appointments' },
    { icon: ClipboardList, label: 'Medical History', to: '/patient/history' },
    { icon: Settings, label: 'Settings', to: '/patient/settings' },
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
    default:
      menuItems = []
  }

  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-64'
      } bg-white dark:bg-gray-800 h-screen fixed left-0 top-0 transition-all duration-300 border-r border-gray-200 dark:border-gray-700 z-40`}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between h-16 px-4">
        {!collapsed && (
          <span className="text-xl font-semibold text-primary dark:text-accent">
            DocEase
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Menu className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="px-2 py-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary dark:bg-accent/10 dark:text-accent'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`
            }
          >
            <item.icon className={`w-5 h-5 ${collapsed ? 'mx-auto' : ''}`} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Profile Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <ProfileDropdown />
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  )
}

export default Sidebar