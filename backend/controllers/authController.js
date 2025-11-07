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

// Signup (Patient self-register, Admin creates Doctor/Admin)
export const signup = async (req, res) => {
  try {
    const { name, email, password, role, hospitalId } = req.body
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' })
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

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })
    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ message: 'Invalid credentials' })
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
