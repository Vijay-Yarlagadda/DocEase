// Lightweight Firebase client initializer for the frontend (modular SDK v9+)
// Reads config from Vite env variables (VITE_FIREBASE_*)
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// Ensure these VITE_* variables are set in your project root .env (not committed):
// VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID,
// VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Allow supplying the entire config as a single JSON string (VITE_FIREBASE_CONFIG)
const rawConfig = import.meta.env.VITE_FIREBASE_CONFIG
if (rawConfig) {
  try {
    const parsed = typeof rawConfig === 'string' ? JSON.parse(rawConfig) : rawConfig
    Object.assign(firebaseConfig, parsed)
  } catch (err) {
    console.error('Failed to parse VITE_FIREBASE_CONFIG:', err)
  }
}

// Initialize app only once (Vite fast-refresh may re-run modules)
let firebaseApp = null
let auth = null

const hasConfig = firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
if (hasConfig) {
  try {
    firebaseApp = initializeApp(firebaseConfig)
    auth = getAuth(firebaseApp)
    console.log('Firebase client initialized')
  } catch (err) {
    console.error('Failed to initialize Firebase client:', err)
  }
} else {
  console.warn('Firebase client config missing. Provide VITE_FIREBASE_* vars or VITE_FIREBASE_CONFIG JSON to initialize.')
}

export { auth }
export default firebaseApp
