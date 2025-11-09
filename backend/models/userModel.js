// User model for DocEase authentication system
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false }, // Excluded by default, use +password to include
  role: { type: String, enum: ['admin', 'doctor', 'patient'], required: true },
  hospitalId: { type: String }, // Only for doctors and admins
  firstLogin: { type: Boolean, default: false }, // For doctors: true until password is changed
  tempPassword: { type: String, select: false }, // Store temp password for first login (never returned)
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

// Transform toJSON to always exclude password and tempPassword
userSchema.methods.toJSON = function() {
  const userObject = this.toObject()
  delete userObject.password
  delete userObject.tempPassword
  return userObject
}

const User = mongoose.model('User', userSchema)
export default User
