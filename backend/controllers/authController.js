// Auth controller for signup, login, logout
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'

// Helper: generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

// Signup (Patient self-register, Admin creates Admin)
export const signupUser = async (req, res) => {
  try {
    const { name, email, password, role, hospitalId } = req.body
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    if (role === 'doctor') {
      return res.status(403).json({ message: 'Doctors cannot self-register' })
    }
    
    // Check if admin is trying to sign up
    if (role === 'admin') {
      // Check if any admin exists
      const adminCount = await User.countDocuments({ role: 'admin' })
      // If admins exist, require authentication
      if (adminCount > 0) {
        // Check if request has valid admin token
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(403).json({ message: 'Admin registration requires authentication' })
        }
        try {
          const token = authHeader.split(' ')[1]
          const decoded = jwt.verify(token, process.env.JWT_SECRET)
          const adminUser = await User.findById(decoded.id)
          if (!adminUser || adminUser.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can create new admin accounts' })
          }
        } catch (err) {
          return res.status(403).json({ message: 'Invalid authentication token' })
        }
      }
      // First admin can sign up without authentication
    }
    
    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ message: 'Email already exists' })
    
    // Let the model pre-save hook hash the password
    const user = await User.create({ name, email, password, role, hospitalId })
    
    // Remove sensitive data before sending response
    user.password = undefined
    user.tempPassword = undefined
    const userObj = user.toObject()
    delete userObj.password
    delete userObj.tempPassword
    
    const token = generateToken(user)
    console.log('User registered successfully:', email)
    res.status(201).json({ 
      message: 'User created successfully', 
      token, 
      role: user.role,
      name: user.name,
      user: userObj
    })
  } catch (err) {
    console.error('Signup error:', err)
    res.status(500).json({ message: err.message })
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
    
    // Create user with temp password (will be hashed by pre-save hook)
    const user = await User.create({
      name,
      email,
      password: tempPasswordPlain,
      role: 'doctor',
      hospitalId,
      firstLogin: true,
      tempPassword: tempPasswordPlain // Store plain version temporarily (field is select: false)
    })
    
    // Remove sensitive data
    user.password = undefined
    const userObj = user.toObject()
    delete userObj.password
    delete userObj.tempPassword
    
    // Return credentials for admin to give to doctor (only in response, not stored in user object)
    res.status(201).json({
      message: 'Doctor account created successfully',
      doctor: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        hospitalId: user.hospitalId
      },
      tempPassword: tempPasswordPlain, // Return plain temp password only here
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
    const { email, password } = req.body;
    console.log('Login attempt:', { email });
    
    // Find user and explicitly select password field (since it's needed for comparison)
    const user = await User.findOne({ email }).select('+password');
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const match = await bcrypt.compare(password, user.password);
    console.log('Password match:', match);
    
    if (!match) {
      console.log('Password mismatch for user:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // If doctor and firstLogin, require password change
    if (user.role === 'doctor' && user.firstLogin) {
      console.log('Doctor first login, password change required');
      return res.status(403).json({ 
        message: 'First login: password change required', 
        firstLogin: true,
        email: user.email
      });
    }
    
    // Remove sensitive data before sending response
    user.password = undefined
    user.tempPassword = undefined
    const userObj = user.toObject()
    delete userObj.password
    delete userObj.tempPassword
    
    const token = generateToken(user);
    console.log('JWT token generated for user:', user.email);
    
    res.status(200).json({ 
      message: 'Login successful', 
      token, 
      role: user.role,
      name: user.name,
      user: userObj
    })
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message });
  }
}

// Doctor changes password on first login
export const changePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body
    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    
    // Find user with password field selected
    const user = await User.findOne({ email }).select('+password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    
    if (user.role !== 'doctor' || !user.firstLogin) {
      return res.status(400).json({ message: 'Password change not required' })
    }
    
    const match = await bcrypt.compare(oldPassword, user.password)
    if (!match) return res.status(401).json({ message: 'Invalid current password' })
    
    // Assign plain new password so model pre-save hook will hash it
    user.password = newPassword
    user.firstLogin = false
    user.tempPassword = undefined
    await user.save()
    
    // Remove sensitive data
    user.password = undefined
    user.tempPassword = undefined
    const userObj = user.toObject()
    delete userObj.password
    delete userObj.tempPassword
    
    const token = generateToken(user)
    res.status(200).json({
      message: 'Password changed successfully',
      token,
      role: user.role,
      name: user.name,
      user: userObj
    })
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
