# AutoVexa - Online Vehicle Showroom (MERN Frontend)

A modern, responsive vehicle marketplace frontend built with React, Redux Toolkit, React Router, and Tailwind CSS.

## Features

- **Public Website**: Home, Vehicles listing with filters/sort, Vehicle details, About, Contact
- **Authentication**: Separate login for Customer, Vendor, and Admin + registration flows
- **Role-based access**: Protected routes for Admin / Vendor / Customer
- **Customer**: Browse, filter, book vehicles, view bookings
- **Vendor**: Dashboard (mock), manage vehicles (structure ready)
- **Admin**: Dashboard with statistics
- **Mock data**: 15 realistic vehicles, vendors, bookings
- **API-ready Redux thunks**: All async actions call Axios first, fall back to mocks when backend is offline

## Tech Stack

- React 19 + Vite
- React Router DOM v7
- Redux Toolkit + React Redux (`createAsyncThunk`)
- Axios (JWT interceptors)
- Tailwind CSS v4
- React Icons

## Getting Started

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173

## Demo Credentials

| Role     | Email                  | Password   |
|----------|------------------------|------------|
| Admin    | admin@autovexa.com     | admin123   |
| Vendor   | abc@motors.com         | vendor123  |
| Customer | sujeet@example.com     | user123    |

## Environment

`.env`:
```
VITE_API_URL=http://localhost:5000/api
VITE_USE_MOCK=true
```

- `VITE_USE_MOCK=true` (default): if the API request fails, thunks return mock data so the UI keeps working without a backend.
- Set `VITE_USE_MOCK=false` once your Express backend is running to surface real API errors.

## Redux Thunk + API Pattern

Every async action uses **Redux Toolkit `createAsyncThunk`** and the shared Axios instance in `src/services/api.js`.

```
Component  →  dispatch(thunk())  →  createAsyncThunk
                                      │
                                      ├─ try  →  authAPI / vehicleAPI / bookingAPI  →  real backend
                                      │
                                      └─ catch →  if USE_MOCK → return mock data
                                                  else → rejectWithValue(error message)
```

### Auth thunks (`authSlice.js`)
| Thunk            | API call                    |
|------------------|-----------------------------|
| `login`          | `POST /auth/login`          |
| `register`       | `POST /auth/register`       |
| `vendorRegister` | `POST /auth/vendor/register`|
| `fetchProfile`   | `GET  /auth/profile`        |
| `updateProfile`  | `PUT  /auth/profile`        |

### Vehicle thunks (`vehicleSlice.js`)
| Thunk                       | API call                          |
|-----------------------------|-----------------------------------|
| `fetchVehicles`             | `GET  /vehicles`                  |
| `fetchVehicleById`          | `GET  /vehicles/:id`              |
| `createVehicle`             | `POST /vehicles`                  |
| `updateVehicleThunk`        | `PUT  /vehicles/:id`              |
| `deleteVehicleThunk`        | `DELETE /vehicles/:id`            |
| `toggleVehicleAvailability` | `PATCH /vehicles/:id/availability`|

### Booking thunks (`bookingSlice.js`)
| Thunk                      | API call                        |
|----------------------------|---------------------------------|
| `fetchBookings`            | `GET  /bookings`                |
| `fetchMyBookings`          | `GET  /bookings/my`             |
| `fetchBookingById`         | `GET  /bookings/:id`            |
| `createBooking`            | `POST /bookings`                |
| `updateBookingStatusThunk` | `PATCH /bookings/:id/status`    |
| `cancelBooking`            | `PATCH /bookings/:id/cancel`    |
| `fetchInvoice`             | `GET  /bookings/:id/invoice`    |

### Example usage in a component

```jsx
import { useDispatch, useSelector } from 'react-redux';
import { fetchVehicles, selectFilteredVehicles } from '../redux/vehicleSlice';

const dispatch = useDispatch();
const vehicles = useSelector(selectFilteredVehicles);
const { loading, error } = useSelector((s) => s.vehicles);

useEffect(() => {
  dispatch(fetchVehicles());
}, [dispatch]);
```

JWT is attached automatically by the Axios request interceptor. On 401 the response interceptor clears storage and redirects to `/login`.

## Project Structure

```
src/
├── components/     # Navbar, Footer, VehicleCard, Loading, ProtectedRoute
├── pages/
│   ├── public/     # Home, Vehicles, VehicleDetails, About, Contact
│   ├── auth/       # Login, Signup, AdminLogin, VendorLogin, VendorRegister
│   ├── admin/      # AdminDashboard
│   ├── vendor/     # VendorDashboard
│   └── user/       # UserDashboard, MyBookings
├── redux/          # authSlice, vehicleSlice, bookingSlice, store
├── services/       # api.js (Axios + authAPI, vehicleAPI, bookingAPI, adminAPI, vendorAPI)
└── utils/          # constants.js (USE_MOCK, API_BASE_URL), mockData.js
```

## Switching to real backend

1. Start your Express server on port 5000 (or update `VITE_API_URL`).
2. Set `VITE_USE_MOCK=false` in `.env`.
3. Ensure backend responses match the shapes expected by the thunks:
   - Login: `{ user: { id, name, email, role }, token: "..." }`
   - Lists: array or `{ vehicles: [...] }` / `{ bookings: [...] }`
   - Single item: object or `{ vehicle: {...} }` / `{ booking: {...} }`

No component changes are required — only the thunk layer talks to the network.

## License

MIT

## Unit Testing Strategy

This project uses **Vitest** + **React Testing Library**.

### Commands

```bash
npm test              # run all unit tests once
npm run test:watch    # watch mode during development
npm run test:coverage # coverage report (text + html)
```

### What we test (pyramid)

| Layer | Examples | Goal |
|-------|----------|------|
| **Pure utils** | `findAnswer`, filter selectors | Fast, no DOM |
| **Redux** | `authSlice`, `vehicleSlice` reducers/selectors | State transitions |
| **Components** | `VehicleCard`, `ProtectedRoute`, `Loading` | UI contracts & access control |

### Guidelines

1. Prefer testing **behavior** over implementation details.
2. Keep async API thunks thin — mock `api.js` when testing them.
3. Use `renderWithProviders` (`src/test/testUtils.jsx`) for Redux + Router.
4. Colocate tests under `__tests__/` next to the module.
5. Name tests as plain English: `it('redirects unauthenticated users to login')`.

