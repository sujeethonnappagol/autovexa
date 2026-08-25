import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/public/Home';
import Vehicles from './pages/public/Vehicles';
import VehicleDetails from './pages/public/VehicleDetails';
import About from './pages/public/About';
import Contact from './pages/public/Contact';

import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import AdminLogin from './pages/auth/AdminLogin';
import VendorLogin from './pages/auth/VendorLogin';
import VendorRegister from './pages/auth/VendorRegister';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminVendors from './pages/admin/AdminVendors';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorVehicles from './pages/vendor/VendorVehicles';
import VendorAddVehicle from './pages/vendor/VendorAddVehicle';
import VendorBookings from './pages/vendor/VendorBookings';
import UserDashboard from './pages/user/UserDashboard';
import MyBookings from './pages/user/MyBookings';
import ChatBot from './components/ChatBot';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/vehicles/:id" element={<VehicleDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/vendor/login" element={<VendorLogin />} />
          <Route path="/vendor/register" element={<VendorRegister />} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/vendors" element={<ProtectedRoute allowedRoles={['admin']}><AdminVendors /></ProtectedRoute>} />
          <Route path="/admin/vehicles" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/bookings" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

          {/* Vendor */}
          <Route path="/vendor/dashboard" element={<ProtectedRoute allowedRoles={['vendor']}><VendorDashboard /></ProtectedRoute>} />
          <Route path="/vendor/vehicles" element={<ProtectedRoute allowedRoles={['vendor']}><VendorVehicles /></ProtectedRoute>} />
          <Route path="/vendor/vehicles/add" element={<ProtectedRoute allowedRoles={['vendor']}><VendorAddVehicle /></ProtectedRoute>} />
          <Route path="/vendor/bookings" element={<ProtectedRoute allowedRoles={['vendor']}><VendorBookings /></ProtectedRoute>} />

          {/* User */}
          <Route path="/user/dashboard" element={<ProtectedRoute allowedRoles={['user']}><UserDashboard /></ProtectedRoute>} />
          <Route path="/user/bookings" element={<ProtectedRoute allowedRoles={['user']}><MyBookings /></ProtectedRoute>} />
          <Route path="/user/bookings/:id" element={<ProtectedRoute allowedRoles={['user']}><MyBookings /></ProtectedRoute>} />
          <Route path="/user/profile" element={<ProtectedRoute allowedRoles={['user']}><UserDashboard /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
}

export default App;
