import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Users, Mail, Lock, User, ArrowRight } from 'lucide-react'
import { adminSignup, patientSignup } from '../services/authService'
import { useToast } from '../components/Toast'
import AuthPageShell from '../components/auth/AuthPageShell'
import AuthRoleSelector from '../components/auth/AuthRoleSelector'
import AuthInput from '../components/auth/AuthInput'

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
      route: '/admin/dashboard',
    },
    {
      id: 'patient',
      icon: Users,
      label: 'Patient',
      description: 'Patients and users',
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
      localStorage.setItem('docease_user', JSON.stringify(result))

      const roleData = roles.find((r) => r.id === selectedRole)
      setTimeout(() => {
        navigate(roleData.route)
      }, 500)
    } catch (err) {
      console.error('[Signup] caught error:', err)
      const displayMessage = err?.message || 'Signup failed. Please try again.'
      showError(displayMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthPageShell
      title="Create your"
      highlight="DocEase"
      subtitle="Sign up as an admin or patient and manage your health workflows with confidence."
      footerText="Already have an account?"
      footerLink="/login"
      footerLinkText="Sign in here"
    >
      <div className="mb-7">
        <p className="text-sm font-semibold text-slate-200 mb-1">Select your role</p>
        <p className="text-xs text-slate-500 mb-4">Only admin and patient signup is available here.</p>
        <AuthRoleSelector
          roles={roles}
          selectedRole={selectedRole}
          onSelect={setSelectedRole}
          columns={2}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput
          id="name"
          name="name"
          type="text"
          label="Full Name"
          value={formData.name}
          onChange={handleChange}
          placeholder="John Doe"
          icon={User}
          disabled={loading}
          required
        />

        <AuthInput
          id="email"
          name="email"
          type="email"
          label="Email Address"
          value={formData.email}
          onChange={handleChange}
          placeholder="your.email@example.com"
          icon={Mail}
          disabled={loading}
          required
        />

        <AuthInput
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          label="Password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Min. 8 characters"
          icon={Lock}
          disabled={loading}
          required
          showPasswordToggle
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword((prev) => !prev)}
          hint="Password must contain at least 8 characters."
        />

        <AuthInput
          id="confirmPassword"
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          label="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm your password"
          icon={Lock}
          disabled={loading}
          required
          showPasswordToggle
          showPassword={showConfirmPassword}
          onTogglePassword={() => setShowConfirmPassword((prev) => !prev)}
        />

        <button
          type="submit"
          disabled={loading || !selectedRole}
          className="auth-btn"
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
    </AuthPageShell>
  )
}

export default Signup
