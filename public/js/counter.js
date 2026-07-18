export async function incrementCounter(listingId, field) {
  if (!listingId || !field) return;

  try {
    const response = await fetch(`/api/listings/${listingId}/increment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field }),
    });

    if (!response.ok) {
      console.warn('Counter increment returned', response.status);
    }
  } catch (err) {
    console.warn('Counter increment failed:', err);
  }
}
