import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

const firebaseConfig = {
  apiKey: "AIzaSyBe3jNRbB2S_PmTZi4auG3C2jE4vWIuc2c",
  authDomain: "carzaar-66af3.firebaseapp.com",
  projectId: "carzaar-66af3",
  storageBucket: "carzaar-66af3.firebasestorage.app",
  messagingSenderId: "11321447692",
  appId: "1:11321447692:web:deb220d67623c84992e529"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
