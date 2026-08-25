import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI, getErrorMessage } from '../services/api';
import { USE_MOCK } from '../utils/constants';
import { DEMO_CREDENTIALS } from '../utils/mockData';

/**
 * LOGIN
 * Tries real API first. Falls back to demo credentials when USE_MOCK is true
 * and the backend is unavailable.
 */
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password, role }, { rejectWithValue }) => {
    try {
      const { data } = await authAPI.login({ email, password, role });
      const { user, token } = data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { user, token };
    } catch (error) {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 600));
        let cred = null;
        if (
          role === 'admin' &&
          email === DEMO_CREDENTIALS.admin.email &&
          password === DEMO_CREDENTIALS.admin.password
        ) {
          cred = DEMO_CREDENTIALS.admin;
        } else if (
          role === 'vendor' &&
          email === DEMO_CREDENTIALS.vendor.email &&
          password === DEMO_CREDENTIALS.vendor.password
        ) {
          cred = DEMO_CREDENTIALS.vendor;
        } else if (
          role === 'user' &&
          email === DEMO_CREDENTIALS.user.email &&
          password === DEMO_CREDENTIALS.user.password
        ) {
          cred = DEMO_CREDENTIALS.user;
        }

        if (!cred) {
          return rejectWithValue('Invalid email or password');
        }
        if (role === 'vendor' && cred.status === 'Pending') {
          return rejectWithValue('Your vendor account is pending approval');
        }

        const token = `mock-jwt-${cred.role}-${Date.now()}`;
        const user = {
          id: cred.vendorId || cred.userId || 1,
          name: cred.name,
          email: cred.email,
          role: cred.role,
          status: cred.status || 'Active',
        };
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return { user, token };
      }
      return rejectWithValue(getErrorMessage(error, 'Login failed'));
    }
  }
);

/**
 * CUSTOMER REGISTER
 */
export const register = createAsyncThunk(
  'auth/register',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await authAPI.register(formData);
      return data;
    } catch (error) {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 800));
        return { message: 'Registration successful. Please login.' };
      }
      return rejectWithValue(getErrorMessage(error, 'Registration failed'));
    }
  }
);

/**
 * VENDOR REGISTER
 */
export const vendorRegister = createAsyncThunk(
  'auth/vendorRegister',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await authAPI.vendorRegister(formData);
      return data;
    } catch (error) {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 800));
        return {
          message:
            'Vendor registration submitted. Please wait for administrator approval.',
        };
      }
      return rejectWithValue(getErrorMessage(error, 'Vendor registration failed'));
    }
  }
);

/**
 * GET PROFILE
 */
export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await authAPI.getProfile();
      return data;
    } catch (error) {
      if (USE_MOCK) {
        const stored = localStorage.getItem('user');
        if (stored) return JSON.parse(stored);
      }
      return rejectWithValue(getErrorMessage(error, 'Failed to load profile'));
    }
  }
);

/**
 * UPDATE PROFILE
 */
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await authAPI.updateProfile(formData);
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (error) {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 500));
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        const updated = { ...stored, ...formData };
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
      }
      return rejectWithValue(getErrorMessage(error, 'Failed to update profile'));
    }
  }
);

const storedUser = localStorage.getItem('user');
const storedToken = localStorage.getItem('token');

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  role: storedUser ? JSON.parse(storedUser).role : null,
  isAuthenticated: !!(storedToken && storedUser),
  loading: false,
  error: null,
  successMessage: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;
      state.error = null;
      state.successMessage = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.role = action.payload.user.role;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.role = action.payload.user.role;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(vendorRegister.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(vendorRegister.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(vendorRegister.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.role = action.payload.role;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.successMessage = 'Profile updated successfully';
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;
