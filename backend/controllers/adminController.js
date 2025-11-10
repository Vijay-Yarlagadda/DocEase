import User from '../models/userModel.js'
import Hospital from '../models/hospitalModel.js'

export const getAdminStats = async (req, res) => {
  try {
    const hospitalsList = await Hospital.find()
    const doctorsList = await User.find({ role: 'doctor' })
    const patientsList = await User.find({ role: 'patient' })
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const allUsers = await User.find()
    const activeUsers = allUsers.filter(u => u.updatedAt && new Date(u.updatedAt) >= cutoff).length

    res.json({
      hospitals: hospitalsList.length,
      doctors: doctorsList.length,
      patients: patientsList.length,
      activeSessions: activeUsers
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getRecentActivity = async (req, res) => {
  try {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentDoctors = await User.find({ role: 'doctor', createdAt: { $gte: cutoff } })
    const recentHospitals = await Hospital.find({ createdAt: { $gte: cutoff } })
    const recentPatients = await User.find({ role: 'patient', createdAt: { $gte: cutoff } })

    // Sort by createdAt desc and limit 5
    const sortDesc = (a, b) => new Date(b.createdAt) - new Date(a.createdAt)

    res.json({
      recentDoctors: recentDoctors.sort(sortDesc).slice(0, 5),
      recentHospitals: recentHospitals.sort(sortDesc).slice(0, 5),
      recentPatients: recentPatients.sort(sortDesc).slice(0, 5)
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}