import * as emailService from '../services/emailService.js'

export default async function handler(req, res) {
  // Add CORS headers so the frontend can hit it
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { action, payload } = req.body
    let result = { success: false, error: 'Unknown action' }

    console.log('Received email request:', action)

    switch (action) {
      case 'sendDoctorCredentials':
        result = await emailService.sendDoctorCredentials(payload.email, payload.name, payload.password, payload.hospitalName, payload.hospitalEmail)
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
      case 'sendPrescriptionUploadedToPatient':
        result = await emailService.sendPrescriptionUploadedToPatient(payload.patientEmail, payload.patientName, payload.doctorName)
        break
      case 'sendDoctorLeaveToAdmin':
        result = await emailService.sendDoctorLeaveToAdmin(payload.adminEmail, payload.adminName, payload.doctorName, payload.leaveDate, payload.reason)
        break
      default:
        return res.status(400).json({ success: false, error: 'Invalid action type' })
    }

    if (result.success) {
      return res.status(200).json(result)
    } else {
      return res.status(500).json(result)
    }
  } catch (error) {
    console.error('Server error:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
