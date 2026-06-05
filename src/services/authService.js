import { auth, db } from './firebase'
import { functions } from './firebase'
import { httpsCallable } from 'firebase/functions'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import {
  doc,
  setDoc,
  getDoc,
  query,
  collection,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'
import { updateDoc } from 'firebase/firestore'
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth'

const USERS_COLLECTION = import.meta.env.VITE_FIRESTORE_USERS_COLLECTION || 'users'
const DOCTORS_COLLECTION = 'doctors'

const normalizeFirestoreUserDoc = (docData = {}, uid = '', fallbackEmail = '') => {
  const email = docData.email || docData.mail || fallbackEmail || ''
  return {
    uid: uid || docData.uid || '',
    email,
    role: docData.role || 'patient',
    name: docData.name || docData.fullName || '',
    ...docData,
    email,
    uid: uid || docData.uid || '',
  }
}

const findUserDocByEmail = async (email) => {
  const usersRef = collection(db, USERS_COLLECTION)
  let q = query(usersRef, where('email', '==', email))
  let snap = await getDocs(q)
  if (!snap.empty) return snap.docs[0]

  q = query(usersRef, where('mail', '==', email))
  snap = await getDocs(q)
  return snap.docs[0] || null
}

const findDoctorDocByEmail = async (email) => {
  const doctorsRef = collection(db, DOCTORS_COLLECTION)
  const queryByEmail = query(doctorsRef, where('email', '==', email))
  let querySnapshot = await getDocs(queryByEmail)
  if (!querySnapshot.empty) return querySnapshot.docs[0]

  const queryByMail = query(doctorsRef, where('mail', '==', email))
  querySnapshot = await getDocs(queryByMail)
  return querySnapshot.docs[0] || null
}


/**
 * Admin Signup - Create Firebase Auth & Firestore user doc
 */
export const adminSignup = async (email, password, name) => {
  try {
    // Validate inputs
    if (!email || !password || !name) {
      throw new Error('Email, password, and name are required')
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters')
    }

    // Create Firebase Auth account
    console.info('[authService] adminSignup - creating Firebase Auth user for', email)
    let userCredential
    try {
      userCredential = await createUserWithEmailAndPassword(auth, email, password)
    } catch (err) {
      console.error('[authService] adminSignup - createUserWithEmailAndPassword failed')
      console.error('Code:', err?.code)
      console.error('Message:', err?.message)
      console.error('Full error:', err)
      throw handleAuthError(err)
    }
    const firebaseUser = userCredential.user
    console.info('[authService] adminSignup - Firebase user created', firebaseUser?.uid)

    // Create Firestore user document. If this fails, roll back the created auth user to avoid orphan accounts.
    try {
      const userDocRef = doc(db, USERS_COLLECTION, firebaseUser.uid)
      console.info('[authService] adminSignup - writing Firestore doc at', `${USERS_COLLECTION}/${firebaseUser.uid}`)
      await setDoc(userDocRef, {
        email: firebaseUser.email,
        mail: firebaseUser.email,
        role: 'admin',
        name: name,
        uid: firebaseUser.uid,
        createdAt: serverTimestamp(),
      })
      console.info('[authService] adminSignup - Firestore write successful for', firebaseUser.uid)
    } catch (writeErr) {
      console.error('[authService] adminSignup - Firestore setDoc failed')
      console.error('Code:', writeErr?.code)
      console.error('Message:', writeErr?.message)
      console.error('Full error:', writeErr)
      // Attempt to remove the created Firebase Auth user
      try {
        await firebaseUser.delete()
      } catch (delErr) {
        console.error('[authService] adminSignup - Failed to delete orphan firebase user after Firestore write failed', delErr)
      }
      throw handleAuthError(writeErr)
    }

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      role: 'admin',
      name: name,
    }
  } catch (error) {
    console.error('[authService] adminSignup - caught error', error)
    if (error?.code) console.error('Code:', error.code)
    if (error?.message) console.error('Message:', error.message)
    throw handleAuthError(error)
  }
}

/**
 * Patient Signup - Create Firebase Auth & Firestore user doc
 */
export const patientSignup = async (email, password, name) => {
  try {
    // Validate inputs
    if (!email || !password || !name) {
      throw new Error('Email, password, and name are required')
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters')
    }

    // Create Firebase Auth account
    console.info('[authService] patientSignup - creating Firebase Auth user for', email)
    let userCredential
    try {
      userCredential = await createUserWithEmailAndPassword(auth, email, password)
    } catch (err) {
      console.error('[authService] patientSignup - createUserWithEmailAndPassword failed')
      console.error('Code:', err?.code)
      console.error('Message:', err?.message)
      console.error('Full error:', err)
      throw handleAuthError(err)
    }
    const firebaseUser = userCredential.user
    console.info('[authService] patientSignup - Firebase user created', firebaseUser?.uid)

    // Create Firestore user document. If this fails, roll back the created auth user to avoid orphan accounts.
    try {
      const userDocRef = doc(db, USERS_COLLECTION, firebaseUser.uid)
      console.info('[authService] patientSignup - writing Firestore doc at', `${USERS_COLLECTION}/${firebaseUser.uid}`)
      await setDoc(userDocRef, {
        email: firebaseUser.email,
        mail: firebaseUser.email,
        role: 'patient',
        name: name,
        uid: firebaseUser.uid,
        createdAt: serverTimestamp(),
      })
      console.info('[authService] patientSignup - Firestore write successful for', firebaseUser.uid)
    } catch (writeErr) {
      console.error('[authService] patientSignup - Firestore setDoc failed')
      console.error('Code:', writeErr?.code)
      console.error('Message:', writeErr?.message)
      console.error('Full error:', writeErr)
      try {
        await firebaseUser.delete()
      } catch (delErr) {
        console.error('[authService] patientSignup - Failed to delete orphan firebase user after Firestore write failed', delErr)
      }
      throw handleAuthError(writeErr)
    }

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      role: 'patient',
      name: name,
    }
  } catch (error) {
    console.error('[authService] patientSignup - caught error', error)
    if (error?.code) console.error('Code:', error.code)
    if (error?.message) console.error('Message:', error.message)
    throw handleAuthError(error)
  }
}

/**
 * Login - For Admin, Patient, and Doctor
 */
export const loginUser = async (email, password, role) => {
  try {
    // Validate inputs
    if (!email || !password) {
      throw new Error('Email and password are required')
    }

    if (!role) {
      throw new Error('Please select a role')
    }

    // Special handling for Doctor login
    if (role === 'doctor') {
      return await doctorLogin(email, password)
    }

    // For Admin and Patient, authenticate with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    // Get user document from Firestore to verify role
    let userDoc = await getDoc(doc(db, USERS_COLLECTION, firebaseUser.uid))

    if (!userDoc.exists()) {
      userDoc = await findUserDocByEmail(email)
      if (!userDoc) {
        throw new Error('User document not found in database')
      }
    }

    const userData = normalizeFirestoreUserDoc(userDoc.data(), firebaseUser.uid, firebaseUser.email)

    // Verify the selected role matches the user's actual role
    if (userData.role !== role) {
      throw new Error(
        `Invalid role. You are registered as a ${userData.role}, but tried to login as ${role}`
      )
    }

    return userData
  } catch (error) {
    throw handleAuthError(error)
  }
}

/**
 * Doctor Login - Search doctors collection, verify exists, then authenticate
 */
export const doctorLogin = async (email, password) => {
  try {
    // Validate inputs
    if (!email || !password) {
      throw new Error('Email and password are required')
    }

    // Search for doctor by email in doctors collection
    const doctorDoc = await findDoctorDocByEmail(email)

    if (!doctorDoc) {
      throw new Error('Doctor not found. Please check your email.')
    }

    const doctorData = doctorDoc.data()

    // Authenticate with Firebase using the email and password
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    return {
      ...normalizeFirestoreUserDoc(doctorData, firebaseUser.uid, firebaseUser.email),
      role: 'doctor',
      doctorId: doctorDoc.id,
    }
  } catch (error) {
    throw handleAuthError(error)
  }
}

/**
 * Logout - Sign out from Firebase
 */
export const logoutUser = async () => {
  try {
    await signOut(auth)
    localStorage.removeItem('docease_token')
    localStorage.removeItem('docease_user')
    return true
  } catch (error) {
    throw handleAuthError(error)
  }
}

/**
 * Get current user from Firebase
 */
export const getCurrentUser = () => {
  return auth.currentUser
}

/**
 * Fetch user data from Firestore
 */
export const fetchUserData = async (uid) => {
  try {
    if (!uid) {
      throw new Error('UID is required')
    }

    const userDoc = await getDoc(doc(db, USERS_COLLECTION, uid))

    if (!userDoc.exists()) {
      return null
    }

    return userDoc.data()
  } catch (error) {
    throw handleAuthError(error)
  }
}

/**
 * Generate a random temporary password
 */
export const generateTempPassword = (length = 12) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?'
  let pw = ''
  for (let i = 0; i < length; i++) pw += chars.charAt(Math.floor(Math.random() * chars.length))
  return pw
}

/**
 * Admin creates a doctor: creates Firebase Auth account and doctor document
 * Returns { doctorId, uid, email, tempPassword }
 */
export const adminCreateDoctor = async (
  name,
  email,
  qualification = '',
  specialization = '',
  experience = 0,
  hospitalId = null
) => {
  try {
    if (!name || !email) throw new Error('Name and email are required')

    // Prefer calling a backend Cloud Function to perform admin create (secure)
    if (functions) {
      try {
        const createDoctorFn = httpsCallable(functions, 'createDoctor')
        const res = await createDoctorFn({ name, email, qualification, specialization, experience, hospitalId })
        return res.data
      } catch (fnErr) {
        // fall back to client-side creation if function call fails
        console.warn('createDoctor callable failed, falling back to client-side create:', fnErr)
      }
    }

    const tempPassword = generateTempPassword(12)

    // Create Firebase Auth account for doctor (fallback)
    console.info('[authService] adminCreateDoctor - creating Firebase Auth user for', email)
    let userCredential
    try {
      userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword)
    } catch (err) {
      console.error('[authService] adminCreateDoctor - createUserWithEmailAndPassword failed')
      console.error('Code:', err?.code)
      console.error('Message:', err?.message)
      console.error('Full error:', err)
      throw handleAuthError(err)
    }
    const firebaseUser = userCredential.user
    console.info('[authService] adminCreateDoctor - Firebase user created', firebaseUser?.uid)

    // Save doctor document using the Firebase UID as the doc ID
    const docRef = doc(db, DOCTORS_COLLECTION, firebaseUser.uid)
    try {
      console.info('[authService] adminCreateDoctor - writing Firestore doc at', `${DOCTORS_COLLECTION}/${firebaseUser.uid}`)
      await setDoc(docRef, {
        uid: firebaseUser.uid,
        name,
        email: firebaseUser.email,
        qualification,
        specialization,
        experience: Number(experience) || 0,
        hospitalId: hospitalId || null,
        firstLogin: true,
        createdAt: serverTimestamp(),
      })
      console.info('[authService] adminCreateDoctor - Firestore write successful for', firebaseUser.uid)
    } catch (writeErr) {
      console.error('[authService] adminCreateDoctor - Firestore setDoc failed')
      console.error('Code:', writeErr?.code)
      console.error('Message:', writeErr?.message)
      console.error('Full error:', writeErr)
      // Roll back auth user if Firestore write fails
      try { await firebaseUser.delete() } catch (e) { console.error('Rollback delete failed', e) }
      throw handleAuthError(writeErr)
    }

    // Return the temp password so the admin can show it once
    return {
      doctorId: firebaseUser.uid,
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      tempPassword,
    }
  } catch (error) {
    throw handleAuthError(error)
  }
}

/**
 * Change doctor's password on first login. Re-authenticates then updates password
 * Accepts currentPassword and newPassword. If no signed-in user, `email` may be provided.
 */
export const doctorChangePassword = async (currentPassword, newPassword, email) => {
  try {
    if (!currentPassword || !newPassword) throw new Error('Both current and new passwords are required')
    if (newPassword.length < 8) throw new Error('New password must be at least 8 characters')

    // Ensure user is signed in; if not, sign in with provided email
    if (!auth.currentUser) {
      if (!email) throw new Error('No authenticated user; please provide email')
      await signInWithEmailAndPassword(auth, email, currentPassword)
    }

    const user = auth.currentUser
    if (!user) throw new Error('Unable to determine authenticated user')

    // Reauthenticate with current password
    const credential = EmailAuthProvider.credential(user.email, currentPassword)
    await reauthenticateWithCredential(user, credential)

    // Update password
    await updatePassword(user, newPassword)

    // Mark firstLogin false in doctors collection (doc ID uses uid)
    const doctorDocRef = doc(db, DOCTORS_COLLECTION, user.uid)
    await updateDoc(doctorDocRef, { firstLogin: false })

    return { uid: user.uid, email: user.email }
  } catch (error) {
    throw handleAuthError(error)
  }
}

/**
 * Get all doctors for admin listing
 */
export const getAllDoctors = async () => {
  try {
    const doctorsRef = collection(db, DOCTORS_COLLECTION)
    const snap = await getDocs(doctorsRef)
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch (error) {
    throw handleAuthError(error)
  }
}

/**
 * Fetch doctor data by UID
 */
export const fetchDoctorData = async (uid) => {
  try {
    if (!uid) throw new Error('UID is required')
    const docSnap = await getDoc(doc(db, DOCTORS_COLLECTION, uid))
    if (!docSnap.exists()) return null
    return docSnap.data()
  } catch (error) {
    throw handleAuthError(error)
  }
}

/**
 * Handle Firebase errors and return user-friendly messages
 */
const handleAuthError = (error) => {
  // Log full error to help debugging (shows code and message in browser console)
  console.error('[authService] handleAuthError - full error object:', error)
  if (error?.code) console.error('[authService] handleAuthError - code:', error.code)
  if (error?.message) console.error('[authService] handleAuthError - message:', error.message)

  // If this is a FirebaseError (has a code), return it unchanged so callers/UI can display the exact message.
  if (error && error.code) {
    return error
  }

  // Otherwise, preserve the original message when possible
  const message = error?.message || 'An authentication error occurred'
  return new Error(message)
}
