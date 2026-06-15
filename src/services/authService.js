import { auth, secondaryAuth, db } from './firebase'
import { functions } from './firebase'
import { getFunctions, httpsCallable } from 'firebase/functions'
import api from './api'
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
export const SUPER_ADMIN_EMAIL = 'docease06@gmail.com'
export const SUPER_ADMIN_ROLE = 'superadmin'

export const doctorMustChangePassword = (doctor = {}) =>
  doctor.mustChangePassword === true || doctor.firstLogin === true

const isSuperAdminEmail = (email = '') =>
  email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()

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

const createSuperAdminFirestoreDoc = async (firebaseUser, normalizedEmail) => {
  if (!db || !firebaseUser?.uid) {
    throw new Error('Unable to create Super Admin Firestore document: missing Firestore or user UID.')
  }

  const userDocRef = doc(db, USERS_COLLECTION, firebaseUser.uid)
  const existingDoc = await getDoc(userDocRef)
  if (existingDoc.exists()) {
    const existingData = existingDoc.data() || {}
    if (existingData.role !== SUPER_ADMIN_ROLE || existingData.email !== normalizedEmail || existingData.mail !== normalizedEmail) {
      await setDoc(userDocRef, {
        email: normalizedEmail,
        mail: normalizedEmail,
        role: SUPER_ADMIN_ROLE,
        uid: firebaseUser.uid,
        updatedAt: serverTimestamp(),
      }, { merge: true })
      return await getDoc(userDocRef)
    }
    return existingDoc
  }

  await setDoc(userDocRef, {
    email: normalizedEmail,
    mail: normalizedEmail,
    role: SUPER_ADMIN_ROLE,
    uid: firebaseUser.uid,
    createdAt: serverTimestamp(),
  })

  return await getDoc(userDocRef)
}

export const forceCreateSuperAdmin = async (email, password, setupSecret) => {
  if (!email || !password) {
    throw new Error('Email and password are required to force create Super Admin.')
  }
  if (!isSuperAdminEmail(email)) {
    throw new Error('Force create is only available for the hidden Super Admin email.')
  }

  const normalizedEmail = email.trim().toLowerCase()

  const localProvision = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password)
      const firebaseUser = userCredential.user
      await createSuperAdminFirestoreDoc(firebaseUser, normalizedEmail)
      return { uid: firebaseUser.uid, email: firebaseUser.email, fallback: true }
    } catch (err) {
      if (err?.code === 'auth/email-already-in-use') {
        throw new Error('Super Admin email already exists in Firebase Auth. Reset the password in Firebase Console or delete the user and retry.')
      }
      throw err
    }
  }

  if (!functions) {
    return await localProvision()
  }

  try {
    const provisionSuperAdminFn = httpsCallable(functions, 'provisionSuperAdmin')
    const response = await provisionSuperAdminFn({
      email: normalizedEmail,
      password,
      setupSecret,
    })
    return response.data
  } catch (err) {
    console.warn('[authService] forceCreateSuperAdmin - remote provisioning failed, falling back to local auth create:', err)
    return await localProvision()
  }
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

    if (isSuperAdminEmail(email)) {
      throw new Error('This email address is reserved for super admin access.')
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

    if (isSuperAdminEmail(email)) {
      throw new Error('This email address is reserved for super admin access.')
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

    const normalizedEmail = email.trim().toLowerCase()
    const isSuperAdmin = isSuperAdminEmail(normalizedEmail)
    const expectedRole = isSuperAdmin ? SUPER_ADMIN_ROLE : role

    if (!expectedRole) {
      throw new Error('Please select a role')
    }

    // Special handling for Doctor login
    if (!isSuperAdmin && expectedRole === 'doctor') {
      return await doctorLogin(email, password)
    }

    // Authenticate with Firebase
    let firebaseUser
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      firebaseUser = userCredential.user
    } catch (signInError) {
      if (isSuperAdmin && signInError?.code === 'auth/user-not-found') {
        // If the hidden Super Admin email is not yet created in Firebase Auth,
        // create it automatically with the supplied password and continue.
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        firebaseUser = userCredential.user
      } else {
        throw signInError
      }
    }

    if (!firebaseUser) {
      throw new Error('Unable to authenticate Super Admin user')
    }

    // Get user document from Firestore to verify role
    let userDoc = await getDoc(doc(db, USERS_COLLECTION, firebaseUser.uid))

    if (!userDoc.exists()) {
      userDoc = await findUserDocByEmail(email)
      if (!userDoc && isSuperAdmin) {
        userDoc = await createSuperAdminFirestoreDoc(firebaseUser, normalizedEmail)
      }
      if (!userDoc) {
        throw new Error('User document not found in database')
      }
    }

    const userData = normalizeFirestoreUserDoc(userDoc.data(), firebaseUser.uid, firebaseUser.email)

    // Verify the selected role matches the user's actual role
    if (userData.role !== expectedRole) {
      throw new Error(
        `Invalid role. You are registered as a ${userData.role}, but tried to login as ${expectedRole}`
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

    if (doctorData.active === false) {
      throw new Error('This doctor account has been deactivated. Contact your hospital admin.')
    }

    // Authenticate with Firebase using the email and password
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    return {
      ...normalizeFirestoreUserDoc(doctorData, firebaseUser.uid, firebaseUser.email),
      role: 'doctor',
      doctorId: doctorDoc.id,
      mustChangePassword: doctorMustChangePassword(doctorData),
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
 * Fetch the full user profile from Firestore (users or doctors collection)
 */
export const fetchFullUserProfile = async (partialUser = {}) => {
  try {
    if (!db) return normalizeFirestoreUserDoc(partialUser, partialUser.uid, partialUser.email || partialUser.mail)

    const uid = partialUser.uid || auth.currentUser?.uid || ''
    const email = partialUser.email || partialUser.mail || auth.currentUser?.email || ''
    const role = partialUser.role || 'patient'

    if (role === 'doctor') {
      if (uid) {
        const doctorData = await fetchDoctorData(uid)
        if (doctorData) {
          return normalizeFirestoreUserDoc({ ...doctorData, role: 'doctor' }, uid, email)
        }
      }
      if (email) {
        const doctorDoc = await findDoctorDocByEmail(email)
        if (doctorDoc) {
          return normalizeFirestoreUserDoc({ ...doctorDoc.data(), role: 'doctor' }, doctorDoc.id, email)
        }
      }
    } else {
      if (uid) {
        const userData = await fetchUserData(uid)
        if (userData) {
          return normalizeFirestoreUserDoc(userData, uid, email)
        }
      }
      if (email) {
        const userDoc = await findUserDocByEmail(email)
        if (userDoc) {
          return normalizeFirestoreUserDoc(userDoc.data(), userDoc.id, email)
        }
      }
    }

    return normalizeFirestoreUserDoc(partialUser, uid, email)
  } catch (error) {
    console.warn('Failed to fetch full user profile:', error)
    return normalizeFirestoreUserDoc(partialUser, partialUser.uid, partialUser.email || partialUser.mail)
  }
}

/**
 * Update user profile in Firestore
 */
export const updateUserProfile = async (user, updates = {}) => {
  try {
    if (!user?.uid) throw new Error('User not found')

    const collectionName = user.role === 'doctor' ? DOCTORS_COLLECTION : USERS_COLLECTION
    const docRef = doc(db, collectionName, user.uid)

    const payload = {}
    if (updates.name !== undefined) {
      payload.name = updates.name.trim()
      payload.fullName = updates.name.trim()
    }
    if (updates.phone !== undefined) {
      payload.phone = updates.phone.trim()
    }
    if (updates.age !== undefined) {
      payload.age = updates.age
    }
    if (updates.place !== undefined) {
      payload.place = updates.place.trim()
    }

    await updateDoc(docRef, payload)

    return normalizeFirestoreUserDoc(
      { ...user, ...payload },
      user.uid,
      user.email || user.mail
    )
  } catch (error) {
    throw handleAuthError(error)
  }
}

export const updateCurrentUserPassword = async (currentPassword, newPassword, email) => {
  try {
    if (!currentPassword || !newPassword) {
      throw new Error('Both current and new passwords are required')
    }
    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters')
    }

    if (!auth.currentUser) {
      if (!email) throw new Error('No authenticated user; please provide email')
      await signInWithEmailAndPassword(auth, email, currentPassword)
    }

    const user = auth.currentUser
    const credential = EmailAuthProvider.credential(user.email, currentPassword)
    await reauthenticateWithCredential(user, credential)
    await updatePassword(user, newPassword)

    return true
  } catch (error) {
    throw handleAuthError(error)
  }
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
  tempPassword,
  qualification = '',
  specialization = '',
  experience = 0,
  hospitalId = 'default'
) => {
  try {
    if (!name || !email) throw new Error('Name and email are required')
    if (!tempPassword || tempPassword.length < 8) {
      throw new Error('Temporary password must be at least 8 characters')
    }

    // Prefer calling a backend Cloud Function to perform admin create (secure)
    if (functions) {
      try {
        const createDoctorFn = httpsCallable(functions, 'createDoctor')
        const res = await createDoctorFn({
          name,
          email,
          tempPassword,
          qualification,
          specialization,
          experience,
          hospitalId,
        })
        
        try {
          await api.post('/emails/send', {
            action: 'sendDoctorCredentials',
            payload: { email, name, password: tempPassword }
          })
        } catch (emailErr) {
          console.error('Failed to send doctor email via backend:', emailErr)
        }
        
        return res.data
      } catch (fnErr) {
        console.warn('createDoctor callable failed, falling back to client-side create:', fnErr)
      }
    }

    // Create Firebase Auth account on secondary auth so admin session stays active
    console.info('[authService] adminCreateDoctor - creating Firebase Auth user for', email)
    let userCredential
    try {
      userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, tempPassword)
    } catch (err) {
      console.error('[authService] adminCreateDoctor - createUserWithEmailAndPassword failed')
      throw handleAuthError(err)
    }
    const firebaseUser = userCredential.user
    console.info('[authService] adminCreateDoctor - Firebase user created', firebaseUser?.uid)

    const docRef = doc(db, DOCTORS_COLLECTION, firebaseUser.uid)
    try {
      await setDoc(docRef, {
        uid: firebaseUser.uid,
        name,
        email: firebaseUser.email,
        qualification,
        specialization,
        experience: Number(experience) || 0,
        hospitalId: hospitalId || 'default',
        mustChangePassword: true,
        firstLogin: true,
        active: true,
        role: 'doctor',
        createdAt: serverTimestamp(),
      })
    } catch (writeErr) {
      try { await firebaseUser.delete() } catch (e) { console.error('Rollback delete failed', e) }
      throw handleAuthError(writeErr)
    }

    try {
      await api.post('/emails/send', {
        action: 'sendDoctorCredentials',
        payload: { email: firebaseUser.email, name, password: tempPassword }
      })
    } catch (emailErr) {
      console.error('Failed to send doctor email via backend:', emailErr)
    }

    return {
      doctorId: firebaseUser.uid,
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      tempPassword,
      name,
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

    // Update password in Firebase Auth
    await updatePassword(user, newPassword)

    // Mark password change complete in Firestore
    const doctorDocRef = doc(db, DOCTORS_COLLECTION, user.uid)
    await updateDoc(doctorDocRef, {
      mustChangePassword: false,
      firstLogin: false,
      passwordChangedAt: serverTimestamp(),
    })

    return {
      uid: user.uid,
      email: user.email,
      mustChangePassword: false,
      role: 'doctor',
    }
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

  // Map common Firebase auth errors to clearer messages.
  if (error && error.code) {
    switch (error.code) {
      case 'auth/invalid-email':
        return new Error('Please enter a valid email address.')
      case 'auth/user-not-found':
        return new Error('User not found. Confirm your email or contact support.')
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return new Error('Invalid email or password. Check your credentials and try again.')
      case 'auth/email-already-in-use':
        return new Error('This email is already in use.')
      case 'auth/weak-password':
        return new Error('Password must be at least 6 characters.')
      case 'auth/too-many-requests':
        return new Error('Too many sign-in attempts. Please wait and try again later.')
      default:
        return error
    }
  }

  // Otherwise, preserve the original message when possible
  const message = error?.message || 'An authentication error occurred'
  return new Error(message)
}
