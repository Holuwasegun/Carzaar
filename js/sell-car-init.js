import { openSellCarModal } from './sell-car.js';

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('sellCarBtn');
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openSellCarModal();
    });
  }
});
