import { databases, databaseId, storage, Query, ID } from './appwrite-client.js';
import { logout, initAuthGuard } from './admin-auth.js';
import { validators, clearFieldErrors, showFieldError } from './validation.js';

const LISTINGS_COLLECTION = 'listings';
const LISTING_IMAGES_COLLECTION = 'listing_images';
const FEATURES_COLLECTION = 'features';
const BUCKET_ID = 'car-images';
const MAX_IMAGES = 8;

let selectedFiles = [];
let existingImages = [];
let deletedImageIds = [];
let editListingId = null;

async function loadFeatures() {
  const container = document.getElementById('featuresChecklist');
  try {
    const response = await databases.listDocuments(databaseId, FEATURES_COLLECTION, [
      Query.orderAsc('label'),
      Query.limit(100),
    ]);

    if (response.documents.length === 0) {
      container.innerHTML = '<span style="font-size:var(--text-sm);color:var(--gray-500)">No features available. Seed the features collection first.</span>';
      return;
    }

    container.innerHTML = response.documents.map(f => `
      <label>
        <input type="checkbox" value="${f.label}" class="feature-checkbox">
        ${f.label}
      </label>
    `).join('');
  } catch (err) {
    console.warn('Failed to load features:', err);
    container.innerHTML = '<span style="font-size:var(--text-sm);color:var(--gray-500)">Could not load features list.</span>';
  }
}

function setupImageUpload() {
  const input = document.getElementById('images');
  const errorEl = document.getElementById('imageError');

  input.addEventListener('change', () => {
    errorEl.style.display = 'none';
    const files = Array.from(input.files);

    const validFiles = [];
    for (const file of files) {
      const error = validators.imageFile(file);
      if (error) {
        errorEl.textContent = error;
        errorEl.style.display = 'block';
        continue;
      }
      validFiles.push(file);
    }

    const totalImages = existingImages.length + selectedFiles.length + validFiles.length;
    if (totalImages > MAX_IMAGES) {
      const allowed = MAX_IMAGES - existingImages.length;
      errorEl.textContent = `Maximum ${MAX_IMAGES} images allowed. You can add ${allowed} more.`;
      errorEl.style.display = 'block';
      return;
    }

    selectedFiles = [...selectedFiles, ...validFiles];
    renderImagePreviews();
    input.value = '';
  });
}

function renderImagePreviews() {
  const previewGrid = document.getElementById('imagePreviewGrid');

  let html = '';

  existingImages.forEach((img, i) => {
    const url = storage.getFileView(BUCKET_ID, img.storageFileId);
    html += `
      <div class="image-preview-item">
        <img src="${url}" alt="Existing image ${i + 1}">
        <button type="button" class="remove-image" data-existing="${img.$id}" data-index="${i}">&times;</button>
      </div>
    `;
  });

  selectedFiles.forEach((file, i) => {
    const url = URL.createObjectURL(file);
    html += `
      <div class="image-preview-item">
        <img src="${url}" alt="New image ${i + 1}">
        <button type="button" class="remove-image" data-new="${i}">&times;</button>
      </div>
    `;
  });

  previewGrid.innerHTML = html;

  previewGrid.querySelectorAll('.remove-image').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.existing) {
        deletedImageIds.push(btn.dataset.existing);
        existingImages = existingImages.filter(img => img.$id !== btn.dataset.existing);
      }
      if (btn.dataset.new !== undefined) {
        selectedFiles.splice(parseInt(btn.dataset.new), 1);
      }
      renderImagePreviews();
    });
  });
}

function getFormData() {
  const getVal = (id) => {
    const el = document.getElementById(id);
    if (!el) return '';
    return el.value.trim();
  };
  const getCheck = (id) => document.getElementById(id)?.checked || false;

  const features = Array.from(document.querySelectorAll('.feature-checkbox:checked')).map(cb => cb.value);

  return {
    make: getVal('make'),
    model: getVal('model'),
    year: getVal('year'),
    price: getVal('price'),
    condition: getVal('condition'),
    location: getVal('location'),
    description: getVal('description'),
    mileage: getVal('mileage'),
    bodyType: getVal('bodyType'),
    color: getVal('color'),
    transmission: getVal('transmission'),
    fuel: getVal('fuel'),
    drivetrain: getVal('drivetrain'),
    engineCapacity: getVal('engineCapacity'),
    numberOfDoors: getVal('numberOfDoors'),
    numberOfSeats: getVal('numberOfSeats'),
    vin: getVal('vin'),
    plateNumber: getVal('plateNumber'),
    numberOfPreviousOwners: getVal('numberOfPreviousOwners') || '0',
    accidentHistory: getVal('accidentHistory') || 'unknown',
    serviceHistoryAvailable: getCheck('serviceHistoryAvailable'),
    hasSpareKey: getCheck('hasSpareKey'),
    documentationStatus: getVal('documentationStatus') || 'registered_valid_papers',
    warrantyRemaining: getCheck('warrantyRemaining'),
    features,
  };
}

function validateFormData(data) {
  const errors = {};

  const requiredFields = [
    'make', 'model', 'year', 'price', 'condition', 'location',
    'description', 'mileage', 'bodyType', 'color', 'transmission', 'fuel', 'drivetrain'
  ];

  for (const field of requiredFields) {
    const err = validators.required(data[field], field.charAt(0).toUpperCase() + field.slice(1));
    if (err) errors[field] = err;
  }

  const yearErr = validators.year(data.year);
  if (yearErr) errors.year = yearErr;

  const priceErr = validators.price(data.price);
  if (priceErr) errors.price = priceErr;

  const mileageErr = validators.mileage(data.mileage, data.year);
  if (mileageErr && !mileageErr.startsWith('Warning:')) errors.mileage = mileageErr;

  const vinErr = validators.vin(data.vin);
  if (vinErr) errors.vin = vinErr;

  const plateErr = validators.plateNumber(data.plateNumber, data.documentationStatus);
  if (plateErr) errors.plateNumber = plateErr;

  const doorsErr = validators.doors(data.numberOfDoors);
  if (doorsErr) errors.numberOfDoors = doorsErr;

  const seatsErr = validators.seats(data.numberOfSeats);
  if (seatsErr) errors.numberOfSeats = seatsErr;

  return errors;
}

function showErrors(errors) {
  clearFieldErrors();
  for (const [field, message] of Object.entries(errors)) {
    showFieldError(field, message);
  }

  if (Object.keys(errors).length > 0) {
    const firstError = document.querySelector('.form-group.invalid');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

async function uploadImages(listingId) {
  const uploaded = [];

  for (let i = 0; i < selectedFiles.length; i++) {
    const file = selectedFiles[i];
    try {
      const response = await storage.createFile(BUCKET_ID, ID.unique(), file);
      await databases.createDocument(databaseId, LISTING_IMAGES_COLLECTION, ID.unique(), {
        listingId,
        storageFileId: response.$id,
        sortOrder: existingImages.length + uploaded.length,
      });
      uploaded.push(response);
    } catch (err) {
      console.error('Image upload failed:', err);
      throw new Error(`Failed to upload image ${i + 1}: ${err.message}`);
    }
  }

  return uploaded;
}

async function deleteRemovedImages() {
  for (const imageId of deletedImageIds) {
    try {
      const imgDoc = await databases.getDocument(databaseId, LISTING_IMAGES_COLLECTION, imageId);
      await storage.deleteFile(BUCKET_ID, imgDoc.storageFileId);
      await databases.deleteDocument(databaseId, LISTING_IMAGES_COLLECTION, imageId);
    } catch (err) {
      console.warn('Failed to delete image:', err);
    }
  }
}

async function submitForm(e) {
  e.preventDefault();
  clearFieldErrors();

  const data = getFormData();
  const errors = validateFormData(data);

  if (Object.keys(errors).length > 0) {
    showErrors(errors);
    return;
  }

  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';

  try {
    const listingData = {
      make: data.make,
      model: data.model,
      year: parseInt(data.year),
      price: parseInt(data.price),
      condition: data.condition,
      location: data.location,
      description: data.description,
      mileage: parseInt(data.mileage),
      bodyType: data.bodyType,
      color: data.color,
      transmission: data.transmission,
      fuel: data.fuel,
      drivetrain: data.drivetrain,
      engineCapacity: data.engineCapacity ? parseFloat(data.engineCapacity) : null,
      numberOfDoors: data.numberOfDoors ? parseInt(data.numberOfDoors) : null,
      numberOfSeats: data.numberOfSeats ? parseInt(data.numberOfSeats) : null,
      vin: data.vin || null,
      plateNumber: data.plateNumber || null,
      numberOfPreviousOwners: parseInt(data.numberOfPreviousOwners),
      accidentHistory: data.accidentHistory,
      serviceHistoryAvailable: data.serviceHistoryAvailable,
      hasSpareKey: data.hasSpareKey,
      documentationStatus: data.documentationStatus,
      warrantyRemaining: data.warrantyRemaining,
      features: data.features,
    };

    let listingId;

    if (editListingId) {
      await databases.updateDocument(databaseId, LISTINGS_COLLECTION, editListingId, listingData);
      listingId = editListingId;
      await deleteRemovedImages();
    } else {
      listingData.status = 'available';
      listingData.viewCount = 0;
      listingData.whatsappClickCount = 0;
      const response = await databases.createDocument(databaseId, LISTINGS_COLLECTION, ID.unique(), listingData);
      listingId = response.$id;
    }

    await uploadImages(listingId);

    showToast(editListingId ? 'Listing updated successfully' : 'Listing created successfully', 'success');

    setTimeout(() => {
      window.location.href = '/admin/dashboard.html';
    }, 1000);
  } catch (err) {
    console.error('Save failed:', err);
    showToast('Failed to save listing: ' + err.message, 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = editListingId ? 'Update Listing' : 'Save Listing';
  }
}

async function loadExistingListing(listingId) {
  try {
    const listing = await databases.getDocument(databaseId, LISTINGS_COLLECTION, listingId);
    editListingId = listingId;

    document.getElementById('formTitle').textContent = 'Edit Listing';
    document.getElementById('submitBtn').textContent = 'Update Listing';

    const fields = ['make', 'model', 'year', 'price', 'condition', 'location', 'description',
      'mileage', 'bodyType', 'color', 'transmission', 'fuel', 'drivetrain', 'vin', 'plateNumber'];
    fields.forEach(f => {
      const el = document.getElementById(f);
      if (el && listing[f] !== undefined && listing[f] !== null) {
        el.value = listing[f];
      }
    });

    if (listing.engineCapacity) document.getElementById('engineCapacity').value = listing.engineCapacity;
    if (listing.numberOfDoors) document.getElementById('numberOfDoors').value = listing.numberOfDoors;
    if (listing.numberOfSeats) document.getElementById('numberOfSeats').value = listing.numberOfSeats;
    document.getElementById('numberOfPreviousOwners').value = listing.numberOfPreviousOwners || 0;
    document.getElementById('accidentHistory').value = listing.accidentHistory || 'unknown';
    document.getElementById('documentationStatus').value = listing.documentationStatus || 'registered_valid_papers';
    document.getElementById('serviceHistoryAvailable').checked = listing.serviceHistoryAvailable || false;
    document.getElementById('hasSpareKey').checked = listing.hasSpareKey === true;
    document.getElementById('warrantyRemaining').checked = listing.warrantyRemaining || false;

    if (listing.features && listing.features.length > 0) {
      document.querySelectorAll('.feature-checkbox').forEach(cb => {
        if (listing.features.includes(cb.value)) {
          cb.checked = true;
        }
      });
    }

    const imagesResponse = await databases.listDocuments(databaseId, LISTING_IMAGES_COLLECTION, [
      Query.equal('listingId', listingId),
      Query.orderAsc('sortOrder'),
    ]);
    existingImages = imagesResponse.documents;
    renderImagePreviews();
  } catch (err) {
    console.error('Failed to load listing for edit:', err);
    showToast('Failed to load listing data', 'error');
  }
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
  const user = await initAuthGuard();
  if (!user) return;

  document.getElementById('logoutBtn').addEventListener('click', logout);

  const params = new URLSearchParams(window.location.search);
  const editId = params.get('id');

  loadFeatures().then(() => {
    if (editId) {
      loadExistingListing(editId);
    }
  });

  setupImageUpload();
  document.getElementById('listingForm').addEventListener('submit', submitForm);
}

init();
