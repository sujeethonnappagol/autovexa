import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach JWT on every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/** Extract a readable error message from an Axios error */
export const getErrorMessage = (error, fallback = 'Something went wrong') => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.message) return error.message;
  return fallback;
};

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  vendorRegister: (data) => api.post('/auth/vendor/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  logout: () => api.post('/auth/logout'),
};

// ─── Vehicles ────────────────────────────────────────────────────────────────
export const vehicleAPI = {
  getAll: (params) => api.get('/vehicles', { params }),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
  toggleAvailability: (id) => api.patch(`/vehicles/${id}/availability`),
  getByVendor: (vendorId) => api.get(`/vehicles/vendor/${vendorId}`),
};

// ─── Bookings ────────────────────────────────────────────────────────────────
export const bookingAPI = {
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  getMyBookings: () => api.get('/bookings/my'),
  create: (data) => api.post('/bookings', data),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
  getInvoice: (id) => api.get(`/bookings/${id}/invoice`),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
};

// ─── Admin ───────────────────────────────────────────────────────────────────
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getVendors: (params) => api.get('/admin/vendors', { params }),
  createVendor: (data) => api.post('/admin/vendors', data),
  updateVendor: (id, data) => api.put(`/admin/vendors/${id}`, data),
  deleteVendor: (id) => api.delete(`/admin/vendors/${id}`),
  approveVendor: (id) => api.patch(`/admin/vendors/${id}/approve`),
  disableVendor: (id) => api.patch(`/admin/vendors/${id}/disable`),
  getUsers: (params) => api.get('/admin/users', { params }),
  getVehicles: (params) => api.get('/admin/vehicles', { params }),
  getBookings: (params) => api.get('/admin/bookings', { params }),
  disableVehicle: (id) => api.patch(`/admin/vehicles/${id}/disable`),
  removeVehicle: (id) => api.delete(`/admin/vehicles/${id}`),
};

// ─── Vendor ──────────────────────────────────────────────────────────────────
export const vendorAPI = {
  getStats: () => api.get('/vendor/stats'),
  getMyVehicles: () => api.get('/vendor/vehicles'),
  getMyBookings: () => api.get('/vendor/bookings'),
  updateProfile: (data) => api.put('/vendor/profile', data),
  getProfile: () => api.get('/vendor/profile'),
};

export default api;

// ─── Chat (VexaBot) ──────────────────────────────────────────────────────────
export const chatAPI = {
  send: (sessionId, message) => api.post('/chat', { sessionId, message }),
  getHistory: (sessionId) => api.get('/chat/history', { params: { sessionId } }),
  clearHistory: (sessionId) => api.delete('/chat/history', { params: { sessionId } }),
};
