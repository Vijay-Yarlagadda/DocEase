import { auth, db } from './firebase'
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

const USERS_COLLECTION = 'users'
const DOCTORS_COLLECTION = 'doctors'

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
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    // Create Firestore user document
    await setDoc(doc(db, USERS_COLLECTION, firebaseUser.uid), {
      email: firebaseUser.email,
      role: 'admin',
      name: name,
      uid: firebaseUser.uid,
      createdAt: serverTimestamp(),
    })

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      role: 'admin',
      name: name,
    }
  } catch (error) {
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
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    // Create Firestore user document
    await setDoc(doc(db, USERS_COLLECTION, firebaseUser.uid), {
      email: firebaseUser.email,
      role: 'patient',
      name: name,
      uid: firebaseUser.uid,
      createdAt: serverTimestamp(),
    })

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      role: 'patient',
      name: name,
    }
  } catch (error) {
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
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, firebaseUser.uid))

    if (!userDoc.exists()) {
      throw new Error('User document not found in database')
    }

    const userData = userDoc.data()

    // Verify the selected role matches the user's actual role
    if (userData.role !== role) {
      throw new Error(
        `Invalid role. You are registered as a ${userData.role}, but tried to login as ${role}`
      )
    }

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      role: userData.role,
      name: userData.name,
    }
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
    const doctorsRef = collection(db, DOCTORS_COLLECTION)
    const q = query(doctorsRef, where('email', '==', email))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      throw new Error('Doctor not found. Please check your email.')
    }

    // Get doctor document
    const doctorDoc = querySnapshot.docs[0]
    const doctorData = doctorDoc.data()

    // Authenticate with Firebase using the email and password
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      role: 'doctor',
      name: doctorData.name,
      doctorId: doctorDoc.id,
      ...doctorData,
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
 * Handle Firebase errors and return user-friendly messages
 */
const handleAuthError = (error) => {
  let message = 'An authentication error occurred'

  if (error.code === 'auth/email-already-in-use') {
    message = 'Email is already registered. Please use a different email or try logging in.'
  } else if (error.code === 'auth/invalid-email') {
    message = 'Invalid email address'
  } else if (error.code === 'auth/weak-password') {
    message = 'Password is too weak. Use at least 8 characters.'
  } else if (error.code === 'auth/user-not-found') {
    message = 'User not found. Please check your email or sign up.'
  } else if (error.code === 'auth/wrong-password') {
    message = 'Incorrect password. Please try again.'
  } else if (error.code === 'auth/too-many-requests') {
    message = 'Too many login attempts. Please try again later.'
  } else if (error.message) {
    message = error.message
  }

  return new Error(message)
}
