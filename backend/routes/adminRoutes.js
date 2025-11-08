import express from 'express'
import { requireAuth, requireRole } from '../middlewares/authMiddleware.js'
import { getAdminStats, getRecentActivity } from '../controllers/adminController.js'

const router = express.Router()

// Protect all routes
router.use(requireAuth)
router.use(requireRole('admin'))

// Get dashboard stats
router.get('/stats', getAdminStats)

// Get recent activity
router.get('/activity', getRecentActivity)

export default router