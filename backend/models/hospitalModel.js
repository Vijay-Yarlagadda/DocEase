import mongoose from 'mongoose'

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  specialties: [{
    type: String
  }],
  facilities: [{
    type: String
  }],
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  doctors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Update timestamp on save
hospitalSchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  next()
})

const Hospital = mongoose.model('Hospital', hospitalSchema)

export default Hospital