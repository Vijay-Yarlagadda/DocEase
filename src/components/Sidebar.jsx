import { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import {
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
import DocEaseLogo from './DocEaseLogo'
import ProfileDropdown from './ProfileDropdown'

const rolePortal = {
  admin: { label: 'Admin Portal', gradient: 'from-blue-900 to-blue-600' },
  doctor: { label: 'Doctor Portal', gradient: 'from-cyan-600 to-cyan-400' },
  patient: { label: 'Patient Portal', gradient: 'from-teal-600 to-teal-400' },
}

const Sidebar = ({ collapsed, onToggle }) => {
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

  const portal = rolePortal[user?.role] || rolePortal.admin

  return (
    <aside className={`dashboard-sidebar ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className={`flex items-center h-16 px-3 border-b border-slate-700/40 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <DocEaseLogo collapsed={collapsed} to={`/${user?.role || 'admin'}/dashboard`} />
        {!collapsed && (
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {!collapsed && (
        <div className="px-4 py-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold text-white bg-gradient-to-r ${portal.gradient}`}>
            {portal.label}
          </span>
        </div>
      )}

      <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `dashboard-nav-link ${isActive ? 'dashboard-nav-link--active' : ''} ${collapsed ? 'justify-center' : ''}`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-700/40">
        <ProfileDropdown collapsed={collapsed} />
      </div>

      {collapsed && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 bg-slate-800 border border-slate-700 rounded-full p-1.5 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </aside>
  )
}

export default Sidebar
