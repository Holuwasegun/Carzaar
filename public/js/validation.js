export function clearFieldErrors() {
  document.querySelectorAll('.form-group.invalid').forEach(group => {
    group.classList.remove('invalid');
  });
  document.querySelectorAll('.field-error').forEach(el => el.remove());
}

export function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (!field) return;

  const group = field.closest('.form-group');
  if (group) {
    group.classList.add('invalid');
  }

  const errorEl = document.createElement('span');
  errorEl.className = 'field-error';
  errorEl.textContent = message;
  errorEl.style.color = '#e03131';
  errorEl.style.fontSize = 'var(--text-xs)';
  errorEl.style.marginTop = 'var(--space-1)';
  errorEl.style.display = 'block';

  if (group) {
    group.appendChild(errorEl);
  } else {
    field.parentNode.insertBefore(errorEl, field.nextSibling);
  }
}

export const validators = {
  required(value, fieldName) {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} is required`;
    }
    return null;
  },

  year(value) {
    if (!value) return null;
    const num = parseInt(value);
    if (isNaN(num)) return 'Year must be a number';
    const currentYear = new Date().getFullYear();
    if (num < 1980 || num > currentYear + 1) {
      return `Year must be between 1980 and ${currentYear + 1}`;
    }
    return null;
  },

  price(value) {
    if (!value) return null;
    const num = parseInt(value);
    if (isNaN(num) || num < 1) {
      return 'Price must be at least ₦1';
    }
    return null;
  },

  mileage(value, year) {
    if (!value) return null;
    const num = parseInt(value);
    if (isNaN(num) || num < 0) {
      return 'Mileage must be 0 or greater';
    }
    if (year && num > 0) {
      const currentYear = new Date().getFullYear();
      const age = currentYear - parseInt(year);
      const maxReasonable = age * 30000;
      if (num > maxReasonable && maxReasonable > 0) {
        return `Warning: Mileage seems high for a ${year} model`;
      }
    }
    return null;
  },

  vin(value) {
    if (!value) return null;
    const cleaned = value.toUpperCase().trim();
    if (cleaned.length !== 17) {
      return 'VIN must be exactly 17 characters';
    }
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(cleaned)) {
      return 'VIN contains invalid characters (no I, O, Q allowed)';
    }
    return null;
  },

  plateNumber(value, documentationStatus) {
    if (!value) {
      if (documentationStatus === 'registered_valid_papers' || documentationStatus === 'registered_papers_pending') {
        return 'Plate number is required for registered vehicles';
      }
      return null;
    }
    if (value.length < 3 || value.length > 20) {
      return 'Plate number must be 3-20 characters';
    }
    return null;
  },

  doors(value) {
    if (!value) return null;
    const num = parseInt(value);
    if (isNaN(num) || num < 2 || num > 6) {
      return 'Doors must be between 2 and 6';
    }
    return null;
  },

  seats(value) {
    if (!value) return null;
    const num = parseInt(value);
    if (isNaN(num) || num < 2 || num > 9) {
      return 'Seats must be between 2 and 9';
    }
    return null;
  },

  imageFile(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return 'Only JPG, PNG, and WebP images are allowed';
    }
    if (file.size > 5 * 1024 * 1024) {
      return 'Image must be under 5MB';
    }
    return null;
  },
};
