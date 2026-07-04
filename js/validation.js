const CURRENT_YEAR = new Date().getFullYear();

export const validators = {
  required(value, fieldName) {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} is required`;
    }
    return null;
  },

  vin(value) {
    if (!value) return null;
    if (value.length !== 17) {
      return 'VIN must be exactly 17 characters';
    }
    if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(value)) {
      return 'VIN contains invalid characters (letters I, O, Q are not allowed)';
    }
    return null;
  },

  price(value) {
    const num = Number(value);
    if (!Number.isInteger(num) || num < 1) {
      return 'Price must be a positive whole number (NGN)';
    }
    return null;
  },

  year(value) {
    const num = Number(value);
    if (!Number.isInteger(num) || num < 1980 || num > CURRENT_YEAR + 1) {
      return `Year must be between 1980 and ${CURRENT_YEAR + 1}`;
    }
    return null;
  },

  mileage(value, year) {
    const num = Number(value);
    if (!Number.isInteger(num) || num < 0) {
      return 'Mileage must be a non-negative whole number';
    }
    if (year) {
      const age = CURRENT_YEAR - Number(year);
      if (age > 0 && num > age * 50000) {
        return `Warning: ${num.toLocaleString()} km is high for a ${age}-year-old car (typical: ~20,000km/year)`;
      }
    }
    return null;
  },

  plateNumber(value, documentationStatus) {
    if (documentationStatus === 'registered_valid_papers' && (!value || !value.trim())) {
      return 'Plate number is required when documentation status is "Registered with Valid Papers"';
    }
    return null;
  },

  imageFile(file) {
    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (file.size > maxSize) {
      return 'Image must be under 5MB';
    }
    if (!allowedTypes.includes(file.type)) {
      return 'Only JPG, PNG, and WebP images are allowed';
    }
    return null;
  },

  doors(value) {
    if (!value) return null;
    const num = Number(value);
    if (!Number.isInteger(num) || num < 2 || num > 6) {
      return 'Doors must be between 2 and 6';
    }
    return null;
  },

  seats(value) {
    if (!value) return null;
    const num = Number(value);
    if (!Number.isInteger(num) || num < 2 || num > 9) {
      return 'Seats must be between 2 and 9';
    }
    return null;
  },
};

export function validateForm(formData, rules) {
  const errors = {};
  for (const [field, validators] of Object.entries(rules)) {
    for (const validator of validators) {
      const error = validator(formData[field]);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  }
  return errors;
}

export function showFieldError(fieldName, message) {
  const group = document.querySelector(`[data-field="${fieldName}"]`);
  if (!group) return;
  const errorEl = group.querySelector('.error');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }
  group.classList.add('invalid');
}

export function clearFieldErrors() {
  document.querySelectorAll('.form-group.invalid').forEach(el => {
    el.classList.remove('invalid');
    const errorEl = el.querySelector('.error');
    if (errorEl) errorEl.style.display = 'none';
  });
}
