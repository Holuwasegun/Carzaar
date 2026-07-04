import { auth } from '../js/firebase-client.js';
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const form = document.getElementById('login-form');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = '/admin/listing-form.html';
  } catch (error) {
    document.getElementById('error').textContent = 'Login failed: ' + error.message;
  }
});
