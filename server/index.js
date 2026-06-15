const express = require('express')
const cors = require('cors')
require('dotenv').config()
const emailService = require('./services/emailService')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.post('/api/emails/send', async (req, res) => {
  try {
    const { action, payload } = req.body
    let result = { success: false, error: 'Unknown action' }

    console.log('Received email request:', action)

    switch (action) {
      case 'sendDoctorCredentials':
        result = await emailService.sendDoctorCredentials(payload.email, payload.name, payload.password)
        break
      case 'sendAppointmentBookedToDoctor':
        result = await emailService.sendAppointmentBookedToDoctor(payload.doctorEmail, payload.patientName, payload.date, payload.time)
        break
      case 'sendAppointmentStatusToPatient':
        result = await emailService.sendAppointmentStatusToPatient(payload.patientEmail, payload.patientName, payload.doctorName, payload.date, payload.time, payload.status)
        break
      case 'sendAppointmentCancelled':
        result = await emailService.sendAppointmentCancelled(payload.email, payload.oppositeName, payload.date, payload.time)
        break
      case 'sendHospitalSubmittedToSuperAdmin':
        result = await emailService.sendHospitalSubmittedToSuperAdmin(payload.adminEmail, payload.hospitalName)
        break
      case 'sendHospitalVerificationStatus':
        result = await emailService.sendHospitalVerificationStatus(payload.hospitalEmail, payload.hospitalName, payload.status)
        break
      case 'sendDocumentUploadNotification':
        result = await emailService.sendDocumentUploadNotification(payload.doctorEmail, payload.doctorName, payload.patientName)
        break
      default:
        return res.status(400).json({ success: false, error: 'Invalid action type' })
    }

    if (result.success) {
      res.status(200).json(result)
    } else {
      res.status(500).json(result)
    }
  } catch (error) {
    console.error('Server error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

app.listen(PORT, () => {
  console.log(`Email Notification Server running on port ${PORT}`)
})
