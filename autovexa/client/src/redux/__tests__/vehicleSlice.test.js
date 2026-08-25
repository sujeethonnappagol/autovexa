import { describe, it, expect } from 'vitest';
import vehicleReducer, {
  setFilters,
  clearFilters,
  setSortBy,
  selectFilteredVehicles,
} from '../vehicleSlice';

/**
 * Strategy: reducer + selector tests.
 * Reducers are pure — ideal for unit tests without async/API.
 */

const sampleVehicles = [
  {
    id: 1,
    brand: 'Toyota',
    model: 'Fortuner',
    year: 2025,
    price: 4200000,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    type: 'SUV',
    status: 'Available',
    createdAt: '2025-01-15',
  },
  {
    id: 2,
    brand: 'Hyundai',
    model: 'Creta',
    year: 2024,
    price: 1850000,
    fuelType: 'Petrol',
    transmission: 'Manual',
    type: 'SUV',
    status: 'Available',
    createdAt: '2025-03-01',
  },
  {
    id: 3,
    brand: 'BMW',
    model: 'X5',
    year: 2024,
    price: 9500000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    type: 'SUV',
    status: 'Booked',
    createdAt: '2024-11-20',
  },
];

function stateWith(vehicles, filters = {}, sortBy = 'newest') {
  return {
    vehicles: {
      vehicles,
      filters: {
        brand: '',
        type: '',
        fuelType: '',
        transmission: '',
        minPrice: '',
        maxPrice: '',
        year: '',
        status: '',
        search: '',
        ...filters,
      },
      sortBy,
      selectedVehicle: null,
      loading: false,
      error: null,
    },
  };
}

describe('vehicleSlice reducers', () => {
  it('setFilters merges partial filter updates', () => {
    const prev = vehicleReducer(undefined, { type: 'unknown' });
    const next = vehicleReducer(prev, setFilters({ brand: 'Toyota', fuelType: 'Diesel' }));
    expect(next.filters.brand).toBe('Toyota');
    expect(next.filters.fuelType).toBe('Diesel');
    expect(next.filters.search).toBe(''); // untouched
  });

  it('clearFilters resets to empty defaults', () => {
    let state = vehicleReducer(undefined, setFilters({ brand: 'BMW', search: 'x5' }));
    state = vehicleReducer(state, clearFilters());
    expect(state.filters.brand).toBe('');
    expect(state.filters.search).toBe('');
  });

  it('setSortBy updates sort mode', () => {
    const state = vehicleReducer(undefined, setSortBy('price-asc'));
    expect(state.sortBy).toBe('price-asc');
  });
});

describe('selectFilteredVehicles', () => {
  it('filters by brand', () => {
    const result = selectFilteredVehicles(stateWith(sampleVehicles, { brand: 'Toyota' }));
    expect(result).toHaveLength(1);
    expect(result[0].model).toBe('Fortuner');
  });

  it('filters by search text across brand and model', () => {
    const result = selectFilteredVehicles(stateWith(sampleVehicles, { search: 'creta' }));
    expect(result).toHaveLength(1);
    expect(result[0].brand).toBe('Hyundai');
  });

  it('filters by price range', () => {
    const result = selectFilteredVehicles(
      stateWith(sampleVehicles, { minPrice: '2000000', maxPrice: '5000000' })
    );
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('sorts price low to high', () => {
    const result = selectFilteredVehicles(stateWith(sampleVehicles, {}, 'price-asc'));
    expect(result.map((v) => v.price)).toEqual([1850000, 4200000, 9500000]);
  });

  it('sorts price high to low', () => {
    const result = selectFilteredVehicles(stateWith(sampleVehicles, {}, 'price-desc'));
    expect(result[0].price).toBe(9500000);
  });

  it('returns empty array when nothing matches', () => {
    const result = selectFilteredVehicles(stateWith(sampleVehicles, { brand: 'Ferrari' }));
    expect(result).toEqual([]);
  });
});
