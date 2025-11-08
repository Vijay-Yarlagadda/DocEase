import { useState, useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api, { setAuthToken } from '../services/api'
import { AuthContext } from '../context/AuthContext'

const DoctorChangePassword = () => {
  const loc = useLocation()
  const navigate = useNavigate()
  const { setUser } = useContext(AuthContext)
  const initialEmail = loc.state?.email || ''

  const [form, setForm] = useState({ email: initialEmail, oldPassword: '', newPassword: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/doctor/change-password', {
        email: form.email,
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      })
      // On success backend returns user and token
      if (res.data && res.data.token) {
        const { token, user } = res.data
        localStorage.setItem('docease_token', token)
        setAuthToken(token)
        setUser(user)
        navigate('/doctor/dashboard')
      } else {
        alert(res.data.message || 'Password changed, please login.')
        navigate('/login')
      }
    } catch (err) {
      console.error(err)
      const msg = err.response?.data?.message || err.message || 'Unable to change password'
      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-20 min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Change Temporary Password</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Enter your temporary password and choose a new secure password.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input name="email" value={form.email} onChange={handleChange} required className="w-full p-2 rounded border bg-gray-50 dark:bg-gray-700" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Current (temporary) password</label>
            <input name="oldPassword" value={form.oldPassword} onChange={handleChange} type="password" required className="w-full p-2 rounded border bg-gray-50 dark:bg-gray-700" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">New password</label>
            <input name="newPassword" value={form.newPassword} onChange={handleChange} type="password" required className="w-full p-2 rounded border bg-gray-50 dark:bg-gray-700" />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DoctorChangePassword
