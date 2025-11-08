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
    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ message: 'Email already exists' })
    // Let the model pre-save hook hash the password
    const user = await User.create({ name, email, password, role, hospitalId })
    const token = generateToken(user)
    console.log('User registered successfully:', email)
    res.status(201).json({ message: 'User created successfully', token, role: user.role })
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
    // Generate temp password
    const tempPassword = Math.random().toString(36).slice(-8)
    // Let model hash the temp password on save
    const user = await User.create({
      name,
      email,
      password: tempPassword,
      role: 'doctor',
      hospitalId,
      firstLogin: true,
      tempPassword
    })
    // Return credentials for admin to give to doctor
    res.status(201).json({
      doctor: { id: user._id, name: user.name, email: user.email, hospitalId: user.hospitalId, tempPassword },
      message: 'Doctor account created. Share these credentials with the doctor.'
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Login (doctor must change password on first login)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email });
    const user = await User.findOne({ email });
    console.log('User found:', user);
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
      return res.status(403).json({ message: 'First login: password change required', firstLogin: true });
    }
    const token = generateToken(user);
    console.log('JWT token generated:', token);
    res.status(200).json({ message: 'Login successful', token, role: user.role })
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message });
  }
}

// Doctor changes password on first login
export const changePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body
    const user = await User.findOne({ email })
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
    const token = generateToken(user)
    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, hospitalId: user.hospitalId },
      token
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Logout (handled on frontend by deleting token)
export const logout = (req, res) => {
  // Just a placeholder for frontend to clear token
  res.json({ message: 'Logged out' })
}
