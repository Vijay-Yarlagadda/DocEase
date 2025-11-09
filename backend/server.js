// Main server file for DocEase backend
import express from 'express'
import mongoose from 'mongoose'
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

// Connect to MongoDB Atlas and start server
const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not defined in .env file')
  process.exit(1)
}

// Connect to MongoDB with improved options
mongoose.connect(MONGO_URI, {
  dbName: 'docease',
  retryWrites: true,
  w: 'majority',
  retryReads: true,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  // Add these options for better error handling
  serverSelectionTimeoutMS: 30000,
  heartbeatFrequencyMS: 2000
})
  .then(() => {
    console.log('✅ MongoDB Connected Successfully')
    console.log(`📦 Database: docease`)
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message)
    if (err.message.includes('ENOTFOUND')) {
      console.error('🔍 Could not resolve MongoDB host. Check your internet connection.')
    } else if (err.message.includes('ETIMEDOUT')) {
      console.error('⏰ Connection timed out. Check your network or firewall settings.')
    } else if (err.message.includes('Authentication failed')) {
      console.error('🔐 Authentication failed. Check your database username and password.')
    } else if (err.message.includes('whitelist')) {
      console.error('🌐 IP not whitelisted. Add your IP (175.101.104.40) to MongoDB Atlas Network Access.')
    }
    process.exit(1)
  })
