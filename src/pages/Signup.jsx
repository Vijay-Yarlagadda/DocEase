import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, Users, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { adminSignup, patientSignup } from '../services/authService'
import { useToast } from '../components/Toast'

const Signup = () => {
  const [selectedRole, setSelectedRole] = useState(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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

    const name = formData.name.trim()
    const email = formData.email.trim()
    const password = formData.password
    const confirm = formData.confirmPassword

    if (!name) {
      showError('Full name is required')
      return false
    }

    if (!email) {
      showError('Email is required')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      showError('Please enter a valid email address')
      return false
    }

    if (password.length < 8) {
      showError('Password must be at least 8 characters long')
      return false
    }

    if (password !== confirm) {
      showError('Passwords do not match')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      let result

      if (selectedRole === 'admin') {
        result = await adminSignup(formData.email, formData.password, formData.name)
      } else if (selectedRole === 'patient') {
        result = await patientSignup(formData.email, formData.password, formData.name)
      }

      showSuccess(`Welcome ${result.name}! Signup successful.`)

      // Store user data
      localStorage.setItem('docease_user', JSON.stringify(result))

      // Navigate to appropriate dashboard
      const roleData = roles.find((r) => r.id === selectedRole)
      setTimeout(() => {
        navigate(roleData.route)
      }, 500)
    } catch (err) {
      console.error('[Signup] caught error:', err)
      console.error('[Signup] error.code:', err?.code)
      console.error('[Signup] error.message:', err?.message)
      console.error('[Signup] full error object:', err)

      // Show the actual error message from Firebase (or fallback generic)
      const displayMessage = err?.message || 'Signup failed. Please try again.'
      showError(displayMessage)
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
            Create your <span className="text-primary">DocEase</span> account
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Sign up as an admin or patient and manage your health workflows with confidence.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 rounded-[28px] p-8 max-w-2xl mx-auto"
        >
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4 gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Select your role</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Only admin and patient signup is available here.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        : 'border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-primary'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
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
                htmlFor="name"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  placeholder="John Doe"
                />
              </div>
            </div>

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
                  placeholder="Min. 8 characters"
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
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Password must contain at least 8 characters.
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedRole}
              className="w-full bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-semibold py-3 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
              aria-disabled={loading || !selectedRole}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-slate-600 dark:text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              Sign in here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Signup
