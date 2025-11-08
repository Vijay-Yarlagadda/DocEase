import User from '../models/userModel.js'
import Hospital from '../models/hospitalModel.js'

export const getAdminStats = async (req, res) => {
  try {
    const [hospitals, doctors, patients, activeUsers] = await Promise.all([
      Hospital.countDocuments(),
      User.countDocuments({ role: 'doctor' }),
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ lastActive: { $gte: new Date(Date.now() - 24*60*60*1000) } })
    ])

    res.json({
      hospitals,
      doctors,
      patients,
      activeSessions: activeUsers
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getRecentActivity = async (req, res) => {
  try {
    const recentActivity = await Promise.all([
      // Get recent doctor registrations
      User.find({ role: 'doctor', createdAt: { $gte: new Date(Date.now() - 7*24*60*60*1000) } })
        .select('name email createdAt')
        .sort('-createdAt')
        .limit(5),
      
      // Get recent hospital additions
      Hospital.find({ createdAt: { $gte: new Date(Date.now() - 7*24*60*60*1000) } })
        .select('name createdAt')
        .sort('-createdAt')
        .limit(5),
        
      // Get recent patient signups
      User.find({ role: 'patient', createdAt: { $gte: new Date(Date.now() - 7*24*60*60*1000) } })
        .select('name email createdAt')
        .sort('-createdAt')
        .limit(5)
    ])

    res.json({
      recentDoctors: recentActivity[0],
      recentHospitals: recentActivity[1],
      recentPatients: recentActivity[2]
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}