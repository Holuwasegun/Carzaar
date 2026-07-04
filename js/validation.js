export const validators = {
  price: (val) => val > 0 ? null : 'Price must be a positive number',
  year: (val) => {
    const year = parseInt(val);
    const currentYear = new Date().getFullYear();
    return (year >= 1980 && year <= currentYear + 1) ? null : `Year must be between 1980 and ${currentYear + 1}`;
  },
  vin: (val) => (!val || /^[A-HJ-NPR-Z0-9]{17}$/i.test(val)) ? null : 'Invalid VIN (must be 17 characters)',
  plateNumber: (val, docStatus) => {
    if (docStatus === 'registered_valid_papers' && !val) return 'Plate number is required for fully registered cars.';
    return null;
  },
  mileage: (val) => val >= 0 ? null : 'Mileage cannot be negative',
  owners: (val) => val >= 0 ? null : 'Number of previous owners cannot be negative'
};
