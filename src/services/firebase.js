// Initialize Firebase client (modular SDK)
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Firebase config - Replace with your Firebase project keys
const firebaseConfig = {
  apiKey: "AIzaSyDnAxzfFsYw0Zq6SqSUOYAux90tbKfr3_8",
  authDomain: "docease-0406dike.firebaseapp.com",
  projectId: "docease-0406dike",
  storageBucket: "docease-0406dike.firebasestorage.app",
  messagingSenderId: "894991232962",
  appId: "1:894991232962:web:072dfdf5dd283b0be4b05b",
  measurementId: "G-ECZC22BC74"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };