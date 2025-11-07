// Auth routes for signup, login, logout, protected dashboard
import express from 'express'
import { signup, login, logout, createDoctor, changePassword } from '../controllers/authController.js'
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Signup (patient self-register, admin creates admin)
router.post('/signup', signup)
// Admin creates doctor
router.post('/admin/create-doctor', verifyToken, requireRole('admin'), createDoctor)
// Login
router.post('/login', login)
// Doctor changes password on first login
router.post('/doctor/change-password', changePassword)
// Logout (frontend clears token)
router.post('/logout', logout)

// Example protected route
router.get('/dashboard', verifyToken, (req, res) => {
  res.json({ message: `Welcome ${req.user.name}, role: ${req.user.role}` })
})

// Example admin-only route
router.get('/admin/hospitals', verifyToken, requireRole('admin'), (req, res) => {
  res.json({ message: 'Admin: manage hospitals' })
})

export default router
