// Auth controller for signup, login, logout
import admin from '../firebaseAdmin.js'
import User from '../models/userModel.js'

// Note: Firebase issues ID tokens on the client. Backend verifies them via Firebase Admin.

// Signup (Patient self-register, Admin creates Admin)
// Frontend creates Firebase user and sends idToken, backend verifies and stores metadata
export const signupUser = async (req, res) => {
  try {
    // Frontend sends: { idToken, name, role, hospitalId? }
    const { idToken, name, role, hospitalId } = req.body
    
    if (!idToken || !name || !role) {
      return res.status(400).json({ message: 'idToken, name, and role are required' })
    }
    
    if (role === 'doctor') {
      return res.status(403).json({ message: 'Doctors cannot self-register' })
    }
    
    if (!admin || !admin.auth) {
      return res.status(500).json({ message: 'Firebase Admin not initialized' })
    }

    // Verify the Firebase ID token
    let decoded
    try {
      decoded = await admin.auth().verifyIdToken(idToken)
    } catch (err) {
      console.error('Firebase token verification failed:', err.message)
      return res.status(401).json({ message: 'Invalid or expired idToken' })
    }

    const email = decoded.email
    const uid = decoded.uid

    if (!email) {
      return res.status(400).json({ message: 'Email not found in token' })
    }

    // Check if admin is trying to sign up
    if (role === 'admin') {
      // Check if any admin exists
      const adminCount = await User.countDocuments({ role: 'admin' })
      // If admins exist, require authentication from an existing admin
      if (adminCount > 0) {
        // Verify that the user making the request is an existing admin
        const existingAdmin = await User.findById(uid)
        if (!existingAdmin || existingAdmin.role !== 'admin') {
          return res.status(403).json({ message: 'Only existing admins can create new admin accounts' })
        }
      }
      // First admin can sign up without existing admin authentication
    }
    
    // Check if user already exists in local database
    const existing = await User.findById(uid) || await User.findOne({ email })
    if (existing) {
      // User already exists, return success with existing user data
      console.log('User already exists:', email)
      const userData = {
        _id: existing._id,
        name: existing.name || name,
        email: existing.email,
        role: existing.role,
        hospitalId: existing.hospitalId
      }
      // Update custom claims if role changed
      if (existing.role !== role) {
        await admin.auth().setCustomUserClaims(uid, { role: existing.role })
      }
      return res.status(200).json({ 
        message: 'User already exists', 
        token: idToken,
        user: userData,
        role: userData.role,
        name: userData.name
      })
    }

    // Update custom claims for role (so client can read role from token if needed)
    try {
      await admin.auth().setCustomUserClaims(uid, { role })
    } catch (err) {
      console.warn('Failed to set custom claims:', err.message)
      // Continue even if custom claims fail
    }

    // Store metadata locally (use Firebase UID as _id)
    const created = await User.create({ _id: uid, name, email, role, hospitalId })
    console.log('User registered successfully (Firebase):', email, 'uid:', uid)
    
    // Return response matching frontend expectations
    res.status(201).json({ 
      message: 'User created successfully', 
      token: idToken,
      user: {
        _id: created._id,
        name: created.name,
        email: created.email,
        role: created.role,
        hospitalId: created.hospitalId
      },
      role: created.role,
      name: created.name
    })
  } catch (err) {
    console.error('Signup error:', err)
    res.status(500).json({ message: err.message || 'Internal server error' })
  }
}

// Admin creates doctor account (generates temp password)
export const createDoctor = async (req, res) => {
  try {
    const { name, email, specialization, hospitalId } = req.body
    if (!name || !email || !hospitalId) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ message: 'Email already exists' })

    // Generate temp password (plain text version to return to admin)
    const tempPasswordPlain = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase()

    // Create Firebase user for doctor
    if (!admin || !admin.auth) {
      return res.status(500).json({ message: 'Firebase Admin not initialized' })
    }
    const userRecord = await admin.auth().createUser({ email, password: tempPasswordPlain, displayName: name })
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'doctor' })
    const user = await User.create({ _id: userRecord.uid, name, email, password: tempPasswordPlain, role: 'doctor', hospitalId, firstLogin: true, tempPassword: tempPasswordPlain })

    res.status(201).json({
      message: 'Doctor account created successfully',
      doctor: { id: user._id, name: user.name, email: user.email, hospitalId: user.hospitalId },
      tempPassword: tempPasswordPlain,
      note: 'Share these credentials with the doctor. They must change their password on first login.'
    })
  } catch (err) {
    console.error('Create doctor error:', err)
    res.status(500).json({ message: err.message })
  }
}

// Login (doctor must change password on first login)
export const loginUser = async (req, res) => {
  try {
    // Expect ID token from client (obtained via Firebase client SDK after sign-in)
    const idToken = req.body.idToken || (req.headers.authorization && req.headers.authorization.split(' ')[1])
    if (!idToken) return res.status(400).json({ message: 'Missing idToken. Sign in on the client and send idToken to this endpoint.' })
    if (!admin || !admin.auth) return res.status(500).json({ message: 'Firebase Admin not initialized' })

    const decoded = await admin.auth().verifyIdToken(idToken)
    // decoded.uid, decoded.email, and decoded.auth_time etc.
    const user = await User.findById(decoded.uid) || await User.findOne({ email: decoded.email })
    
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please sign up first.' })
    }
    
    const responseUser = { ...user }
    if (responseUser.password) delete responseUser.password
    if (responseUser.tempPassword) delete responseUser.tempPassword

    // Return the same idToken as proof of authentication and user metadata
    // Include firstLogin flag for doctors who need to change password
    res.status(200).json({ 
      message: 'Login successful', 
      token: idToken, 
      role: responseUser.role || decoded.role || (decoded.claims && decoded.claims.role), 
      name: responseUser.name, 
      user: responseUser,
      firstLogin: responseUser.firstLogin || false
    })
  } catch (err) {
    console.error('Login error (Firebase):', err)
    res.status(401).json({ message: 'Invalid or expired idToken' })
  }
}

// Doctor changes password on first login
export const changePassword = async (req, res) => {
  try {
    // For Firebase-managed auth, expect an idToken to identify the user and newPassword
    const idToken = req.body.idToken || (req.headers.authorization && req.headers.authorization.split(' ')[1])
    const { newPassword } = req.body
    if (!idToken || !newPassword) return res.status(400).json({ message: 'idToken and newPassword are required' })
    if (!admin || !admin.auth) return res.status(500).json({ message: 'Firebase Admin not initialized' })

    const decoded = await admin.auth().verifyIdToken(idToken)
    const user = await User.findById(decoded.uid)
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.role !== 'doctor' || !user.firstLogin) return res.status(400).json({ message: 'Password change not required' })

    // Update password in Firebase
    await admin.auth().updateUser(decoded.uid, { password: newPassword })
    // Update local metadata
    await User.updateById(user._id, { firstLogin: false, tempPassword: undefined })
    const updated = await User.findById(user._id)
    delete updated.password
    delete updated.tempPassword
    res.status(200).json({ message: 'Password changed successfully', user: updated })
  } catch (err) {
    console.error('Change password error:', err)
    res.status(500).json({ message: err.message })
  }
}

// Logout (handled on frontend by deleting token)
export const logout = (req, res) => {
  // Just a placeholder for frontend to clear token
  res.status(200).json({ message: 'Logged out successfully' })
}
