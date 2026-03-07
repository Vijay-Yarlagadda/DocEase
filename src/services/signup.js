// Import Firebase auth
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase.js';

// Signup function
async function signup(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Account created successfully");
    // You can add more logic here, like redirecting or storing user data
  } catch (error) {
    console.error("Error creating account:", error.message);
    alert("Error: " + error.message);
  }
}

// Connect to HTML form
document.getElementById('signupForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent page reload

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  signup(email, password);
});