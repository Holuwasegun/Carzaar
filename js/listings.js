import { databases, databaseId, storage, Query } from './appwrite-client.js';

const LISTINGS_COLLECTION = 'listings';
const PAGE_SIZE = 12;
const BUCKET_ID = 'car-images';

let allListings = [];
let filteredListings = [];
let displayedCount = 0;
let lastDocument = null;
let hasMore = true;
let isLoading = false;

const listingsGrid = document.getElementById('listingsGrid');
const loadMoreBtn = document.getElementById('loadMore');
const resultsCount = document.getElementById('resultsCount');
const emptyState = document.getElementById('emptyState');
const sortSelect = document.getElementById('sortSelect');
const resetFiltersBtn = document.getElementById('resetFilters');

const filterElements = {
  location: document.getElementById('filterLocation'),
  priceMin: document.getElementById('filterPriceMin'),
  priceMax: document.getElementById('filterPriceMax'),
  yearMin: document.getElementById('filterYearMin'),
  yearMax: document.getElementById('filterYearMax'),
  mileageMin: document.getElementById('filterMileageMin'),
  mileageMax: document.getElementById('filterMileageMax'),
};

async function fetchListings() {
  const queries = [
    Query.equal('status', 'available'),
    Query.orderDesc('$createdAt'),
    Query.limit(PAGE_SIZE),
  ];
  return await databases.listDocuments(databaseId, LISTINGS_COLLECTION, queries);
}

async function fetchMoreListings() {
  if (!lastDocument || !hasMore || isLoading) return;
  isLoading = true;
  loadMoreBtn.textContent = 'Loading...';
  loadMoreBtn.disabled = true;

  try {
    const queries = [
      Query.equal('status', 'available'),
      Query.orderDesc('$createdAt'),
      Query.limit(PAGE_SIZE),
      Query.cursorAfter(lastDocument),
    ];

    const response = await databases.listDocuments(databaseId, LISTINGS_COLLECTION, queries);
    const newDocs = response.documents;

    if (newDocs.length < PAGE_SIZE) {
      hasMore = false;
    }

    allListings = [...allListings, ...newDocs];
    lastDocument = newDocs.length > 0 ? newDocs[newDocs.length - 1] : null;

    displayedCount += PAGE_SIZE;
    await applyFilters();
  } catch (err) {
    console.error('Load more error:', err);
    showToast('Failed to load more listings', 'error');
  } finally {
    isLoading = false;
    loadMoreBtn.disabled = false;
    loadMoreBtn.textContent = 'Load more cars';
  }
}

async function getAllImagesMap(listingIds) {
  const map = {};
  const chunkSize = 25;
  for (let i = 0; i < listingIds.length; i += chunkSize) {
    const chunk = listingIds.slice(i, i + chunkSize);
    try {
      const response = await databases.listDocuments(databaseId, 'listing_images', [
        Query.equal('listingId', chunk),
        Query.orderAsc('sortOrder'),
        Query.limit(50),
      ]);
      for (const doc of response.documents) {
        if (!map[doc.listingId]) map[doc.listingId] = [];
        map[doc.listingId].push(doc);
      }
    } catch (err) {
      console.warn('Failed to fetch images chunk:', err);
    }
  }
  return map;
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

function getListingTitle(listing) {
  return `${listing.make} ${listing.model} ${listing.year}`;
}

function renderCard(listing, firstImageUrl) {
  const title = getListingTitle(listing);
  const imgSrc = firstImageUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="%23e9ecef"%3E%3Crect width="400" height="300"/%3E%3Ctext x="50%" y="50%" fill="%23adb5bd" font-size="16" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';

  return `
    <article class="card" role="listitem" data-id="${listing.$id}" onclick="window.location.href='/listings/detail.html?id=${listing.$id}'">
      <div class="card-image">
        <img src="${imgSrc}" alt="${title}" loading="lazy">
        <span class="condition-badge ${getConditionClass(listing.condition)}">${listing.condition === 'Foreign Used (Tokunbo)' ? 'Tokunbo' : listing.condition === 'Nigerian Used' ? 'Nigerian Used' : 'Brand New'}</span>
      </div>
      <div class="card-body">
        <div class="card-title">${title}${listing.color ? ` (${listing.color})` : ''}</div>
        <div class="card-price">${formatPrice(listing.price)}</div>
        <div class="card-meta">
          <span class="location">${listing.location || 'Nigeria'}</span>
          <span>·</span>
          <span class="mileage">${formatMileage(listing.mileage)}</span>
        </div>
      </div>
    </article>
  `;
}

function renderSkeletons() {
  return Array(6).fill(`
    <div class="skeleton-card" role="presentation" aria-hidden="true">
      <div class="skeleton skeleton-image"></div>
      <div class="skeleton-body">
        <div class="skeleton skeleton-line"></div>
        <div class="skeleton skeleton-line" style="height:24px;width:50%"></div>
        <div class="skeleton skeleton-line"></div>
      </div>
    </div>
  `).join('');
}

function showSkeletons() {
  listingsGrid.innerHTML = renderSkeletons();
  resultsCount.textContent = 'Loading...';
}

function updateResultsCount(count) {
  resultsCount.textContent = `${count} car${count !== 1 ? 's' : ''} match your search`;
}

function getFilterState() {
  const makeChecks = document.querySelectorAll('#makeChecklist input:checked');
  const conditionChecks = document.querySelectorAll('#conditionChecklist input:checked');
  const transmissionChecks = document.querySelectorAll('#transmissionChecklist input:checked');
  const bodyTypeChecks = document.querySelectorAll('#bodyTypeChecklist input:checked');
  const colorChecks = document.querySelectorAll('#colorChecklist input:checked');
  const fuelChecks = document.querySelectorAll('#fuelChecklist input:checked');

  return {
    location: filterElements.location.value.toLowerCase().trim(),
    priceMin: filterElements.priceMin.value ? Number(filterElements.priceMin.value) : null,
    priceMax: filterElements.priceMax.value ? Number(filterElements.priceMax.value) : null,
    yearMin: filterElements.yearMin.value ? Number(filterElements.yearMin.value) : null,
    yearMax: filterElements.yearMax.value ? Number(filterElements.yearMax.value) : null,
    mileageMin: filterElements.mileageMin.value ? Number(filterElements.mileageMin.value) : null,
    mileageMax: filterElements.mileageMax.value ? Number(filterElements.mileageMax.value) : null,
    makes: Array.from(makeChecks).map(c => c.value),
    conditions: Array.from(conditionChecks).map(c => c.value),
    transmissions: Array.from(transmissionChecks).map(c => c.value),
    bodyTypes: Array.from(bodyTypeChecks).map(c => c.value),
    colors: Array.from(colorChecks).map(c => c.value),
    fuels: Array.from(fuelChecks).map(c => c.value),
  };
}

function filterListings(listings, filters) {
  return listings.filter(listing => {
    if (listing.status !== 'available') return false;

    if (filters.location) {
      const loc = (listing.location || '').toLowerCase();
      if (!loc.includes(filters.location)) return false;
    }

    if (filters.priceMin !== null && listing.price < filters.priceMin) return false;
    if (filters.priceMax !== null && listing.price > filters.priceMax) return false;
    if (filters.yearMin !== null && listing.year < filters.yearMin) return false;
    if (filters.yearMax !== null && listing.year > filters.yearMax) return false;
    if (filters.mileageMin !== null && listing.mileage < filters.mileageMin) return false;
    if (filters.mileageMax !== null && listing.mileage > filters.mileageMax) return false;

    if (filters.makes.length && !filters.makes.includes(listing.make)) return false;
    if (filters.conditions.length && !filters.conditions.includes(listing.condition)) return false;
    if (filters.transmissions.length && !filters.transmissions.includes(listing.transmission)) return false;
    if (filters.bodyTypes.length && !filters.bodyTypes.includes(listing.bodyType)) return false;
    if (filters.colors.length && !filters.colors.includes(listing.color)) return false;
    if (filters.fuels.length && !filters.fuels.includes(listing.fuel)) return false;

    return true;
  });
}

function sortListings(listings, sortKey) {
  const sorted = [...listings];
  switch (sortKey) {
    case 'price-asc':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'newest':
    default:
      sorted.sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt));
      break;
  }
  return sorted;
}

function updateChecklistCounts() {
  const filters = getFilterState();

  document.querySelectorAll('#makeChecklist label').forEach(label => {
    const checkbox = label.querySelector('input');
    const countEl = label.querySelector('.count');
    const count = allListings.filter(l => {
      if (l.status !== 'available') return false;
      if (checkbox.checked) return l.make === checkbox.value;
      return true;
    }).length;
    countEl.textContent = `(${count})`;
  });

  document.querySelectorAll('#conditionChecklist label').forEach(label => {
    const checkbox = label.querySelector('input');
    const countEl = label.querySelector('.count');
    const count = allListings.filter(l => l.status === 'available' && l.condition === checkbox.value).length;
    countEl.textContent = `(${count})`;
  });

  document.querySelectorAll('#transmissionChecklist label').forEach(label => {
    const checkbox = label.querySelector('input');
    const countEl = label.querySelector('.count');
    const count = allListings.filter(l => l.status === 'available' && l.transmission === checkbox.value).length;
    countEl.textContent = `(${count})`;
  });

  document.querySelectorAll('#bodyTypeChecklist label').forEach(label => {
    const checkbox = label.querySelector('input');
    const countEl = label.querySelector('.count');
    const count = allListings.filter(l => l.status === 'available' && l.bodyType === checkbox.value).length;
    countEl.textContent = `(${count})`;
  });

  document.querySelectorAll('#colorChecklist label').forEach(label => {
    const checkbox = label.querySelector('input');
    const countEl = label.querySelector('.count');
    const count = allListings.filter(l => l.status === 'available' && l.color === checkbox.value).length;
    countEl.textContent = `(${count})`;
  });

  document.querySelectorAll('#fuelChecklist label').forEach(label => {
    const checkbox = label.querySelector('input');
    const countEl = label.querySelector('.count');
    const count = allListings.filter(l => l.status === 'available' && l.fuel === checkbox.value).length;
    countEl.textContent = `(${count})`;
  });
}

async function applyFilters() {
  const filters = getFilterState();
  let results = filterListings(allListings, filters);
  results = sortListings(results, sortSelect.value);

  filteredListings = results;
  updateResultsCount(filteredListings.length);

  if (filteredListings.length === 0) {
    listingsGrid.innerHTML = '';
    emptyState.style.display = 'flex';
    loadMoreBtn.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';

  const showCount = Math.min(displayedCount > 0 ? displayedCount : PAGE_SIZE, filteredListings.length);
  const displayListings = filteredListings.slice(0, showCount);
  const listingIds = displayListings.map(l => l.$id);
  const imagesMap = await getAllImagesMap(listingIds);

  let html = '';
  for (const listing of displayListings) {
    const images = imagesMap[listing.$id] || [];
    const firstImage = images.length > 0 ? images[0] : null;
    let imgUrl = null;
    if (firstImage) {
      try {
        imgUrl = storage.getFileView(BUCKET_ID, firstImage.storageFileId);
      } catch {}
    }
    html += renderCard(listing, imgUrl);
  }

  listingsGrid.innerHTML = html;
  updateChecklistCounts();
  updateMakeChips(results);

  const hasMoreToShow = displayedCount < filteredListings.length;
  loadMoreBtn.style.display = hasMoreToShow || hasMore ? 'flex' : 'none';
}

function updateMakeChips(listings) {
  const chipContainer = document.getElementById('quickMakeChips');
  const makes = [...new Set(listings.filter(l => l.status === 'available').map(l => l.make))].slice(0, 6);
  chipContainer.innerHTML = makes.map(make => `
    <button class="filter-chip" data-make="${make}">${make}</button>
  `).join('');

  chipContainer.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const make = chip.dataset.make;
      document.querySelectorAll('#makeChecklist input[type="checkbox"]').forEach(cb => {
        if (cb.value === make) cb.checked = !cb.checked;
      });
      chip.classList.toggle('active');
      displayedCount = PAGE_SIZE;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      applyFilters();
    });
  });
}

function buildChecklists() {
  const makes = [...new Set(allListings.filter(l => l.status === 'available').map(l => l.make))].sort();
  const conditions = ['Brand New', 'Nigerian Used', 'Foreign Used (Tokunbo)'];
  const bodyTypes = [...new Set(allListings.filter(l => l.status === 'available').map(l => l.bodyType))].sort();
  const colors = [...new Set(allListings.filter(l => l.status === 'available').map(l => l.color))].sort();

  document.getElementById('makeChecklist').innerHTML = makes.map(make => `
    <label><input type="checkbox" value="${make}"> ${make} <span class="count"></span></label>
  `).join('');

  document.getElementById('conditionChecklist').innerHTML = conditions.map(cond => `
    <label><input type="checkbox" value="${cond}"> ${cond} <span class="count"></span></label>
  `).join('');

  document.getElementById('bodyTypeChecklist').innerHTML = bodyTypes.map(type => `
    <label><input type="checkbox" value="${type}"> ${type.charAt(0).toUpperCase() + type.slice(1)} <span class="count"></span></label>
  `).join('');

  document.getElementById('colorChecklist').innerHTML = colors.map(color => `
    <label><input type="checkbox" value="${color}"> ${color} <span class="count"></span></label>
  `).join('');

  document.querySelectorAll('.checkbox-list input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      displayedCount = PAGE_SIZE;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      applyFilters();
    });
  });
}

function setupPriceChips() {
  document.querySelectorAll('#priceChips .filter-chip, #quickPriceChips .filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');

      const sameGroup = chip.closest('#priceChips, #quickPriceChips');
      if (sameGroup) {
        sameGroup.querySelectorAll('.filter-chip').forEach(c => {
          if (c !== chip) c.classList.remove('active');
        });
      }

      if (chip.classList.contains('active')) {
        filterElements.priceMin.value = chip.dataset.min;
        filterElements.priceMax.value = chip.dataset.max;
      } else {
        filterElements.priceMin.value = '';
        filterElements.priceMax.value = '';
      }
      displayedCount = PAGE_SIZE;
      applyFilters();
    });
  });
}

function setupFilterInputs() {
  Object.values(filterElements).forEach(el => {
    el.addEventListener('input', debounce(() => {
      deactivatePriceChips();
      displayedCount = PAGE_SIZE;
      applyFilters();
    }, 300));
  });

  sortSelect.addEventListener('change', () => {
    displayedCount = PAGE_SIZE;
    applyFilters();
  });
}

function deactivatePriceChips() {
  document.querySelectorAll('#priceChips .filter-chip.active, #quickPriceChips .filter-chip.active')
    .forEach(chip => chip.classList.remove('active'));
}

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

function setupMobileFilters() {
  const toggleBtn = document.getElementById('filtersToggle');
  const overlay = document.getElementById('mobileFilterOverlay');
  const panel = document.getElementById('mobileFilterPanel');
  const closeBtn = document.getElementById('mobileFilterClose');
  const content = document.getElementById('mobileFilterContent');

  function openPanel() {
    const sidebar = document.getElementById('filterSidebar');
    content.innerHTML = sidebar.innerHTML;
    overlay.classList.add('open');
    panel.classList.add('open');
    document.body.style.overflow = 'hidden';

    content.querySelectorAll('.checkbox-list input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => {
        const sidebarCb = document.querySelector(`#filterSidebar input[value="${cb.value}"]`);
        if (sidebarCb) {
          sidebarCb.checked = cb.checked;
          sidebarCb.dispatchEvent(new Event('change', { bubbles: true }));
        }
        applyFilters();
      });
    });

    content.querySelectorAll('.filter-price-inputs input').forEach(input => {
      input.addEventListener('input', debounce(() => {
        const sidebarId = input.id.replace('filter', 'filter');
        const sidebarInput = document.getElementById(input.id);
        if (sidebarInput) sidebarInput.value = input.value;
        displayedCount = PAGE_SIZE;
        applyFilters();
      }, 300));
    });

    content.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        chip.classList.toggle('active');
        const sidebarChip = Array.from(document.querySelectorAll('#filterSidebar .filter-chip'))
          .find(c => c.dataset.min === chip.dataset.min && c.dataset.max === chip.dataset.max);
        if (sidebarChip) {
          if (chip.classList.contains('active')) {
            sidebarChip.classList.add('active');
          } else {
            sidebarChip.classList.remove('active');
          }
          sidebarChip.click();
        }
      });
    });
  }

  function closePanel() {
    overlay.classList.remove('open');
    panel.classList.remove('open');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', openPanel);
  closeBtn.addEventListener('click', closePanel);
  overlay.addEventListener('click', closePanel);
}

function setupResetFilters() {
  resetFiltersBtn.addEventListener('click', () => {
    document.querySelectorAll('.checkbox-list input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('.filter-chip.active').forEach(chip => chip.classList.remove('active'));
    Object.values(filterElements).forEach(el => el.value = '');
    displayedCount = PAGE_SIZE;
    applyFilters();
  });
}

function showToast(message, type) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  });
}

async function init() {
  showSkeletons();

  try {
    const response = await fetchListings();
    allListings = response.documents;
    lastDocument = allListings.length > 0 ? allListings[allListings.length - 1] : null;

    if (allListings.length < PAGE_SIZE) {
      hasMore = false;
    }

    displayedCount = PAGE_SIZE;

    buildChecklists();
    setupPriceChips();
    setupFilterInputs();
    setupMobileFilters();
    setupResetFilters();

    await applyFilters();

    loadMoreBtn.addEventListener('click', fetchMoreListings);
  } catch (err) {
    console.error('Failed to load listings:', err);
    listingsGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h3 class="empty-state-title">Unable to load listings</h3>
        <p class="empty-state-text">Please check your connection and try again.</p>
        <button class="btn btn-primary" onclick="location.reload()">Retry</button>
      </div>
    `;
    resultsCount.textContent = 'Error loading listings';
  }
}

document.addEventListener('DOMContentLoaded', init);
