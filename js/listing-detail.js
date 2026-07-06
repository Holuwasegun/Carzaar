import { databases, databaseId, storage, Query } from './appwrite-client.js';
import { getWhatsAppNumber, getWhatsAppUrl } from './whatsapp.js';
import { incrementCounter } from './counter.js';

const LISTINGS_COLLECTION = 'listings';
const LISTING_IMAGES_COLLECTION = 'listing_images';
const BUCKET_ID = 'car-images';

let currentImages = [];
let currentIndex = 0;
let listingData = null;

function getListingId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function formatPrice(price) {
  return '₦' + Number(price).toLocaleString('en-NG');
}

function formatMileage(km) {
  return Number(km).toLocaleString('en-NG') + ' km';
}

function getConditionClass(condition) {
  if (condition === 'Brand New') return 'brand-new';
  if (condition === 'Nigerian Used') return 'nigerian-used';
  return 'foreign-used';
}

function renderGallery() {
  const main = document.getElementById('galleryMain');
  const thumbs = document.getElementById('galleryThumbs');
  const prev = document.getElementById('galleryPrev');
  const next = document.getElementById('galleryNext');

  if (currentImages.length === 0) {
    main.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="450" fill="%23e9ecef"%3E%3Crect width="800" height="450"/%3E%3Ctext x="50%" y="50%" fill="%23adb5bd" font-size="18" text-anchor="middle" dy=".3em"%3ENo Image Available%3C/text%3E%3C/svg%3E';
    prev.style.display = 'none';
    next.style.display = 'none';
    return;
  }

  function showImage(index) {
    currentIndex = index;
    const img = currentImages[index];
    const url = storage.getFileView(BUCKET_ID, img.storageFileId);
    main.src = url;
    main.alt = `Car photo ${index + 1}`;

    thumbs.querySelectorAll('.gallery-thumb').forEach((thumb, i) => {
      thumb.classList.toggle('active', i === index);
    });

    prev.style.display = currentImages.length > 1 ? 'flex' : 'none';
    next.style.display = currentImages.length > 1 ? 'flex' : 'none';
  }

  thumbs.innerHTML = currentImages.map((img, i) => {
    const url = storage.getFileView(BUCKET_ID, img.storageFileId);
    return `<button class="gallery-thumb${i === 0 ? ' active' : ''}" data-index="${i}"><img src="${url}" alt="Thumbnail ${i + 1}" loading="lazy"></button>`;
  }).join('');

  thumbs.querySelectorAll('.gallery-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      showImage(parseInt(thumb.dataset.index));
    });
  });

  prev.addEventListener('click', () => {
    const i = (currentIndex - 1 + currentImages.length) % currentImages.length;
    showImage(i);
  });

  next.addEventListener('click', () => {
    const i = (currentIndex + 1) % currentImages.length;
    showImage(i);
  });

  showImage(0);
}

function renderListing(listing) {
  listingData = listing;
  const title = `${listing.make} ${listing.model} ${listing.year}`;

  document.title = `${title} — Carzaar`;

  document.getElementById('detailTitle').textContent = title;
  document.getElementById('detailPrice').textContent = formatPrice(listing.price);
  document.getElementById('detailLocation').textContent = listing.location || 'Nigeria';
  document.getElementById('detailDescription').textContent = listing.description || 'No description provided.';

  const badge = document.getElementById('detailConditionBadge');
  badge.textContent = listing.condition;
  badge.className = `condition-badge ${getConditionClass(listing.condition)}`;

  const statusEl = document.getElementById('detailStatus');
  statusEl.textContent = listing.status.charAt(0).toUpperCase() + listing.status.slice(1);
  statusEl.className = `status-badge ${listing.status}`;

  const overviewSpecs = document.getElementById('overviewSpecs');
  overviewSpecs.innerHTML = `
    <div class="spec-item"><div class="spec-item-label">Make</div><div class="spec-item-value">${listing.make}</div></div>
    <div class="spec-item"><div class="spec-item-label">Model</div><div class="spec-item-value">${listing.model}</div></div>
    <div class="spec-item"><div class="spec-item-label">Year</div><div class="spec-item-value">${listing.year}</div></div>
    <div class="spec-item"><div class="spec-item-label">Condition</div><div class="spec-item-value">${listing.condition}</div></div>
    <div class="spec-item"><div class="spec-item-label">Mileage</div><div class="spec-item-value">${formatMileage(listing.mileage)}</div></div>
    <div class="spec-item"><div class="spec-item-label">Price</div><div class="spec-item-value" style="font-weight:700;color:var(--color-accent)">${formatPrice(listing.price)}</div></div>
  `;

  const specsGrid = document.getElementById('specsGrid');
  const specs = [
    { label: 'Transmission', value: listing.transmission === 'automatic' ? 'Automatic' : 'Manual' },
    { label: 'Fuel Type', value: listing.fuel.charAt(0).toUpperCase() + listing.fuel.slice(1) },
    { label: 'Body Type', value: listing.bodyType.charAt(0).toUpperCase() + listing.bodyType.slice(1) },
    { label: 'Drivetrain', value: listing.drivetrain.toUpperCase() },
    { label: 'Color', value: listing.color },
    { label: 'Engine Capacity', value: listing.engineCapacity ? `${listing.engineCapacity}L` : 'N/A' },
    { label: 'Doors', value: listing.numberOfDoors || 'N/A' },
    { label: 'Seats', value: listing.numberOfSeats || 'N/A' },
    { label: 'VIN', value: listing.vin || 'N/A' },
    { label: 'Plate Number', value: listing.plateNumber || 'N/A' },
  ];
  specsGrid.innerHTML = specs.map(s => `
    <div class="spec-item">
      <div class="spec-item-label">${s.label}</div>
      <div class="spec-item-value">${s.value}</div>
    </div>
  `).join('');

  const historySpecs = document.getElementById('historySpecs');
  const historyItems = [
    { label: 'Previous Owners', value: listing.numberOfPreviousOwners != null ? listing.numberOfPreviousOwners : 'N/A' },
    { label: 'Accident History', value: listing.accidentHistory ? listing.accidentHistory.charAt(0).toUpperCase() + listing.accidentHistory.slice(1) : 'Unknown' },
    { label: 'Service History', value: listing.serviceHistoryAvailable ? 'Available' : 'Not Available' },
    { label: 'Spare Key', value: listing.hasSpareKey ? 'Yes' : 'No' },
    { label: 'Documentation', value: formatDocumentationStatus(listing.documentationStatus) },
    { label: 'Warranty Remaining', value: listing.warrantyRemaining ? 'Yes' : 'No' },
  ];
  historySpecs.innerHTML = historyItems.map(h => `
    <div class="spec-item">
      <div class="spec-item-label">${h.label}</div>
      <div class="spec-item-value">${h.value}</div>
    </div>
  `).join('');

  const featuresList = document.getElementById('featuresList');
  if (listing.features && listing.features.length > 0) {
    featuresList.innerHTML = listing.features.map(f => `<span class="feature-tag">${f}</span>`).join('');
  } else {
    featuresList.innerHTML = '<span style="font-size:var(--text-sm);color:var(--gray-500)">No features listed</span>';
  }

  setupWhatsAppButton(listing);
}

function formatDocumentationStatus(status) {
  if (!status) return 'N/A';
  const map = {
    'registered_valid_papers': 'Registered with Valid Papers',
    'registered_papers_pending': 'Registered, Papers Pending',
    'unregistered': 'Unregistered',
  };
  return map[status] || 'N/A';
}

function setupWhatsAppButton(listing) {
  const btn = document.getElementById('whatsappBtn');
  btn.addEventListener('click', async () => {
    try {
      const number = await getWhatsAppNumber();
      const title = `${listing.make} ${listing.model} ${listing.year}`;
      const url = getWhatsAppUrl(number, title);
      window.open(url, '_blank');
      incrementCounter(listing.$id, 'whatsappClickCount');
    } catch (err) {
      console.error('WhatsApp error:', err);
    }
  });
}

async function incrementViewCount(listingId) {
  incrementCounter(listingId, 'viewCount');
}

async function init() {
  const listingId = getListingId();
  if (!listingId) {
    document.getElementById('skeletonLoader').style.display = 'none';
    document.getElementById('listingDetail').style.display = 'block';
    document.getElementById('listingDetail').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-title">Listing not found</div>
        <p class="empty-state-text">No listing ID specified.</p>
        <a href="/" class="btn btn-primary">Browse cars</a>
      </div>
    `;
    return;
  }

  try {
    const [listing, imagesResponse] = await Promise.all([
      databases.getDocument(databaseId, LISTINGS_COLLECTION, listingId),
      databases.listDocuments(databaseId, LISTING_IMAGES_COLLECTION, [
        Query.equal('listingId', listingId),
        Query.orderAsc('sortOrder'),
      ]),
    ]);

    currentImages = imagesResponse.documents;

    document.getElementById('skeletonLoader').style.display = 'none';
    document.getElementById('listingDetail').style.display = 'block';

  renderListing(listing);
  renderGallery();

  if (listing.status === 'sold') {
    const gallery = document.getElementById('gallery');
    const overlay = document.createElement('div');
    overlay.className = 'sold-overlay sold-watermark';
    overlay.innerHTML = '<span>SOLD</span>';
    gallery.appendChild(overlay);
  }

  incrementViewCount(listingId);
  } catch (err) {
    console.error('Failed to load listing:', err);
    document.getElementById('skeletonLoader').style.display = 'none';
    document.getElementById('listingDetail').style.display = 'block';
    document.getElementById('listingDetail').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-title">Listing not found</div>
        <p class="empty-state-text">This car could not be found or may have been removed.</p>
        <a href="/" class="btn btn-primary">Browse cars</a>
      </div>
    `;
  }
}

init();
