import { databases, databaseId, Query } from './appwrite-client.js';
import { logout, initAuthGuard } from './admin-auth.js';

const LISTINGS_COLLECTION = 'listings';

let confirmCallback = null;

function escapeHtml(str) {
  if (typeof str !== 'string') return String(str);
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function formatPrice(price) {
  return '₦' + Number(price).toLocaleString('en-NG');
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getStatusBadge(status) {
  const map = {
    available: '<span class="status-badge available">Available</span>',
    reserved: '<span class="status-badge reserved">Reserved</span>',
    sold: '<span class="status-badge sold">Sold</span>',
  };
  return map[status] || status;
}

async function loadListings() {
  const tbody = document.getElementById('listingsTableBody');
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:var(--space-10);color:var(--gray-500)">Loading...</td></tr>';

  try {
    const response = await databases.listDocuments(databaseId, LISTINGS_COLLECTION, [
      Query.orderDesc('$createdAt'),
      Query.limit(100),
    ]);

    if (response.documents.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:var(--space-10);color:var(--gray-500)">No listings yet. <a href="/admin/listing-form.html">Add your first listing</a></td></tr>';
      return;
    }

    tbody.innerHTML = response.documents.map(listing => {
      const safeMake = escapeHtml(listing.make);
      const safeModel = escapeHtml(listing.model);
      const safeYear = escapeHtml(String(listing.year));
      const safeLocation = escapeHtml(listing.location || 'Nigeria');
      const safeId = escapeHtml(listing.$id);
      return `
      <tr>
        <td>
          <strong>${safeMake} ${safeModel}</strong>
          <br><span style="font-size:var(--text-xs);color:var(--gray-500)">${safeYear} · ${safeLocation}</span>
        </td>
        <td style="font-weight:600">${formatPrice(listing.price)}</td>
        <td>${getStatusBadge(listing.status)}</td>
        <td style="font-size:var(--text-sm);color:var(--gray-600)">${listing.viewCount || 0}</td>
        <td style="font-size:var(--text-sm);color:var(--gray-600)">${listing.whatsappClickCount || 0}</td>
        <td>
          <div style="display:flex;gap:var(--space-2)">
            <a href="/admin/listing-form.html?id=${safeId}" class="btn btn-sm btn-secondary">Edit</a>
            ${listing.status === 'sold' ? `<button class="btn btn-sm btn-secondary" onclick="markAsAvailable('${safeId}')">Mark Available</button>` : `<button class="btn btn-sm btn-secondary" onclick="markAsSold('${safeId}')">Mark Sold</button>`}
            <button class="btn btn-sm btn-destructive" onclick="deleteListing('${safeId}')">Delete</button>
          </div>
        </td>
      </tr>`;
    }).join('');
  } catch (err) {
    console.error('Failed to load listings:', err);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:var(--space-10);color:#e03131">Error loading listings: ${escapeHtml(err.message)}</td></tr>`;
  }
}

async function changeStatus(listingId, newStatus) {
  try {
    const updateData = { status: newStatus };
    if (newStatus === 'sold') {
      updateData.soldAt = new Date().toISOString();
    } else if (newStatus === 'available') {
      updateData.soldAt = null;
    }
    await databases.updateDocument(databaseId, LISTINGS_COLLECTION, listingId, updateData);
    showToast(`Listing marked as ${newStatus}`, 'success');
    loadListings();
  } catch (err) {
    console.error('Status change failed:', err);
    showToast('Failed to update status: ' + err.message, 'error');
  }
}

async function deleteListingDoc(listingId) {
  try {
    await databases.deleteDocument(databaseId, LISTINGS_COLLECTION, listingId);
    showToast('Listing deleted', 'success');
    loadListings();
  } catch (err) {
    console.error('Delete failed:', err);
    showToast('Failed to delete listing: ' + err.message, 'error');
  }
}

function showConfirm(title, message, onConfirm) {
  const dialog = document.getElementById('confirmDialog');
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMessage').textContent = message;
  dialog.classList.add('open');
  confirmCallback = onConfirm;
}

function setupConfirmDialog() {
  const dialog = document.getElementById('confirmDialog');
  document.getElementById('confirmCancel').addEventListener('click', () => {
    dialog.classList.remove('open');
    confirmCallback = null;
  });
  document.getElementById('confirmProceed').addEventListener('click', () => {
    dialog.classList.remove('open');
    if (confirmCallback) {
      confirmCallback();
      confirmCallback = null;
    }
  });
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      dialog.classList.remove('open');
      confirmCallback = null;
    }
  });
}

window.markAsAvailable = function(listingId) {
  showConfirm(
    'Mark as Available?',
    'This will change the listing status back to available and clear the sold date.',
    () => changeStatus(listingId, 'available')
  );
};

window.markAsSold = function(listingId) {
  showConfirm(
    'Mark as Sold?',
    'This will change the listing status to sold and record the sale date.',
    () => changeStatus(listingId, 'sold')
  );
};

window.deleteListing = function(listingId) {
  showConfirm(
    'Delete Listing?',
    'This action cannot be undone. The listing and its images will be permanently removed.',
    () => deleteListingDoc(listingId)
  );
};

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

  setupConfirmDialog();
  loadListings();
}

init();
