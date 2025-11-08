// User model for DocEase authentication system
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'doctor', 'patient'], required: true },
  hospitalId: { type: String }, // Only for doctors and admins
  firstLogin: { type: Boolean, default: false }, // For doctors: true until password is changed
  tempPassword: { type: String }, // Store temp password for first login (optional)
}, { timestamps: true })

// Pre-save hook to hash password when it's new or modified
userSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) return next()
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    return next()
  } catch (err) {
    return next(err)
  }
})

const User = mongoose.model('User', userSchema)
export default User
