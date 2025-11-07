// Auth controller for signup, login, logout
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'

// Helper: generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  )
}

// Signup (Patient self-register, Admin creates Admin)
export const signup = async (req, res) => {
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
    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, password: hashed, role, hospitalId })
    const token = generateToken(user)
    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, hospitalId: user.hospitalId },
      token
    })
  } catch (err) {
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
    const hashed = await bcrypt.hash(tempPassword, 10)
    const user = await User.create({
      name,
      email,
      password: hashed,
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
export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })
    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ message: 'Invalid credentials' })
    // If doctor and firstLogin, require password change
    if (user.role === 'doctor' && user.firstLogin) {
      return res.status(403).json({ message: 'First login: password change required', firstLogin: true })
    }
    const token = generateToken(user)
    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, hospitalId: user.hospitalId },
      token
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
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
    user.password = await bcrypt.hash(newPassword, 10)
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
