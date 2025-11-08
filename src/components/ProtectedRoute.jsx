import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useContext(AuthContext)
  if (loading) return null // or a spinner
  if (!user) return <Navigate to="/login" replace />
  if (roles && roles.length && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default ProtectedRoute
