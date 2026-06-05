// Import Firebase auth and Firestore helpers
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase.js';

// Signup function accepts user details and stores them in Firestore
async function signup({ name, email, password, phone, role }) {
  try {
    // create the user with email/password
    console.info('[signup.js] creating Firebase Auth user for', email)
    let userCredential
    try {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error('[signup.js] createUserWithEmailAndPassword failed')
      console.error('Code:', err?.code)
      console.error('Message:', err?.message)
      console.error('Full error:', err)
      alert('Error: ' + (err?.message || 'Account creation failed'))
      return
    }
    const user = userCredential.user;
    console.info('[signup.js] Account created successfully', user?.uid)

    // now save extra details in Firestore under 'users' collection
    try {
      console.info('[signup.js] writing Firestore doc at users/' + user.uid)
      await setDoc(doc(db, 'users', user.uid), {
        name: name || '',
        email: email,
        phone: phone || '',
        role: role || 'patient',
        createdAt: serverTimestamp(),
      });
      console.info('[signup.js] User details saved to Firestore')
    } catch (firestoreError) {
      console.error('[signup.js] Error saving user details:')
      console.error('Code:', firestoreError?.code)
      console.error('Message:', firestoreError?.message)
      console.error('Full error:', firestoreError)
    }

  } catch (error) {
    console.error('[signup.js] Error creating account:', error)
    alert('Error: ' + (error?.message || 'Unknown error'))
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