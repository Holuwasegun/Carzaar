import { db } from './firebase-client.js';
import { collection, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

async function fetchListings(filters = {}) {
  const grid = document.getElementById('listings');
  grid.innerHTML = '<p>Loading...</p>';
  
  try {
    let q = collection(db, 'listings');
    const constraints = [];

    if (filters.make) constraints.push(where('make', '==', filters.make));
    
    const queryRef = constraints.length > 0 ? query(q, ...constraints) : q;
    const snapshot = await getDocs(queryRef);
    
    let docs = snapshot.docs;
    
    // Client-side filtering for ranges
    if (filters.minPrice) docs = docs.filter(d => d.data().price >= filters.minPrice);
    if (filters.maxPrice) docs = docs.filter(d => d.data().price <= filters.maxPrice);

    if (docs.length === 0) {
      grid.innerHTML = '<p>No cars match your filters.</p>';
      return;
    }

    grid.innerHTML = docs.map(doc => {
      const car = doc.data();
      return `
        <div class="card" style="border: 1px solid #ccc; padding: 1rem; margin: 1rem 0;">
          <img src="${car.imageUrl}" alt="${car.make}" style="width: 100%; height: 200px; object-fit: cover;">
          <h2>${car.make} ${car.model} (${car.year})</h2>
          <p>Price: N ${car.price.toLocaleString()}</p>
          <a href="listings/detail.html?id=${doc.id}" class="btn btn-primary">View Details</a>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error("Error fetching listings:", error);
    grid.innerHTML = '<p>Error loading listings.</p>';
  }
}

window.applyFilters = () => {
  fetchListings({
    make: document.getElementById('filter-make').value,
    minPrice: parseInt(document.getElementById('min-price').value),
    maxPrice: parseInt(document.getElementById('max-price').value)
  });
};

fetchListings();
