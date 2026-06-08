const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp()
const db = admin.firestore()

// Callable function to create a doctor account securely using Admin SDK
exports.createDoctor = functions.https.onCall(async (data, context) => {
  // Ensure request is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.')
  }

  // Ensure caller is admin via custom claim
  const callerClaims = context.auth.token || {}
  if (!callerClaims.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can create doctor accounts.')
  }

  const { name, email, qualification = '', specialization = '', experience = 0, hospitalId = null } = data || {}
  if (!name || !email) {
    throw new functions.https.HttpsError('invalid-argument', 'Name and email are required')
  }

  // Generate a temporary password
  const generateTempPassword = (len = 12) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?'
    let pw = ''
    for (let i = 0; i < len; i++) pw += chars.charAt(Math.floor(Math.random() * chars.length))
    return pw
  }

  const tempPassword = generateTempPassword(12)

  try {
    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password: tempPassword,
      displayName: name,
    })

    // Create the doctor document in Firestore
    const docRef = db.collection('doctors').doc(userRecord.uid)
    await docRef.set({
      uid: userRecord.uid,
      name,
      email,
      qualification,
      specialization,
      experience: Number(experience) || 0,
      hospitalId: hospitalId || null,
      firstLogin: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    return { uid: userRecord.uid, email: userRecord.email, tempPassword }
  } catch (err) {
    console.error('createDoctor error', err)
    // Cleanup if user created but doc write failed
    if (err.code && err.code.startsWith('auth/')) {
      throw new functions.https.HttpsError('internal', err.message)
    }
    throw new functions.https.HttpsError('internal', err.message || 'Unable to create doctor')
  }
})

const SUPER_ADMIN_EMAIL = 'docease06@gmail.com'
const DEFAULT_SUPER_ADMIN_SETUP_SECRET = 'DocEaseSuperAdminForceCreate123!'

exports.provisionSuperAdmin = functions.https.onCall(async (data, context) => {
  const { email, password, setupSecret } = data || {}
  if (!email || !password) {
    throw new functions.https.HttpsError('invalid-argument', 'Email and password are required')
  }

  if (email.trim().toLowerCase() !== SUPER_ADMIN_EMAIL) {
    throw new functions.https.HttpsError('permission-denied', 'Invalid Super Admin email')
  }

  const secret = setupSecret || ''
  const configuredSecret = functions.config().superadmin?.secret || process.env.SUPER_ADMIN_SETUP_SECRET || DEFAULT_SUPER_ADMIN_SETUP_SECRET

  if (secret !== configuredSecret) {
    throw new functions.https.HttpsError('permission-denied', 'Invalid setup secret')
  }

  if (password.length < 8) {
    throw new functions.https.HttpsError('invalid-argument', 'Password must be at least 8 characters')
  }

  try {
    let userRecord
    try {
      userRecord = await admin.auth().getUserByEmail(email)
      userRecord = await admin.auth().updateUser(userRecord.uid, { password })
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        userRecord = await admin.auth().createUser({ email, password })
      } else {
        throw err
      }
    }

    const userDocRef = db.collection('users').doc(userRecord.uid)
    await userDocRef.set({
      email: userRecord.email,
      mail: userRecord.email,
      role: 'superadmin',
      uid: userRecord.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true })

    return { uid: userRecord.uid, email: userRecord.email, createdAt: new Date().toISOString() }
  } catch (err) {
    console.error('provisionSuperAdmin error', err)
    throw new functions.https.HttpsError('internal', err.message || 'Unable to provision Super Admin')
  }
})
