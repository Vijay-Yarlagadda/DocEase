import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useContext } from 'react'
import { Mail, LogOut, Moon, Sun, User } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { AuthContext } from '../context/AuthContext'

const DashboardLayout = ({ darkMode, toggleDarkMode }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { user, logout } = useContext(AuthContext)

  const getUserName = () => {
    if (user?.name) return user.name
    if (user?.user?.name) return user.user.name
    if (user?.email) return user.email.split('@')[0]
    return 'User'
  }

  const userName = getUserName()
  const sidebarOffset = sidebarCollapsed ? 'left-16' : 'left-64'

  return (
    <div className="dashboard-layout">
      <div className="dashboard-glow dashboard-glow--left" aria-hidden="true" />
      <div className="dashboard-glow dashboard-glow--right" aria-hidden="true" />

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
      />

      <header className={`dashboard-topbar ${sidebarOffset}`}>
        <div>
          <p className="text-xs text-slate-500">Welcome back</p>
          <h1 className="text-sm md:text-base font-semibold text-white">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {userName}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/50 hover:bg-slate-700 text-slate-300 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-yellow-400" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          <button
            className="hidden sm:flex p-2 rounded-lg bg-slate-800/80 border border-slate-700/50 hover:bg-slate-700 text-slate-300 transition-colors"
            aria-label="Notifications"
          >
            <Mail className="w-4 h-4" />
          </button>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50">
            <User className="w-4 h-4 text-accent" />
            <span className="text-sm text-slate-300 truncate max-w-[180px]">
              {user?.email}
            </span>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700/50 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden lg:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className={`dashboard-main ${sidebarOffset}`}>
        <div className="dashboard-main-inner">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
