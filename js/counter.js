import APPWRITE_CONFIG from './appwrite-config.js';

const COUNTER_URL = APPWRITE_CONFIG.counterFunctionUrl;

export async function incrementCounter(listingId, field) {
  if (!COUNTER_URL || !listingId || !field) return;

  try {
    const body = JSON.stringify({
      data: JSON.stringify({ listingId, field }),
    });

    const response = await fetch(COUNTER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (!response.ok) {
      console.warn('Counter increment returned', response.status);
    }
  } catch (err) {
    console.warn('Counter increment failed:', err);
  }
}
