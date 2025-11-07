// User model for DocEase authentication system
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'doctor', 'patient'], required: true },
  hospitalId: { type: String }, // Only for doctors and admins
}, { timestamps: true })

const User = mongoose.model('User', userSchema)
export default User
