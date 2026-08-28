import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { vehicleAPI, getErrorMessage } from '../services/api';
import { USE_MOCK } from '../utils/constants';
import { mockVehicles } from '../utils/mockData';

/**
 * FETCH ALL VEHICLES
 * Calls GET /vehicles. Falls back to mockVehicles when backend is down.
 */
export const fetchVehicles = createAsyncThunk(
  'vehicles/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await vehicleAPI.getAll(params);
      return Array.isArray(data) ? data : data.vehicles || data.data || [];
    } catch (error) {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 400));
        return mockVehicles;
      }
      return rejectWithValue(getErrorMessage(error, 'Failed to load vehicles'));
    }
  }
);

/**
 * FETCH SINGLE VEHICLE
 */
export const fetchVehicleById = createAsyncThunk(
  'vehicles/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await vehicleAPI.getById(id);
      return data.vehicle || data;
    } catch (error) {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 300));
        const vehicle = mockVehicles.find((v) => String(v.id) === String(id));
        if (!vehicle) return rejectWithValue('Vehicle not found');
        return vehicle;
      }
      return rejectWithValue(getErrorMessage(error, 'Vehicle not found'));
    }
  }
);

/**
 * CREATE VEHICLE (Vendor)
 */
export const createVehicle = createAsyncThunk(
  'vehicles/create',
  async (vehicleData, { rejectWithValue, getState }) => {
    try {
      const { data } = await vehicleAPI.create(vehicleData);
      return data.vehicle || data;
    } catch (error) {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 600));
        const user = getState().auth.user || {};
        const vehicle = {
          ...vehicleData,
          id: Date.now(),
          vendor: {
            id: user.id,
            name: user.businessName || user.name || 'Vendor',
            email: user.email,
            phone: user.phone,
          },
          status: 'Available',
          createdAt: new Date().toISOString().split('T')[0],
          images: vehicleData.images?.length
            ? vehicleData.images
            : ['https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800'],
        };
          mockVehicles.unshift(vehicle);
          return vehicle;
      }
      return rejectWithValue(getErrorMessage(error, 'Failed to add vehicle'));
    }
  }
);

/**
 * UPDATE VEHICLE
 */
export const updateVehicleThunk = createAsyncThunk(
  'vehicles/update',
  async ({ id, ...vehicleData }, { rejectWithValue }) => {
    try {
      const { data } = await vehicleAPI.update(id, vehicleData);
      return data.vehicle || data;
    } catch (error) {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 500));
        return { id, ...vehicleData };
      }
      return rejectWithValue(getErrorMessage(error, 'Failed to update vehicle'));
    }
  }
);

/**
 * DELETE VEHICLE
 */
export const deleteVehicleThunk = createAsyncThunk(
  'vehicles/delete',
  async (id, { rejectWithValue }) => {
    try {
      await vehicleAPI.delete(id);
      return id;
    } catch (error) {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 400));
        return id;
      }
      return rejectWithValue(getErrorMessage(error, 'Failed to delete vehicle'));
    }
  }
);

/**
 * TOGGLE AVAILABILITY
 */
export const toggleVehicleAvailability = createAsyncThunk(
  'vehicles/toggleAvailability',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await vehicleAPI.toggleAvailability(id);
      return data.vehicle || data;
    } catch (error) {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 300));
        return { id, toggled: true };
      }
      return rejectWithValue(getErrorMessage(error, 'Failed to update availability'));
    }
  }
);

const initialState = {
  vehicles: [],
  selectedVehicle: null,
  loading: false,
  error: null,
  successMessage: null,
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
  },
  sortBy: 'newest',
};

const vehicleSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setSelectedVehicle: (state, action) => {
      state.selectedVehicle = action.payload;
    },
    clearSelectedVehicle: (state) => {
      state.selectedVehicle = null;
    },
    clearVehicleError: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    addVehicleLocal: (state, action) => {
      state.vehicles.unshift(action.payload);
    },
    updateVehicleLocal: (state, action) => {
      const index = state.vehicles.findIndex((v) => v.id === action.payload.id);
      if (index !== -1) {
        state.vehicles[index] = { ...state.vehicles[index], ...action.payload };
      }
    },
    deleteVehicleLocal: (state, action) => {
      state.vehicles = state.vehicles.filter((v) => v.id !== action.payload);
    },
    toggleAvailabilityLocal: (state, action) => {
      const vehicle = state.vehicles.find((v) => v.id === action.payload);
      if (vehicle) {
        vehicle.status = vehicle.status === 'Available' ? 'Booked' : 'Available';
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = action.payload;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchVehicleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicleById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedVehicle = action.payload;
      })
      .addCase(fetchVehicleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createVehicle.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createVehicle.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles.unshift(action.payload);
        state.successMessage = 'Vehicle added successfully';
      })
      .addCase(createVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateVehicleThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVehicleThunk.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.vehicles.findIndex((v) => v.id === action.payload.id);
        if (index !== -1) {
          state.vehicles[index] = { ...state.vehicles[index], ...action.payload };
        }
        if (state.selectedVehicle?.id === action.payload.id) {
          state.selectedVehicle = { ...state.selectedVehicle, ...action.payload };
        }
        state.successMessage = 'Vehicle updated successfully';
      })
      .addCase(updateVehicleThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteVehicleThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVehicleThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = state.vehicles.filter((v) => v.id !== action.payload);
        state.successMessage = 'Vehicle deleted successfully';
      })
      .addCase(deleteVehicleThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleVehicleAvailability.fulfilled, (state, action) => {
        const id = action.payload.id || action.meta.arg;
        const vehicle = state.vehicles.find((v) => v.id === id);
        if (vehicle) {
          if (action.payload.status) {
            vehicle.status = action.payload.status;
          } else {
            vehicle.status = vehicle.status === 'Available' ? 'Booked' : 'Available';
          }
        }
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setSortBy,
  setSelectedVehicle,
  clearSelectedVehicle,
  clearVehicleError,
  addVehicleLocal,
  updateVehicleLocal,
  deleteVehicleLocal,
  toggleAvailabilityLocal,
} = vehicleSlice.actions;

// Aliases for existing components that import the old names
export const addVehicle = addVehicleLocal;
export const updateVehicle = updateVehicleLocal;
export const deleteVehicle = deleteVehicleLocal;
export const toggleAvailability = toggleAvailabilityLocal;

export default vehicleSlice.reducer;

/**
 * Client-side filter + sort selector.
 * When the backend supports query params, prefer passing filters to fetchVehicles.
 */
export const selectFilteredVehicles = (state) => {
  const { vehicles, filters, sortBy } = state.vehicles;
  let result = [...vehicles];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (v) =>
        v.brand?.toLowerCase().includes(q) ||
        v.model?.toLowerCase().includes(q) ||
        `${v.brand} ${v.model}`.toLowerCase().includes(q)
    );
  }
  if (filters.brand) result = result.filter((v) => v.brand === filters.brand);
  if (filters.type) result = result.filter((v) => v.type === filters.type);
  if (filters.fuelType) result = result.filter((v) => v.fuelType === filters.fuelType);
  if (filters.transmission)
    result = result.filter((v) => v.transmission === filters.transmission);
  if (filters.minPrice) result = result.filter((v) => v.price >= Number(filters.minPrice));
  if (filters.maxPrice) result = result.filter((v) => v.price <= Number(filters.maxPrice));
  if (filters.year) result = result.filter((v) => v.year === Number(filters.year));
  if (filters.status) result = result.filter((v) => v.status === filters.status);

  switch (sortBy) {
    case 'price-asc':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'newest':
      result.sort(
        (a, b) => b.year - a.year || new Date(b.createdAt) - new Date(a.createdAt)
      );
      break;
    case 'oldest':
      result.sort(
        (a, b) => a.year - b.year || new Date(a.createdAt) - new Date(b.createdAt)
      );
      break;
    default:
      break;
  }

  return result;
};
