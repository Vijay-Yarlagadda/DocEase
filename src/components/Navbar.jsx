import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Moon, Sun, Stethoscope, User, LogOut, Mail } from 'lucide-react'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

const Navbar = ({ darkMode, toggleDarkMode, user }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useContext(AuthContext)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ]

  // always show regular links (navbar only renders on public pages)
  const showLinks = true
  const isDashboard = location.pathname.startsWith('/admin') || 
                      location.pathname.startsWith('/doctor') || 
                      location.pathname.startsWith('/patient')

  const handleLogout = () => {
    logout()
    // ensure redirect to login in case AuthContext doesn't
    navigate('/login')
  }

  // Get user name from user object, fallback to email local part
  const getUserName = () => {
    if (user?.name) return user.name
    if (user?.user?.name) return user.user.name
    if (user?.email) return user.email.split('@')[0]
    return 'User'
  }

  const userName = getUserName()
  // Determine whether to show the user on this public navbar
  // Hide user on common public/auth routes to avoid brief flashes during login/signup
  const hiddenPaths = ['/', '/login', '/signin', '/signup', '/doctor/change-password']
  const showUser = Boolean(
    user && !hiddenPaths.includes(location.pathname)
  )

  const getUserRole = () => {
    if (!user) return null
    if (user.role) return user.role
    if (user.user && user.user.role) return user.user.role
    return null
  }

  const getDashboardPath = (role) => {
    switch ((role || '').toLowerCase()) {
      case 'admin':
        return '/admin/dashboard'
      case 'doctor':
        return '/doctor/dashboard'
      case 'patient':
      default:
        return '/patient/dashboard'
    }
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-indigo-500/20 shadow-lg'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo - Left */}
          <Link to="/" className="flex items-center space-x-2 group flex-shrink-0">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-secondary group-hover:scale-110 transition-transform">
              <Stethoscope className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              DocEase
            </span>
          </Link>

          {/* Navigation Links - Center (Desktop only) */}
          {showLinks && (
            <div className="hidden lg:flex items-center justify-center flex-1 space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'text-primary dark:text-accent'
                      : 'text-slate-700 dark:text-gray-300 hover:text-primary dark:hover:text-accent'
                  }`}
                >
                  {link.label}
                  {location.pathname === link.path && (
                    <motion.div
                      layoutId="underline"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary"
                    />
                  )}
                </Link>
              ))}
            </div>
          )}

          {/* Right Side - Profile/Login & Dark Mode */}
          <div className={`flex items-center ${isDashboard ? 'space-x-2' : 'space-x-3 md:space-x-4'}`}>
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>

            {/* User Profile or Login Button */}
            {showUser ? (
              <div className="hidden md:flex items-center space-x-3">
                {/* mail icon always visible when logged in */}
                <Mail className="w-5 h-5 text-slate-700 dark:text-gray-300" />
                <button
                  onClick={() => navigate(getDashboardPath(getUserRole()))}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 hover:shadow-md transition-all"
                  aria-label="Open dashboard"
                >
                  <User className="w-4 h-4 text-primary dark:text-accent" />
                  <span className="text-sm font-medium text-slate-700 dark:text-gray-300">
                    {userName}
                  </span>
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-gray-300 hover:text-primary dark:hover:text-accent transition-colors flex items-center space-x-2"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary to-secondary rounded-lg hover:from-primary-dark hover:to-secondary-dark transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden absolute top-[72px] md:top-[88px] left-4 right-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl transition-colors duration-300"
            >
              <div className="flex flex-col p-4 space-y-1">
                {/* Mobile Navigation Links */}
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${
                      location.pathname === link.path
                        ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-4" />
                
                {/* Mobile User Profile or Login */}
                {user ? (
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => {
                        setIsOpen(false)
                        navigate(getDashboardPath(getUserRole()))
                      }}
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Logged in as</span>
                        <span className="text-base font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{userName}</span>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsOpen(false)
                      }}
                      className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-3 rounded-xl text-base font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-center shadow-lg shadow-teal-500/25 transition-all"
                  >
                    Login / Sign up
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}

export default Navbar
