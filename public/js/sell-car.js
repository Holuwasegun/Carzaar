import { getWhatsAppNumber } from './whatsapp.js';

let modalRef = null;

function createModal() {
  const overlay = document.createElement('div');
  overlay.className = 'sell-modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'sell-modal';
  modal.innerHTML = `
    <button class="sell-modal-close" id="sellModalClose" type="button" aria-label="Close">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>

    <div class="sell-modal-hero">
      <div class="sell-modal-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2"/><circle cx="7" cy="15" r="2"/><circle cx="17" cy="15" r="2"/><path d="M3 9h18"/><path d="M7 5h10"/></svg>
      </div>
      <h2 class="sell-modal-title">Sell Your Car</h2>
      <p class="sell-modal-subtitle">Enter your car details and we will connect you with buyers.</p>
    </div>

    <form id="sellForm" class="sell-form">
      <div class="sell-input-group">
        <div class="sell-input-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><polyline points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        </div>
        <div class="sell-input-field">
          <label for="sellMake">Make</label>
          <input type="text" id="sellMake" placeholder="e.g. Toyota" autocomplete="off">
        </div>
      </div>

      <div class="sell-input-group">
        <div class="sell-input-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>
        </div>
        <div class="sell-input-field">
          <label for="sellModel">Model</label>
          <input type="text" id="sellModel" placeholder="e.g. Camry" autocomplete="off">
        </div>
      </div>

      <div class="sell-input-group">
        <div class="sell-input-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div class="sell-input-field">
          <label for="sellYear">Year</label>
          <input type="number" id="sellYear" placeholder="e.g. 2020" min="1980" max="2030" autocomplete="off">
        </div>
      </div>

      <div class="sell-preview" id="sellPreview">
        <div class="sell-preview-label">Preview</div>
        <div class="sell-preview-text" id="sellPreviewText">Your listing message will appear here</div>
      </div>

      <button type="submit" class="sell-submit" id="sellSubmitBtn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        <span class="sell-submit-text" id="sellSubmitText">Connect with Buyers</span>
        <span class="sell-submit-loader" id="sellSubmitLoader"></span>
      </button>
    </form>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  return { overlay, modal };
}

function updatePreview() {
  const make = document.getElementById('sellMake').value.trim();
  const model = document.getElementById('sellModel').value.trim();
  const year = document.getElementById('sellYear').value.trim();
  const previewEl = document.getElementById('sellPreviewText');
  const previewContainer = document.getElementById('sellPreview');

  if (make && model && year) {
    previewEl.textContent = `Hi, I am selling my ${make} ${model} ${year}. Contact me for more details.`;
    previewContainer.classList.add('sell-preview--active');
  } else {
    previewEl.textContent = 'Fill in the fields above to see your listing preview';
    previewContainer.classList.remove('sell-preview--active');
  }
}

function closeModal() {
  if (!modalRef) return;
  modalRef.overlay.classList.remove('open');
  document.body.style.overflow = '';
}

export function openSellCarModal() {
  if (!modalRef) {
    modalRef = createModal();

    modalRef.modal.querySelector('#sellModalClose').addEventListener('click', closeModal);
    modalRef.overlay.addEventListener('click', (e) => {
      if (e.target === modalRef.overlay) closeModal();
    });

    const inputs = ['sellMake', 'sellModel', 'sellYear'];
    inputs.forEach(id => {
      document.getElementById(id).addEventListener('input', updatePreview);
    });

    modalRef.modal.querySelector('#sellForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const make = document.getElementById('sellMake').value.trim();
      const model = document.getElementById('sellModel').value.trim();
      const year = document.getElementById('sellYear').value.trim();
      if (!make || !model || !year) return;

      const btn = document.getElementById('sellSubmitBtn');
      const btnText = document.getElementById('sellSubmitText');
      const loader = document.getElementById('sellSubmitLoader');
      btn.disabled = true;
      btnText.textContent = 'Connecting...';
      loader.classList.add('active');

      try {
        const number = await getWhatsAppNumber();
        const text = encodeURIComponent(`Hi, I am selling my ${make} ${model} ${year}. Contact me for more details.`);
        window.open(`https://wa.me/${number}?text=${text}`, '_blank');
        closeModal();
      } catch (err) {
        console.error('Failed to open WhatsApp sell link:', err);
        btnText.textContent = 'Connect with Buyers';
        btn.disabled = false;
        loader.classList.remove('active');
      }
    });
  }

  modalRef.overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('sellMake').focus(), 150);
}
