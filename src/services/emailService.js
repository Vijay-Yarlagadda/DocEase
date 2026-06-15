import api from './api'

/**
 * Service to handle sending emails via the Express backend
 */
const emailService = {
  /**
   * Internal helper to send a generic email action to the backend
   * @param {string} action - The action type string defined in the backend
   * @param {object} payload - The payload required for the action
   * @returns {Promise<object>} The response data
   */
  async _sendAction(action, payload) {
    try {
      const response = await api.post('/emails/send', {
        action,
        payload,
      })
      return response.data
    } catch (error) {
      console.error(`Error sending email for action ${action}:`, error)
      throw error
    }
  },

  /**
   * Sends login credentials to a newly created doctor
   * @param {string} email 
   * @param {string} name 
   * @param {string} password 
   */
  async sendDoctorCredentials(email, name, password) {
    return this._sendAction('sendDoctorCredentials', { email, name, password })
  },

  /**
   * Notifies a doctor when a patient books an appointment
   * @param {string} doctorEmail 
   * @param {string} patientName 
   * @param {string} date 
   * @param {string} time 
   */
  async sendAppointmentBookedToDoctor(doctorEmail, patientName, date, time) {
    return this._sendAction('sendAppointmentBookedToDoctor', { doctorEmail, patientName, date, time })
  },

  /**
   * Notifies a patient when their appointment status changes
   * @param {string} patientEmail 
   * @param {string} patientName 
   * @param {string} doctorName 
   * @param {string} date 
   * @param {string} time 
   * @param {string} status 
   */
  async sendAppointmentStatusToPatient(patientEmail, patientName, doctorName, date, time, status) {
    return this._sendAction('sendAppointmentStatusToPatient', { patientEmail, patientName, doctorName, date, time, status })
  },

  /**
   * Notifies either party that an appointment was cancelled
   * @param {string} email 
   * @param {string} oppositeName 
   * @param {string} date 
   * @param {string} time 
   */
  async sendAppointmentCancelled(email, oppositeName, date, time) {
    return this._sendAction('sendAppointmentCancelled', { email, oppositeName, date, time })
  },

  /**
   * Notifies the super admin that a new hospital was submitted for review
   * @param {string} adminEmail 
   * @param {string} hospitalName 
   */
  async sendHospitalSubmittedToSuperAdmin(adminEmail, hospitalName) {
    return this._sendAction('sendHospitalSubmittedToSuperAdmin', { adminEmail, hospitalName })
  },

  /**
   * Notifies a hospital of their verification status
   * @param {string} hospitalEmail 
   * @param {string} hospitalName 
   * @param {string} status 
   */
  async sendHospitalVerificationStatus(hospitalEmail, hospitalName, status) {
    return this._sendAction('sendHospitalVerificationStatus', { hospitalEmail, hospitalName, status })
  },

  /**
   * Notifies a doctor that a patient uploaded a document
   * @param {string} doctorEmail 
   * @param {string} doctorName 
   * @param {string} patientName 
   */
  async sendDocumentUploadNotification(doctorEmail, doctorName, patientName) {
    return this._sendAction('sendDocumentUploadNotification', { doctorEmail, doctorName, patientName })
  }
}

export default emailService
