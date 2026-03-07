// Initialize Firebase client (modular SDK)
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Firebase config - use environment variables or placeholders
// Make sure to set these in your .env or Vite config files
const firebaseConfig = {
  apiKey: "AIzaSyDnAxzfFsYw0Zq6SqSUOYAux90tbKfr3_8",
  authDomain: "docease-0406dike.firebaseapp.com",
  projectId: "docease-0406dike",
  storageBucket: "docease-0406dike.appspot.com",
  messagingSenderId: "103355555555",
  appId: "1:docease-0406dike:web:1c5f4f4f4f4f",
  measurementId: "G-XXXXXXXXXX"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };