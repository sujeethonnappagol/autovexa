export const VEHICLE_TYPES = [
  'Hatchback',
  'Sedan',
  'SUV',
  'MUV',
  'Coupe',
  'Convertible',
  'Pickup Truck',
  'Electric Vehicle',
  'Bike',
  'Scooter',
];

export const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'];

export const TRANSMISSIONS = ['Manual', 'Automatic', 'AMT', 'CVT', 'DCT'];

export const BRANDS = [
  'Toyota',
  'BMW',
  'Mercedes-Benz',
  'Audi',
  'Hyundai',
  'Tata',
  'Mahindra',
  'Kia',
  'Honda',
  'Maruti Suzuki',
];

export const FEATURES_LIST = [
  'Air Conditioning',
  'Power Steering',
  'ABS',
  'Airbags',
  'Sunroof',
  'Rear Camera',
  'Bluetooth',
  'Cruise Control',
  'Alloy Wheels',
  'Touchscreen Infotainment',
  'Keyless Entry',
  'Parking Sensors',
];

export const SORT_OPTIONS = [
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
];

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * When true (default), async thunks fall back to mock data if the API is unreachable.
 * Set VITE_USE_MOCK=false in .env once the real backend is running.
 */
export const USE_MOCK =
  import.meta.env.VITE_USE_MOCK === undefined
    ? true
    : import.meta.env.VITE_USE_MOCK === 'true';
