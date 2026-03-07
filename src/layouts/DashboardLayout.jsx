import { Outlet } from 'react-router-dom'
import { useContext } from 'react'
import { Mail, LogOut, Moon, Sun } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { AuthContext } from '../context/AuthContext'

const DashboardLayout = ({ darkMode, toggleDarkMode }) => {
  const { user, logout } = useContext(AuthContext)
  const getUserName = () => {
    if (user?.name) return user.name
    if (user?.user?.name) return user.user.name
    if (user?.email) return user.email.split('@')[0]
    return 'User'
  }
  const userName = getUserName()

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      {/* top bar inside dashboard */}
      <header className="ml-16 lg:ml-64 w-full bg-gradient-to-r from-primary to-secondary text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-lg font-semibold">
          Welcome{userName ? `, ${userName}` : ''}
        </h1>
        <div className="flex items-center space-x-4">
          {/* dark mode toggle in dashboard header */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-white/30 hover:bg-white/40"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-yellow-300" />
            ) : (
              <Moon className="w-5 h-5 text-gray-100" />
            )}
          </button>
          <Mail className="w-5 h-5" />
          <span className="text-sm truncate max-w-xs">
            {user?.email}
          </span>
          <button
            onClick={logout}
            className="flex items-center space-x-1 hover:underline"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="flex-1 ml-16 lg:ml-64 p-6 overflow-y-auto mt-4">
        <Outlet />
      </main>
    </div>
  )
}

export default DashboardLayout