import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, UserCheck, Users, ArrowRight, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { loginUser } from '../services/authService'
import { useToast } from '../components/Toast'

const Login = () => {
  const [selectedRole, setSelectedRole] = useState(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()

  const roles = [
    {
      id: 'admin',
      icon: Shield,
      label: 'Admin',
      description: 'Hospital administrators',
      gradient: 'from-blue-900 to-blue-600',
      route: '/admin/dashboard',
    },
    {
      id: 'doctor',
      icon: UserCheck,
      label: 'Doctor',
      description: 'Medical professionals',
      gradient: 'from-cyan-600 to-cyan-400',
      route: '/doctor/dashboard',
    },
    {
      id: 'patient',
      icon: Users,
      label: 'Patient',
      description: 'Patients and users',
      gradient: 'from-teal-600 to-teal-400',
      route: '/patient/dashboard',
    },
  ]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const validateForm = () => {
    if (!selectedRole) {
      showError('Please select a role')
      return false
    }

    if (!formData.email.trim()) {
      showError('Email is required')
      return false
    }

    if (!formData.password.trim()) {
      showError('Password is required')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      const user = await loginUser(formData.email, formData.password, selectedRole)
      // If doctor logs in and is on first login, force password change
      if (selectedRole === 'doctor' && user.firstLogin) {
        navigate('/doctor/change-password', {
          state: { email: user.email, tempPassword: formData.password, doctorName: user.name },
        })
        return
      }

      showSuccess(`Welcome back, ${user.name}!`)

      // Store user data
      localStorage.setItem('docease_user', JSON.stringify(user))

      // Navigate to appropriate dashboard
      const roleData = roles.find((r) => r.id === selectedRole)
      setTimeout(() => {
        navigate(roleData.route)
      }, 500)
    } catch (err) {
      console.error('Login error:', err)
      showError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-20 min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Welcome Back to <span className="text-primary">DocEase</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Sign in to access your dashboard, manage patients, appointments, and hospital workflows.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 rounded-[28px] p-8 max-w-2xl mx-auto"
        >
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Select your role</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Choose the portal you want to sign in to.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {roles.map((role) => {
                const Icon = role.icon
                const isSelected = selectedRole === role.id
                return (
                  <motion.button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-5 rounded-3xl border transition duration-300 text-left ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-slate-900 dark:text-white shadow-sm'
                        : 'border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-primary'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`inline-flex items-center justify-center w-11 h-11 rounded-2xl ${isSelected ? 'bg-primary text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'}`}>
                        <Icon className="w-5 h-5" />
                      </span>
                      <div>
                        <p className="font-semibold text-base">{role.label}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{role.description}</p>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-semibold py-3 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-slate-600 dark:text-slate-400 mt-6">
            Don’t have an account?{' '}
            <Link to="/signup" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              Sign up here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Login
