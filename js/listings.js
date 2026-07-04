import { db } from './firebase-client.js';
import { collection, getDocs, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

async function fetchListings() {
  const grid = document.getElementById('listings');
  try {
    const snapshot = await getDocs(query(collection(db, 'listings'), orderBy('created_at', 'desc')));
    
    if (snapshot.empty) {
      grid.innerHTML = '<p>No cars available at the moment.</p>';
      return;
    }

    grid.innerHTML = snapshot.docs.map(doc => {
      const car = doc.data();
      return `
        <div class="card">
          <img src="${car.imageUrl}" alt="${car.make}" style="width: 100%; height: 200px; object-fit: cover;">
          <div class="listing-content">
            <h2 style="font-size: var(--text-lg);">${car.make} ${car.model} (${car.year})</h2>
            <p style="font-size: var(--text-xl); font-weight: 700; color: var(--color-accent); margin-bottom: var(--space-md);">N ${car.price.toLocaleString()}</p>
            <a href="listings/detail.html?id=${doc.id}" class="btn btn-primary" style="width:100%;">View Details</a>
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error("Error:", error);
    grid.innerHTML = '<p>Error loading listings.</p>';
  }
}
fetchListings();
