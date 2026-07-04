import { db } from './firebase-client.js';
import { collection, getDocs, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

async function loadListings() {
  const snapshot = await getDocs(collection(db, 'listings'));
  const tbody = document.getElementById('body');
  tbody.innerHTML = '';
  
  snapshot.forEach(docSnap => {
    const car = docSnap.data();
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${car.make}</td><td>${car.model}</td>
      <td><button onclick="deleteListing('${docSnap.id}')">Delete</button></td>
    `;
    tbody.appendChild(row);
  });
}

window.deleteListing = async (id) => {
  await deleteDoc(doc(db, 'listings', id));
  loadListings();
};

loadListings();
