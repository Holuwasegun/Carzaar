import { getWhatsAppNumber } from './whatsapp.js';

let modalRef = null;

function createModal() {
  const overlay = document.createElement('div');
  overlay.className = 'sell-modal-overlay';
  overlay.id = 'sellModalOverlay';

  const modal = document.createElement('div');
  modal.className = 'sell-modal';
  modal.innerHTML = `
    <div class="sell-modal-header">
      <h3>Sell Your Car</h3>
      <button class="sell-modal-close" id="sellModalClose" type="button">&times;</button>
    </div>
    <p style="font-size:var(--text-sm);color:var(--gray-600);margin-bottom:var(--space-4)">
      Enter your car details and we'll connect you with buyers on WhatsApp.
    </p>
    <form id="sellForm">
      <div class="form-group">
        <label class="form-label" for="sellMake">Make</label>
        <input type="text" class="form-input" id="sellMake" placeholder="e.g. Toyota" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="sellModel">Model</label>
        <input type="text" class="form-input" id="sellModel" placeholder="e.g. Camry" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="sellYear">Year</label>
        <input type="number" class="form-input" id="sellYear" placeholder="e.g. 2020" min="1980" max="2030" required>
      </div>
      <button type="submit" class="btn btn-whatsapp btn-block" style="margin-top:var(--space-3)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        Submit to WhatsApp
      </button>
    </form>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  return { overlay, modal };
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

    modalRef.modal.querySelector('#sellForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const make = document.getElementById('sellMake').value.trim();
      const model = document.getElementById('sellModel').value.trim();
      const year = document.getElementById('sellYear').value.trim();
      if (!make || !model || !year) return;

      try {
        const number = await getWhatsAppNumber();
        const text = encodeURIComponent(`Hi, I want to sell my car: ${make}/${model}/${year}`);
        window.open(`https://wa.me/${number}?text=${text}`, '_blank');
        closeModal();
      } catch (err) {
        console.error('Failed to open WhatsApp sell link:', err);
      }
    });
  }

  modalRef.overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('sellMake').focus(), 100);
}
