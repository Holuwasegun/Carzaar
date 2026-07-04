import { databases, databaseId } from './appwrite-client.js';
import APPWRITE_CONFIG from './appwrite-config.js';

const ADMIN_PROFILE_COLLECTION = 'admin_profile';
const LISTINGS_COLLECTION = 'listings';

const COUNTER_FUNCTION_ENDPOINT = APPWRITE_CONFIG.counterFunctionUrl;

export async function getWhatsAppNumber() {
  try {
    const doc = await databases.getDocument(databaseId, ADMIN_PROFILE_COLLECTION, 'main');
    return doc.whatsappNumber || '2349158461502';
  } catch {
    return '2349158461502';
  }
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
    const listing = await databases.getDocument(databaseId, LISTINGS_COLLECTION, listingId);
    const title = `${listing.make} ${listing.model} ${listing.year}`;
    const url = getWhatsAppUrl(number, title);
    window.open(url, '_blank');
    try {
      const response = await fetch(COUNTER_FUNCTION_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, field: 'whatsappClickCount' }),
      });
      if (!response.ok) {
        console.warn('Counter increment failed');
      }
    } catch (err) {
      console.warn('Counter increment error:', err);
    }
  } catch (err) {
    console.error('WhatsApp click handler error:', err);
  }
}
