import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

const transporter = nodemailer.createTransport({
  service: 'gmail', // Standard configuration for Gmail
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // Needs an App Password from Gmail
  },
})

const FROM_EMAIL = process.env.SMTP_USER || 'docease@gmail.com'

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"DocEase" <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    })
    console.log(`Email sent to ${to}:`, info.messageId)
    return { success: true, id: info.messageId }
  } catch (error) {
    console.error('Error sending email via Nodemailer:', error)
    return { success: false, error: error.message }
  }
}

// ----------------------------------------------------------------------
// EMAIL TEMPLATES
// ----------------------------------------------------------------------

const baseStyles = `
  body { font-family: 'Inter', -apple-system, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 40px 20px; }
  .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
  .header { background: #14b8a6; padding: 32px 24px; text-align: center; }
  .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
  .content { padding: 32px 24px; }
  .content p { line-height: 1.6; margin-bottom: 16px; color: #334155; }
  .footer { background: #f1f5f9; padding: 24px; text-align: center; font-size: 14px; color: #64748b; }
  .button { display: inline-block; background: #14b8a6; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin-top: 16px; }
  .box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin: 16px 0; }
  .box-item { margin-bottom: 8px; }
  .box-item strong { color: #0f172a; }
`

const getLayout = (title, body) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>DocEase</h1>
    </div>
    <div class="content">
      ${body}
    </div>
    <div class="footer">
      <p>This is an automated message from DocEase. Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
`

export const sendDoctorCredentials = async (email, name, password, hospitalName, hospitalEmail) => {
  const html = getLayout(
    'Welcome to DocEase',
    `
    <h2>Welcome aboard, ${name}!</h2>
    <p>Your Doctor account has been successfully created by the administration at <strong>${hospitalName || 'your hospital'}</strong>.</p>
    <div class="box">
      <div class="box-item"><strong>Hospital Name:</strong> ${hospitalName || 'DocEase Hospital'}</div>
      ${hospitalEmail ? `<div class="box-item"><strong>Hospital Contact Email:</strong> ${hospitalEmail}</div>` : ''}
      <div class="box-item"><strong>Your Login Email:</strong> ${email}</div>
      <div class="box-item"><strong>Temporary Password:</strong> ${password}</div>
    </div>
    <p>Please log in and change your password immediately upon your first login for security purposes.</p>
    `
  )
  return sendEmail({ to: email, subject: 'Your DocEase Account Credentials', html })
}

export const sendAppointmentBookedToDoctor = async (doctorEmail, patientName, date, time) => {
  const html = getLayout(
    'New Appointment Request',
    `
    <h2>New Appointment Request</h2>
    <p>You have a new appointment request from <strong>${patientName}</strong>.</p>
    <div class="box">
      <div class="box-item"><strong>Date:</strong> ${date}</div>
      <div class="box-item"><strong>Time:</strong> ${time}</div>
    </div>
    <p>Please log in to your dashboard to review and approve or reject this request.</p>
    `
  )
  return sendEmail({ to: doctorEmail, subject: 'New Appointment Request - DocEase', html })
}

export const sendAppointmentStatusToPatient = async (patientEmail, patientName, doctorName, date, time, status) => {
  const isApproved = status === 'approved'
  const html = getLayout(
    `Appointment ${isApproved ? 'Approved' : 'Rejected'}`,
    `
    <h2>Hello ${patientName},</h2>
    <p>Your appointment request with <strong>${doctorName}</strong> has been <strong>${status}</strong>.</p>
    <div class="box">
      <div class="box-item"><strong>Date:</strong> ${date}</div>
      <div class="box-item"><strong>Time:</strong> ${time}</div>
    </div>
    ${isApproved ? '<p>You can now upload your medical documents from your patient portal.</p>' : '<p>Please feel free to browse and book another available slot.</p>'}
    `
  )
  return sendEmail({ to: patientEmail, subject: `Appointment ${isApproved ? 'Approved' : 'Rejected'} - DocEase`, html })
}

export const sendAppointmentCancelled = async (email, oppositeName, date, time) => {
  const html = getLayout(
    'Appointment Cancelled',
    `
    <h2>Appointment Cancellation Notice</h2>
    <p>Your upcoming appointment with <strong>${oppositeName}</strong> has been cancelled.</p>
    <div class="box">
      <div class="box-item"><strong>Date:</strong> ${date}</div>
      <div class="box-item"><strong>Time:</strong> ${time}</div>
    </div>
    <p>We apologize for any inconvenience this may cause.</p>
    `
  )
  return sendEmail({ to: email, subject: 'Appointment Cancelled - DocEase', html })
}

export const sendHospitalSubmittedToSuperAdmin = async (adminEmail, hospitalName) => {
  const html = getLayout(
    'New Hospital Registration',
    `
    <h2>New Registration Pending Verification</h2>
    <p>A new hospital, <strong>${hospitalName}</strong>, has submitted their registration and is awaiting verification.</p>
    <p>Please log in to the Super Admin portal to review their details and approve or reject the request.</p>
    `
  )
  return sendEmail({ to: adminEmail, subject: 'Action Required: New Hospital Registration', html })
}

export const sendHospitalVerificationStatus = async (hospitalEmail, hospitalName, status) => {
  const isApproved = status === 'approved'
  const html = getLayout(
    `Hospital Verification ${isApproved ? 'Approved' : 'Rejected'}`,
    `
    <h2>Hello ${hospitalName},</h2>
    <p>Your hospital registration on DocEase has been <strong>${status}</strong> by the Super Admin.</p>
    ${isApproved ? '<p>You can now log in and start managing your doctors and appointments!</p>' : '<p>Unfortunately, your application did not meet our requirements at this time.</p>'}
    `
  )
  return sendEmail({ to: hospitalEmail, subject: `DocEase Registration ${isApproved ? 'Approved' : 'Rejected'}`, html })
}

export const sendDocumentUploadNotification = async (doctorEmail, doctorName, patientName) => {
  const html = getLayout(
    'New Medical Documents Uploaded',
    `
    <h2>Hello ${doctorName},</h2>
    <p>Your patient, <strong>${patientName}</strong>, has uploaded new medical documents to their appointment record.</p>
    <p>Please log in to your dashboard to review the files prior to the consultation.</p>
    `
  )
  return sendEmail({ to: doctorEmail, subject: 'New Patient Documents Uploaded - DocEase', html })
}

export const sendPrescriptionUploadedToPatient = async (patientEmail, patientName, doctorName) => {
  const html = getLayout(
    'New Prescription & Notes Available',
    `
    <h2>Hello ${patientName},</h2>
    <p><strong>${doctorName}</strong> has updated your appointment record with a new prescription and consultation notes.</p>
    <p>Please log in to your patient portal to review your prescription, download any attached documents, and view your doctor's instructions.</p>
    `
  )
  return sendEmail({ to: patientEmail, subject: 'New Prescription Available - DocEase', html })
}

export const sendDoctorLeaveToAdmin = async (adminEmail, adminName, doctorName, leaveDate, reason) => {
  const html = getLayout(
    'Doctor Leave Scheduled',
    `
    <h2>Hello ${adminName},</h2>
    <p><strong>${doctorName}</strong> has scheduled an upcoming leave of absence.</p>
    <div class="box">
      <div class="box-item"><strong>Date:</strong> ${leaveDate}</div>
      <div class="box-item"><strong>Reason:</strong> ${reason}</div>
    </div>
    <p>Please ensure that no new appointments are booked for this date and any existing appointments are appropriately rescheduled by the doctor.</p>
    `
  )
  return sendEmail({ to: adminEmail, subject: `Leave Notice: ${doctorName} - DocEase`, html })
}
