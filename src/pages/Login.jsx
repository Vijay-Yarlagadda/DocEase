import { useState, useContext, useMemo } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Shield, UserCheck, Users, ArrowRight, Mail, Lock } from 'lucide-react'
import { loginUser, doctorMustChangePassword, SUPER_ADMIN_EMAIL, forceCreateSuperAdmin } from '../services/authService'
import { auth } from '../services/firebase'
import { useToast } from '../components/Toast'
import AuthPageShell from '../components/auth/AuthPageShell'
import AuthRoleSelector from '../components/auth/AuthRoleSelector'
import AuthInput from '../components/auth/AuthInput'

const Login = () => {
  const [selectedRole, setSelectedRole] = useState(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const { setUser } = useContext(AuthContext)

  const roles = [
    { id: 'admin', icon: Shield, label: 'Admin', description: 'Hospital administrators', route: '/admin/dashboard' },
    { id: 'doctor', icon: UserCheck, label: 'Doctor', description: 'Medical professionals', route: '/doctor/dashboard' },
    { id: 'patient', icon: Users, label: 'Patient', description: 'Patients and users', route: '/patient/dashboard' },
  ]

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const isSuperAdminLogin = formData.email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
  const showSuperAdminSetup = isSuperAdminLogin

  const validateForm = () => {
    if (!isSuperAdminLogin && !selectedRole) { showError('Please select a role'); return false }
    if (!formData.email.trim()) { showError('Email is required'); return false }
    if (!formData.password.trim()) { showError('Password is required'); return false }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      const user = await loginUser(formData.email, formData.password, isSuperAdminLogin ? null : selectedRole)

      const idToken = await auth.currentUser?.getIdToken()
      if (idToken) localStorage.setItem('docease_token', idToken)

      const finalRole = isSuperAdminLogin ? 'superadmin' : selectedRole
      const userWithRole = { ...user, role: finalRole }
      setUser(userWithRole)
      localStorage.setItem('docease_user', JSON.stringify(userWithRole))

      if (!isSuperAdminLogin && selectedRole === 'doctor' && doctorMustChangePassword(user)) {
        showSuccess('Please set a new password to continue')
        navigate('/doctor/change-password', {
          state: {
            email: user.email,
            tempPassword: formData.password,
            doctorName: user.name,
          },
        })
        return
      }

      if (isSuperAdminLogin) {
        navigate('/super-admin/dashboard')
        return
      }

      const roleData = roles.find((r) => r.id === selectedRole)
      navigate(roleData.route)
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
        <p className="text-sm font-semibold text-slate-200 mb-1">
          {isSuperAdminLogin ? 'Hidden Super Admin login' : 'Select your role'}
        </p>
        <p className="text-xs text-slate-500 mb-4">
          {isSuperAdminLogin ? 'Enter the hidden Super Admin credentials to sign in directly.' : 'Choose the portal you want to sign in to.'}
        </p>
        {!isSuperAdminLogin ? (
          <>
            <AuthRoleSelector roles={roles} selectedRole={selectedRole} onSelect={setSelectedRole} columns={3} />
            {selectedRole === 'doctor' && (
              <p className="text-xs text-cyan-400/80 mt-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-3 py-2">
                Doctor accounts are created by your hospital admin. Use the credentials provided to you.
              </p>
            )}
          </>
        ) : (
          <p className="text-xs text-emerald-300/90 mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
            Hidden Super Admin login detected. You may continue without selecting a role.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput id="email" name="email" type="email" label="Email Address" value={formData.email} onChange={handleChange} placeholder="your.email@example.com" icon={Mail} disabled={loading} required />
        <AuthInput id="password" name="password" type={showPassword ? 'text' : 'password'} label="Password" value={formData.password} onChange={handleChange} placeholder="Enter your password" icon={Lock} disabled={loading} required showPasswordToggle showPassword={showPassword} onTogglePassword={() => setShowPassword((p) => !p)} />
        <button type="submit" disabled={loading || (!isSuperAdminLogin && !selectedRole)} className="auth-btn">
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
      {showSuperAdminSetup && (
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-100">
          <p className="font-semibold text-amber-200 mb-2">Super Admin setup mode</p>
          <p className="mb-3">Your hidden Super Admin account can be provisioned or reset here. If this account does not yet exist, it will be created automatically.</p>
          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              setLoading(true)
              try {
                const setupSecret = import.meta.env.VITE_SUPER_ADMIN_SETUP_SECRET || 'DocEaseSuperAdminForceCreate123!'
                await forceCreateSuperAdmin(formData.email, formData.password, setupSecret)
                showSuccess('Super Admin account provisioned successfully. Now sign in again.')
              } catch (err) {
                console.error('Super Admin provisioning failed:', err)
                showError(err.message || 'Super Admin provisioning failed.')
              } finally {
                setLoading(false)
              }
            }}
            className="w-full rounded-lg bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Force Create / Reset Super Admin
          </button>
        </div>
      )}
    </AuthPageShell>
  )
}

export default Login
