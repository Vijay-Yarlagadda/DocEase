// Import Firebase auth and Firestore helpers
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase.js';

// Signup function accepts user details and stores them in Firestore
async function signup({ name, email, password, phone, role }) {
  try {
    // create the user with email/password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Account created successfully");

    // now save extra details in Firestore under 'users' collection
    try {
      await setDoc(doc(db, 'users', user.uid), {
        name: name || '',
        email: email,
        phone: phone || '',
        role: role || 'patient',
        createdAt: serverTimestamp(),
      });
      console.log("User details saved to Firestore");
    } catch (firestoreError) {
      console.error("Error saving user details:", firestoreError);
    }

  } catch (error) {
    console.error("Error creating account:", error.message);
    alert("Error: " + error.message);
  }
}

// Connect to HTML form
// we assume the form has inputs with ids: name, email, password, phone, role
const form = document.getElementById('signupForm');
if (form) {
  form.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent page reload

    const name = document.getElementById('name')?.value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const phone = document.getElementById('phone')?.value;
    const role = document.getElementById('role')?.value; // could be 'admin' or 'patient'

    // pass an object with all details
    signup({ name, email, password, phone, role });
  });
} else {
  console.warn('signupForm not found on page');
}