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
  if (listing.status === 'sold') {
    btn.disabled = true;
    btn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      Sold
    `;
    return;
  }
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
