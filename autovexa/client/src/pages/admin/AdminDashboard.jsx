import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { adminAPI, getErrorMessage } from '../../services/api';
import Loading from '../../components/Loading';

export default function AdminDashboard() {
  const { user } = useSelector((s) => s.auth);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await adminAPI.getStats();
        setStats(data);
      } catch (err) {
        setError(getErrorMessage(err, 'Could not load stats'));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cards = [
    { label: 'Total Vendors', value: stats?.totalVendors ?? 0, color: 'bg-blue-500' },
    { label: 'Active Vendors', value: stats?.activeVendors ?? 0, color: 'bg-emerald-500' },
    { label: 'Total Vehicles', value: stats?.totalVehicles ?? 0, color: 'bg-indigo-500' },
    { label: 'Customers', value: stats?.totalCustomers ?? 0, color: 'bg-purple-500' },
    { label: 'Total Bookings', value: stats?.totalBookings ?? 0, color: 'bg-amber-500' },
    { label: 'Available Vehicles', value: stats?.availableVehicles ?? 0, color: 'bg-teal-500' },
  ];

  return (
    <div className="page-container py-10 md:py-14 animate-fade-up">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-1">
        Welcome, {user?.name || 'Admin'}
      </h1>
      <p className="text-slate-500 mb-8">Admin Dashboard</p>

      {error && (
        <div className="bg-amber-50 text-amber-800 p-3 rounded-xl mb-6 text-sm">{error}</div>
      )}

      {loading ? (
        <Loading message="Loading stats..." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mb-10">
          {cards.map((c) => (
            <div key={c.label} className="card-static p-6 flex items-center gap-4">
              <div
                className={`w-12 h-12 ${c.color} rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0`}
              >
                {c.value}
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{c.value}</p>
                <p className="text-slate-500 text-sm">{c.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Link to="/admin/vendors" className="btn-primary">
          Manage Vendors
        </Link>
        <Link to="/vehicles" className="btn-secondary">
          View All Vehicles
        </Link>
        <Link to="/admin/dashboard" className="btn-outline">
          Refresh
        </Link>
      </div>
    </div>
  );
}
