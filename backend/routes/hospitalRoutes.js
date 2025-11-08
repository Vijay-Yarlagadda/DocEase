import express from 'express'
import { requireAuth, requireRole } from '../middlewares/authMiddleware.js'
import {
  getHospitals,
  getHospital,
  createHospital,
  updateHospital,
  deleteHospital,
  addDoctorToHospital
} from '../controllers/hospitalController.js'

const router = express.Router()

// Protect all routes - require authentication
router.use(requireAuth)

// Get all hospitals (admin only)
router.get('/', requireRole('admin'), getHospitals)

// Get one hospital
router.get('/:id', requireRole('admin', 'doctor'), getHospital)

// Create hospital (admin only)
router.post('/', requireRole('admin'), createHospital)

// Update hospital (admin only)
router.put('/:id', requireRole('admin'), updateHospital)

// Delete hospital (admin only)
router.delete('/:id', requireRole('admin'), deleteHospital)

// Add doctor to hospital (admin only)
router.post('/:hospitalId/doctors/:doctorId', requireRole('admin'), addDoctorToHospital)

export default router