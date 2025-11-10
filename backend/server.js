// Main server file for DocEase backend
import express from 'express'
// mongoose removed (using file-based/data-store instead)
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import hospitalRoutes from './routes/hospitalRoutes.js'
import adminRoutes from './routes/adminRoutes.js'

// Load environment variables from backend/.env
dotenv.config()

const app = express()

// Middlewares
app.use(cors())
app.use(express.json())

// Base route
app.get('/', (req, res) => res.send('DocEase backend is running 🚀'))

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/hospitals', hospitalRoutes)
app.use('/api/admin', adminRoutes)

// 404 handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// Start server (no MongoDB in this build)
const PORT = process.env.PORT || 5000
console.log('⚠️ MongoDB support has been removed for local development. Using Firebase for auth.')
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
