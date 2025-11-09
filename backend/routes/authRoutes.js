// Auth routes for signup, login, logout, protected dashboard
import express from 'express'
import { signupUser, loginUser, logout, createDoctor, changePassword } from '../controllers/authController.js'
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Signup (patient self-register, admin creates admin)
router.post('/signup', signupUser)
// Admin creates doctor
router.post('/admin/create-doctor', verifyToken, requireRole('admin'), createDoctor)
// Login
router.post('/login', loginUser)
// Doctor changes password on first login
router.post('/doctor/change-password', changePassword)
// Logout (frontend clears token)
router.post('/logout', logout)

// Test route to confirm JWT decoding works
router.get('/test', verifyToken, (req, res) => {
  res.status(200).json({ 
    message: 'JWT token is valid', 
    user: { 
      id: req.user._id, 
      name: req.user.name,
      email: req.user.email, 
      role: req.user.role 
    } 
  })
})

// Protected dashboard route
router.get('/dashboard', verifyToken, (req, res) => {
  res.status(200).json({ 
    message: `Welcome ${req.user.name}`, 
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  })
})

// Example admin-only route
router.get('/admin/hospitals', verifyToken, requireRole('admin'), (req, res) => {
  res.status(200).json({ message: 'Admin: manage hospitals' })
})

export default router
