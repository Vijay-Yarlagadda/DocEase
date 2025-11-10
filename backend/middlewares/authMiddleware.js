// JWT authentication and role-based access middleware
import admin from '../firebaseAdmin.js'
import User from '../models/userModel.js'

// Middleware to verify Firebase ID token (Authorization: Bearer <idToken>)
export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' })
  }
  const idToken = authHeader.split(' ')[1]
  if (!admin || !admin.auth) {
    return res.status(500).json({ message: 'Firebase Admin not initialized on server' })
  }
  try {
    const decoded = await admin.auth().verifyIdToken(idToken)
    // decoded contains uid, email, and custom claims
    const user = await User.findById(decoded.uid)
    if (!user) {
      // fallback: try finding by email
      const byEmail = await User.findOne({ email: decoded.email })
      if (byEmail) req.user = byEmail
      else req.user = { uid: decoded.uid, email: decoded.email, role: decoded.role || (decoded.claims && decoded.claims.role) }
    } else {
      req.user = user
    }
    delete req.user.password
    delete req.user.tempPassword
    req.user.firebase = decoded
    next()
  } catch (err) {
    console.error('Firebase token verification failed:', err.message)
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

// Middleware for role-based access
export const requireRole = (role) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' })
  }
  if (req.user.role !== role) {
    return res.status(403).json({ message: 'Access denied: insufficient role' })
  }
  next()
}

// Backwards-compatible alias: some files import `requireAuth`
export const requireAuth = verifyToken
