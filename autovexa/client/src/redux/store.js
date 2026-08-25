import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import vehicleReducer from './vehicleSlice';
import bookingReducer from './bookingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    vehicles: vehicleReducer,
    bookings: bookingReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});
