import { incrementCounter } from './counter.js';

const DEFAULT_WHATSAPP_NUMBER = '2349158461502';

export async function getWhatsAppNumber() {
  return DEFAULT_WHATSAPP_NUMBER;
}

export function getWhatsAppUrl(number, listingTitle) {
  const text = encodeURIComponent(
    `Hello, I'm interested in the ${listingTitle} listed on Carzaar. Is it still available?`
  );
  return `https://wa.me/${number}?text=${text}`;
}

export async function handleWhatsAppClick(listingId) {
  try {
    const number = await getWhatsAppNumber();
    const response = await fetch(`/api/listings/${listingId}`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch listing');
    }

    const listing = result.data;
    const title = `${listing.make} ${listing.model} ${listing.year}`;
    const url = getWhatsAppUrl(number, title);
    window.open(url, '_blank');
    incrementCounter(listingId, 'whatsappClickCount');
  } catch (err) {
    console.error('WhatsApp click handler error:', err);
  }
}
