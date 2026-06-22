const { Resend } = require('resend')
require('dotenv').config()

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

const buildResponse = (success, message, data = {}) => ({ success, message, ...data })

const sendEmail = async ({ to, subject, html }) => {
  if (!RESEND_API_KEY) {
    const errorMessage = 'Missing RESEND_API_KEY environment variable.'
    console.error(errorMessage)
    return buildResponse(false, errorMessage, { error: 'Missing Resend API key' })
  }

  if (!FROM_EMAIL) {
    const errorMessage = 'Missing RESEND_FROM_EMAIL environment variable.'
    console.error(errorMessage)
    return buildResponse(false, errorMessage, { error: 'Missing sender email address' })
  }

  if (!to || !subject || !html) {
    const errorMessage = 'Invalid email payload. `to`, `subject`, and `html` are required.'
    console.error(errorMessage, { to, subject })
    return buildResponse(false, errorMessage, { error: 'Invalid email payload' })
  }

  try {
    const response = await resend.emails.send({
      from: `DocEase <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    })

    console.log(`Resend email sent to ${to}:`, response.id)
    return buildResponse(true, 'Email queued successfully.', { id: response.id })
  } catch (error) {
    console.error('Error sending email with Resend:', error)
    return buildResponse(false, 'Failed to send email.', { error: error?.message || 'Unknown error' })
  }
}

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

exports.sendDoctorCredentials = async (email, name, password) => {
  const html = getLayout(
    'Welcome to DocEase',
    `
    <h2>Welcome aboard, Dr. ${name.replace(/^(dr\\.?\\s*)+/gi, '').trim()}!</h2>
    <p>Your Doctor account has been created successfully.</p>
    <div class="box">
      <div class="box-item"><strong>Email/Username:</strong> ${email}</div>
      <div class="box-item"><strong>Temporary Password:</strong> ${password}</div>
    </div>
    <p>Please log in and change your password immediately upon first login.</p>
    `
  )

  return sendEmail({ to: email, subject: 'Your DocEase Account Credentials', html })
}
