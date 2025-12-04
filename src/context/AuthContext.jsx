import { createContext, useState, useEffect } from 'react'
import api, { setAuthToken } from '../services/api'
import { useNavigate } from 'react-router-dom'
// Optional Firebase client — initialize in src/services/firebase.js using VITE_FIREBASE_* env vars
import { auth, db } from '../services/firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore'

// Use provided collection id if set, otherwise fall back to this specific collection id
const USERS_COLLECTION = import.meta.env.VITE_FIRESTORE_USERS_COLLECTION || 'ASjw9v0N0hggMbhwjpy5'

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
          // Set user from response (user object or construct from available data)
          const userData = res.data.user || { name: res.data.message || 'User' }
          setUser(userData)
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
      // If Firebase client is initialized, authenticate with Firebase first and exchange the idToken with backend
      if (!auth) {
        throw new Error('Firebase is not configured on the frontend. Please provide VITE_FIREBASE_* env vars.')
      }

      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        const firebaseUser = userCredential.user
        const idToken = await firebaseUser.getIdToken()

        // Persist token locally and set axios header
        localStorage.setItem('docease_token', idToken)
        setAuthToken(idToken)
        setToken(idToken)

        // Try to read Firestore user profile for authoritative role/profile
        let firestoreProfile = null
        try {
          if (db) {
            const snap = await getDoc(doc(db, USERS_COLLECTION, firebaseUser.uid))
            if (snap.exists()) firestoreProfile = snap.data()
          }
        } catch (readErr) {
          console.warn('Failed to read Firestore profile during login:', readErr)
        }

        // Ask backend to verify/sync the user using the idToken
        try {
          const res = await api.post('/auth/login', { idToken })
          const { user: u, name, role, firstLogin } = res.data || {}
          // Merge priority: backend user -> firestoreProfile -> firebaseUser
          const userData = u || (firestoreProfile ? { ...firestoreProfile, uid: firebaseUser.uid } : { name: name || firebaseUser.displayName || firebaseUser.email, role: role || (firestoreProfile?.role || 'patient'), uid: firebaseUser.uid })
          setUser(userData)
          // Include firstLogin flag in response for doctors
          return { ...res.data, token: idToken, user: userData, firstLogin }
        } catch (err) {
          // Backend error - check if it's a client error (4xx) that should be shown to user
          if (err.response && err.response.status >= 400 && err.response.status < 500) {
            // For 4xx errors (like 404 user not found), throw to let component handle it
            throw err
          }
          
          // For 5xx errors or network errors, use Firebase-only session but warn
          console.warn('Backend unavailable, using Firebase-only session')
          const minimal = { name: firebaseUser.displayName || firebaseUser.email, uid: firebaseUser.uid, role: 'patient' }
          setUser(minimal)
          return { token: idToken, user: minimal, warning: 'Backend unavailable' }
        }
      } catch (firebaseErr) {
        if (
          firebaseErr?.code === 'auth/operation-not-allowed' ||
          firebaseErr?.code === 'auth/configuration-not-found'
        ) {
          throw new Error('Firebase email/password authentication is disabled. Enable it in Firebase console.')
        }
        if (firebaseErr?.code === 'app/no-app') {
          throw new Error('Firebase client not initialized. Check VITE_FIREBASE_* configuration.')
        }
        throw firebaseErr
      }
    } catch (err) {
      // If server returns an error body (eg. firstLogin flag), surface it to callers
      if (err.response && err.response.data) return err.response.data
      throw err
    }
  }

  const signup = async (payload) => {
    try {
      // If Firebase client is available, create the user client-side and send idToken to backend to sync metadata
      if (!auth) {
        throw new Error('Firebase is not configured on the frontend. Please provide VITE_FIREBASE_* env vars.')
      }

      const { email, password, name, role, phone } = payload
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const firebaseUser = userCredential.user
        const idToken = await firebaseUser.getIdToken()

        // Create Firestore user document (link Auth <-> Firestore)
        try {
          if (db) {
            await setDoc(doc(db, USERS_COLLECTION, firebaseUser.uid), {
              fullName: name || firebaseUser.displayName || '',
              email: firebaseUser.email,
              phone: phone || '',
              role: role || 'patient',
              uid: firebaseUser.uid,
              createdAt: serverTimestamp(),
            })
          } else {
            console.warn('Firestore `db` not initialized; skipping user document creation')
          }
        } catch (firestoreErr) {
          console.warn('Failed to create Firestore user document:', firestoreErr)
        }

        try {
          const res = await api.post('/auth/signup', { idToken, name, role })
          const { token: t, user: u, message } = res.data || {}
          
          // If backend returned an error message (but status 200), check if it's an error
          if (message && message.includes('already exists')) {
            // User already exists, but we have a token, so return success
            const finalToken = t || idToken
            localStorage.setItem('docease_token', finalToken)
            setAuthToken(finalToken)
            setToken(finalToken)
            const userData = u || { name: name || firebaseUser.displayName || firebaseUser.email, role, uid: firebaseUser.uid }
            setUser(userData)
            return res.data
          }
          
          // Successful signup
          const finalToken = t || idToken
          localStorage.setItem('docease_token', finalToken)
          setAuthToken(finalToken)
          setToken(finalToken)
          const userData = u || { name: name || firebaseUser.displayName || firebaseUser.email, role, uid: firebaseUser.uid }
          setUser(userData)
          return res.data
        } catch (err) {
          // Backend error - check if it's a network error or server error
          console.error('Backend signup error:', err)
          
          // If it's a 4xx error (client error), throw it so the component can handle it
          if (err.response && err.response.status >= 400 && err.response.status < 500) {
            throw err
          }
          
          // For 5xx errors or network errors, still keep Firebase session but warn user
          console.warn('Backend unavailable, using Firebase-only session')
          localStorage.setItem('docease_token', idToken)
          setAuthToken(idToken)
          setToken(idToken)
          const minimalUser = { name: name || firebaseUser.displayName || firebaseUser.email, role, uid: firebaseUser.uid }
          setUser(minimalUser)
          return { token: idToken, user: minimalUser, warning: 'Backend unavailable, data not saved to database' }
        }
      } catch (firebaseErr) {
        if (
          firebaseErr?.code === 'auth/operation-not-allowed' ||
          firebaseErr?.code === 'auth/configuration-not-found'
        ) {
          throw new Error('Firebase email/password authentication is disabled. Enable it in Firebase console.')
        }
        if (firebaseErr?.code === 'app/no-app') {
          throw new Error('Firebase client not initialized. Check VITE_FIREBASE_* configuration.')
        }
        throw firebaseErr
      }
    } catch (err) {
      console.error('Signup error:', err)
      // Enhanced error handling for network errors
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        const networkError = new Error('Cannot connect to server. Please make sure the backend server is running on port 5000.')
        networkError.code = 'NETWORK_ERROR'
        throw networkError
      }
      // If server responded with error, return the error data
      if (err.response && err.response.data) {
        return err.response.data
      }
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
