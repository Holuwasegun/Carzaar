import { db } from '../js/firebase-client.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

async function loadDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  const docSnap = await getDoc(doc(db, 'listings', id));

  if (docSnap.exists()) {
    const car = docSnap.data();
    document.getElementById('detail').innerHTML = `
      <h1>${car.make} ${car.model}</h1>
      <p>Price: N ${car.price.toLocaleString()}</p>
      <a href="https://wa.me/2349158461502?text=I'm%20interested%20in%20the%20${car.make}%20${car.model}" 
         class="btn btn-primary" target="_blank">Buy on WhatsApp</a>
    `;
  } else {
    document.getElementById('detail').innerHTML = 'Car not found.';
  }
}
loadDetail();
