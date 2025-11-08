import { createContext, useState, useEffect } from 'react'
import api, { setAuthToken } from '../services/api'
import { useNavigate } from 'react-router-dom'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Try auto-login on mount
  useEffect(() => {
    const t = localStorage.getItem('docease_token')
    if (t) {
      setAuthToken(t)
      api
        .get('/auth/dashboard')
        .then((res) => {
          setUser(res.data.user || { name: res.data.message })
          setToken(t)
        })
        .catch(() => {
          // invalid token
          localStorage.removeItem('docease_token')
          setAuthToken(null)
          setUser(null)
          setToken(null)
        })
        .finally(() => setLoading(false))
    } else setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password })
      const { token: t, user: u } = res.data
      if (t) {
        localStorage.setItem('docease_token', t)
        setAuthToken(t)
        setToken(t)
        setUser(u)
      }
      return res.data
    } catch (err) {
      // If server returns an error body (eg. firstLogin flag), surface it to callers
      if (err.response && err.response.data) return err.response.data
      throw err
    }
  }

  const signup = async (payload) => {
    try {
      const res = await api.post('/auth/signup', payload)
      const { token: t, user: u } = res.data
      if (t) {
        localStorage.setItem('docease_token', t)
        setAuthToken(t)
        setToken(t)
        setUser(u)
      }
      return res.data
    } catch (err) {
      if (err.response && err.response.data) return err.response.data
      throw err
    }
  }

  const logout = () => {
    localStorage.removeItem('docease_token')
    setAuthToken(null)
    setUser(null)
    setToken(null)
    navigate('/')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}
