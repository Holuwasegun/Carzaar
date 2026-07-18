import { openSellCarModal } from './sell-car.js';

document.addEventListener('DOMContentLoaded', () => {
  const sellBtn = document.querySelector('.sell-link');
  if (sellBtn) {
    sellBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openSellCarModal();
    });
  }
});
