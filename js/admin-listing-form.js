import { db, storage } from './firebase-client.js';
import { collection, addDoc, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';
import { validators } from './validation.js';

const form = document.getElementById('add-form');
const featuresContainer = document.getElementById('features-container');

// Load features on page load
async function loadFeatures() {
  const snapshot = await getDocs(collection(db, 'features'));
  featuresContainer.innerHTML = snapshot.docs.map(doc => `
    <label><input type="checkbox" name="feature" value="${doc.id}"> ${doc.data().label}</label>
  `).join('');
}
loadFeatures();

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const docStatus = document.getElementById('doc_status').value;
  const data = {
    make: document.getElementById('make').value,
    model: document.getElementById('model').value,
    year: parseInt(document.getElementById('year').value),
    price: parseInt(document.getElementById('price').value),
    vin: document.getElementById('vin').value,
    plate_number: document.getElementById('plate_number').value,
    mileage: parseInt(document.getElementById('mileage').value),
    number_of_previous_owners: parseInt(document.getElementById('prev_owners').value),
    engine_capacity: parseFloat(document.getElementById('engine_cap').value),
    accident_history: document.getElementById('accident_history').value,
    documentation_status: docStatus,
    created_at: new Date()
  };

  // Run validations
  const error = validators.price(data.price) || 
                validators.year(data.year) || 
                validators.vin(data.vin) || 
                validators.plateNumber(data.plate_number, docStatus) ||
                validators.mileage(data.mileage) ||
                validators.owners(data.number_of_previous_owners);
                
  if (error) {
    alert(error);
    return;
  }

  const file = document.getElementById('image-upload').files[0];
  const storageRef = ref(storage, 'listings/' + Date.now());
  const snapshot = await uploadBytes(storageRef, file);
  data.imageUrl = await getDownloadURL(snapshot.ref);

  await addDoc(collection(db, 'listings'), data);
  alert('Listing uploaded!');
  form.reset();
});
