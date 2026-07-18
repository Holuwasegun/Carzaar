import { APP_CONFIG } from '@/config/constants';

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!APP_CONFIG.allowedImageTypes.includes(file.type as typeof APP_CONFIG.allowedImageTypes[number])) {
    return { valid: false, error: 'Only JPG, PNG, and WebP images are allowed' };
  }

  if (file.size > APP_CONFIG.maxFileSize) {
    return { valid: false, error: 'Image must be under 5MB' };
  }

  return { valid: true };
}
