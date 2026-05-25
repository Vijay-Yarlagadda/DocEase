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
