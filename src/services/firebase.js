// Initialize Firebase client (modular SDK)
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Firebase config (client keys). These are safe to keep client-side but you may prefer Vite env vars.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyD9a9zO22-hjrbiieRRX2bRWhUxLK7Hf1c',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'docease-62051.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'docease-62051',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'docease-62051.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '452831225927',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:452831225927:web:7bcd63858e88247ab9e962',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-XW84E8VGZ5',
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

console.log('Firebase client initialized (services/firebase.js)')

export { app, auth, db }
export default app