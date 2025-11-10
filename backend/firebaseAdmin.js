import admin from 'firebase-admin'

// Expect FIREBASE_SERVICE_ACCOUNT to be a base64-encoded JSON service account
// or FIREBASE_SERVICE_ACCOUNT_PATH to point to a local JSON file
const initFirebase = () => {
  if (admin.apps && admin.apps.length) return admin

  let serviceAccount = null
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const json = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf8')
      serviceAccount = JSON.parse(json)
    } catch (err) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT from env:', err.message)
    }
  }

  if (!serviceAccount && process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    try {
      serviceAccount = JSON.parse(require('fs').readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8'))
    } catch (err) {
      console.error('Failed to read FIREBASE_SERVICE_ACCOUNT_PATH:', err.message)
    }
  }

  if (!serviceAccount) {
    console.warn('No Firebase service account provided. Firebase Admin will not be initialized.')
    return admin
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id
  })

  console.log('✅ Firebase Admin initialized')
  return admin
}

export default initFirebase()
