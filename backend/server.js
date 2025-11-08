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

// Connect to MongoDB Atlas and start server
const PORT = process.env.PORT || 5000

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  })
  .catch(err => {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  })
