export const API_BASE_URL = '/api';

export const endpoints = {
  listings: `${API_BASE_URL}/listings`,
  listing: (id) => `${API_BASE_URL}/listings/${id}`,
  listingImages: (id) => `${API_BASE_URL}/listings/${id}/images`,
  increment: (id) => `${API_BASE_URL}/listings/${id}/increment`,
  auth: `${API_BASE_URL}/auth`,
  session: `${API_BASE_URL}/auth/session`,
};
