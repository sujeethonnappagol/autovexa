import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingAPI, getErrorMessage } from '../services/api';
import { USE_MOCK } from '../utils/constants';
import { mockBookings } from '../utils/mockData';

/**
 * FETCH ALL BOOKINGS
 */
export const fetchBookings = createAsyncThunk(
  'bookings/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await bookingAPI.getAll(params);
      return Array.isArray(data) ? data : data.bookings || data.data || [];
    } catch (error) {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 400));
        return mockBookings;
      }
      return rejectWithValue(getErrorMessage(error, 'Failed to load bookings'));
    }
  }
);

/**
 * FETCH MY BOOKINGS (customer)
 */
export const fetchMyBookings = createAsyncThunk(
  'bookings/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await bookingAPI.getMyBookings();
      return Array.isArray(data) ? data : data.bookings || data.data || [];
    } catch (error) {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 400));
        return mockBookings;
      }
      return rejectWithValue(getErrorMessage(error, 'Failed to load your bookings'));
    }
  }
);

/**
 * FETCH SINGLE BOOKING
 */
export const fetchBookingById = createAsyncThunk(
  'bookings/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await bookingAPI.getById(id);
      return data.booking || data;
    } catch (error) {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 300));
        const booking = mockBookings.find((b) => b.id === id);
        if (!booking) return rejectWithValue('Booking not found');
        return booking;
      }
      return rejectWithValue(getErrorMessage(error, 'Booking not found'));
    }
  }
);

/**
 * CREATE BOOKING
 */
export const createBooking = createAsyncThunk(
  'bookings/create',
  async (bookingData, { rejectWithValue }) => {
    try {
      const { data } = await bookingAPI.create(bookingData);
      return data.booking || data;
    } catch (error) {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 800));
        return {
          id: `BK${Date.now().toString().slice(-5)}`,
          ...bookingData,
          status: 'Confirmed',
          createdAt: new Date().toISOString().split('T')[0],
          amount:
            (bookingData.vehiclePrice || 0) +
            (bookingData.bookingFee || 0) +
            (bookingData.tax || 0),
        };
      }
      return rejectWithValue(getErrorMessage(error, 'Booking failed'));
    }
  }
);

/**
 * UPDATE BOOKING STATUS
 */
export const updateBookingStatusThunk = createAsyncThunk(
  'bookings/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await bookingAPI.updateStatus(id, status);
      return data.booking || { id, status };
    } catch (error) {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 400));
        return { id, status };
      }
      return rejectWithValue(getErrorMessage(error, 'Failed to update booking status'));
    }
  }
);

/**
 * CANCEL BOOKING
 */
export const cancelBooking = createAsyncThunk(
  'bookings/cancel',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await bookingAPI.cancel(id);
      return data.booking || { id, status: 'Cancelled' };
    } catch (error) {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 400));
        return { id, status: 'Cancelled' };
      }
      return rejectWithValue(getErrorMessage(error, 'Failed to cancel booking'));
    }
  }
);

/**
 * FETCH INVOICE
 */
export const fetchInvoice = createAsyncThunk(
  'bookings/fetchInvoice',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await bookingAPI.getInvoice(id);
      return data;
    } catch (error) {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 300));
        const booking = mockBookings.find((b) => b.id === id);
        if (!booking) return rejectWithValue('Invoice not found');
        return {
          invoiceNo: `INV-2026-${String(booking.id).replace(/\D/g, '').padStart(5, '0')}`,
          date: booking.bookingDate || booking.createdAt,
          customer: booking.customer,
          vehicle: booking.vehicle,
          vendor: booking.vendor,
          vehicleAmount: booking.vehiclePrice,
          bookingFee: booking.bookingFee,
          tax: booking.tax,
          total: booking.amount,
          status: booking.status,
        };
      }
      return rejectWithValue(getErrorMessage(error, 'Failed to load invoice'));
    }
  }
);

const initialState = {
  bookings: [],
  selectedBooking: null,
  invoice: null,
  loading: false,
  error: null,
  success: false,
  successMessage: null,
};

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    setSelectedBooking: (state, action) => {
      state.selectedBooking = action.payload;
    },
    clearSelectedBooking: (state) => {
      state.selectedBooking = null;
    },
    clearBookingSuccess: (state) => {
      state.success = false;
      state.successMessage = null;
    },
    clearBookingError: (state) => {
      state.error = null;
    },
    updateBookingStatusLocal: (state, action) => {
      const { id, status } = action.payload;
      const booking = state.bookings.find((b) => b.id === id);
      if (booking) booking.status = status;
      if (state.selectedBooking?.id === id) {
        state.selectedBooking.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMyBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchBookingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBooking = action.payload;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.successMessage = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings.unshift(action.payload);
        state.selectedBooking = action.payload;
        state.success = true;
        state.successMessage = 'Booking confirmed successfully';
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateBookingStatusThunk.fulfilled, (state, action) => {
        const { id, status } = action.payload;
        const booking = state.bookings.find((b) => b.id === id);
        if (booking) booking.status = status;
        if (state.selectedBooking?.id === id) {
          state.selectedBooking.status = status;
        }
        state.successMessage = 'Booking status updated';
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        const { id, status } = action.payload;
        const booking = state.bookings.find((b) => b.id === id);
        if (booking) booking.status = status || 'Cancelled';
        if (state.selectedBooking?.id === id) {
          state.selectedBooking.status = status || 'Cancelled';
        }
        state.successMessage = 'Booking cancelled';
      })
      .addCase(fetchInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.invoice = action.payload;
      })
      .addCase(fetchInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedBooking,
  clearSelectedBooking,
  clearBookingSuccess,
  clearBookingError,
  updateBookingStatusLocal,
} = bookingSlice.actions;

export const updateBookingStatus = updateBookingStatusLocal;

export default bookingSlice.reducer;
