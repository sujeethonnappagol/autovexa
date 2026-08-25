import { useSelector } from 'react-redux';
import { mockUserStats } from '../../utils/mockData';
import { Link } from 'react-router-dom';

export default function UserDashboard() {
  const { user } = useSelector((s) => s.auth);
  const s = mockUserStats;
  return (
    <div className="page-container max-w-5xl py-10 md:py-14 animate-fade-up">
      <h1 className="text-2xl font-bold mb-2">Welcome, {user?.name}</h1>
      <p className="text-slate-500 mb-8">Customer Dashboard</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 mb-10">
        {[
          { label: 'Total Bookings', value: s.totalBookings },
          { label: 'Pending', value: s.pendingBookings },
          { label: 'Confirmed', value: s.confirmedBookings },
          { label: 'Completed', value: s.completedBookings },
        ].map((c) => (
          <div key={c.label} className="card-static p-5 sm:p-6 text-center">
            <p className="text-2xl font-bold text-amber-500">{c.value}</p>
            <p className="text-sm text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <Link to="/vehicles" className="btn-primary">Browse Vehicles</Link>
        <Link to="/user/bookings" className="btn-outline">My Bookings</Link>
      </div>
    </div>
  );
}
