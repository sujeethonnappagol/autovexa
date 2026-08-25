import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { vendorAPI, getErrorMessage } from '../../services/api';
import Loading from '../../components/Loading';

export default function VendorDashboard() {
  const { user } = useSelector((s) => s.auth);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await vendorAPI.getStats();
        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, 'Could not load stats'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    { label: 'Total Vehicles', value: stats?.totalVehicles ?? 0 },
    { label: 'Available', value: stats?.availableVehicles ?? 0 },
    { label: 'Booked', value: stats?.bookedVehicles ?? 0 },
    { label: 'Total Bookings', value: stats?.totalBookings ?? 0 },
    { label: 'Pending', value: stats?.pendingBookings ?? 0 },
    { label: 'Confirmed', value: stats?.confirmedBookings ?? 0 },
  ];

  return (
    <div className="page-container py-10 md:py-14 animate-fade-up">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-1">
        Welcome, {user?.name || user?.businessName || 'Vendor'}
      </h1>
      <p className="text-slate-500 mb-8">Vendor Dashboard</p>

      {error && (
        <div className="bg-amber-50 border border-amber-100 text-amber-800 p-3 rounded-xl mb-6 text-sm">
          {error} — make sure the API is running on port 5000.
        </div>
      )}

      {loading ? (
        <Loading message="Loading dashboard..." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mb-10">
          {cards.map((c) => (
            <div key={c.label} className="card-static p-6">
              <p className="text-3xl font-bold text-amber-500">{c.value}</p>
              <p className="text-slate-500 mt-1">{c.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Link to="/vendor/vehicles" className="btn-primary">
          My Vehicles
        </Link>
        <Link to="/vendor/vehicles/add" className="btn-secondary">
          Add Vehicle
        </Link>
        <Link to="/vendor/bookings" className="btn-outline">
          Bookings
        </Link>
      </div>
    </div>
  );
}
