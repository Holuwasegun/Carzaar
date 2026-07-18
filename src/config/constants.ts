export const APP_CONFIG = {
  maxImagesPerListing: 8,
  maxFileSize: 5 * 1024 * 1024,
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  defaultPageSize: 12,
  maxListingsPerPage: 100,
  defaultWhatsAppNumber: '2349158461502',
  price: {
    min: 1,
    max: 999999999,
  },
  year: {
    min: 1980,
    max: new Date().getFullYear() + 1,
  },
  mileage: {
    min: 0,
    max: 999999,
  },
} as const;
