import APPWRITE_CONFIG from './appwrite-config.js';

const { endpoint, projectId } = APPWRITE_CONFIG;

export async function incrementCounter(listingId, field) {
  if (!listingId || !field) return;

  try {
    const body = JSON.stringify({ listingId, field });

    const response = await fetch(
      `${endpoint}/functions/${APPWRITE_CONFIG.functionId}/executions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': projectId,
        },
        body: JSON.stringify({
          body,
          async: true,
          path: '/',
          method: 'POST',
        }),
      }
    );

    if (!response.ok) {
      console.warn('Counter increment returned', response.status);
    }
  } catch (err) {
    console.warn('Counter increment failed:', err);
  }
}
