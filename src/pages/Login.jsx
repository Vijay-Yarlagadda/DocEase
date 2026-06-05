import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, UserCheck, Users, ArrowRight, Mail, Lock } from 'lucide-react'
import { loginUser } from '../services/authService'
import { useToast } from '../components/Toast'
import AuthPageShell from '../components/auth/AuthPageShell'
import AuthRoleSelector from '../components/auth/AuthRoleSelector'
import AuthInput from '../components/auth/AuthInput'

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
      route: '/admin/dashboard',
    },
    {
      id: 'doctor',
      icon: UserCheck,
      label: 'Doctor',
      description: 'Medical professionals',
      route: '/doctor/dashboard',
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
      if (selectedRole === 'doctor' && user.firstLogin) {
        navigate('/doctor/change-password', {
          state: { email: user.email, tempPassword: formData.password, doctorName: user.name },
        })
        return
      }

      showSuccess(`Welcome back, ${user.name}!`)
      localStorage.setItem('docease_user', JSON.stringify(user))

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
    <AuthPageShell
      title="Welcome back to"
      highlight="DocEase"
      subtitle="Sign in to access your dashboard, manage patients, appointments, and hospital workflows."
      footerText="Don't have an account?"
      footerLink="/signup"
      footerLinkText="Sign up here"
    >
      <div className="mb-7">
        <p className="text-sm font-semibold text-slate-200 mb-1">Select your role</p>
        <p className="text-xs text-slate-500 mb-4">Choose the portal you want to sign in to.</p>
        <AuthRoleSelector
          roles={roles}
          selectedRole={selectedRole}
          onSelect={setSelectedRole}
          columns={3}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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
          placeholder="Enter your password"
          icon={Lock}
          disabled={loading}
          required
          showPasswordToggle
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword((prev) => !prev)}
        />

        <button
          type="submit"
          disabled={loading || !selectedRole}
          className="auth-btn"
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
    </AuthPageShell>
  )
}

export default Login
