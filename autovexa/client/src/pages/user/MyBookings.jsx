import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchBookings } from '../../redux/bookingSlice';
import Loading from '../../components/Loading';

export default function MyBookings() {
  const dispatch = useDispatch();
  const { bookings, loading } = useSelector((s) => s.bookings);

  useEffect(() => { dispatch(fetchBookings()); }, [dispatch]);

  const statusClass = { Pending: 'bg-yellow-100 text-yellow-800', Confirmed: 'bg-blue-100 text-blue-800', Cancelled: 'bg-red-100 text-red-800', Completed: 'bg-purple-100 text-purple-800' };

  if (loading) return <Loading />;

  return (
    <div className="page-container max-w-5xl py-10 md:py-14 animate-fade-up">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
      {bookings.length === 0 ? (
        <div className="text-center py-16"><p className="text-slate-500">No bookings yet.</p><Link to="/vehicles" className="btn-primary mt-4 inline-block">Browse Vehicles</Link></div>
      ) : (
        <div className="space-y-5">
          {bookings.map((b) => (
            <div key={b.id} className="card-static p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div>
                <p className="font-bold">{b.vehicle?.brand} {b.vehicle?.model}</p>
                <p className="text-sm text-slate-500">Booking ID: {b.id} · {b.bookingDate}</p>
                <p className="text-sm">Vendor: {b.vendor?.businessName || b.vendor?.name}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`status-badge ${statusClass[b.status] || ''}`}>{b.status}</span>
                <p className="font-bold">₹{b.amount?.toLocaleString('en-IN')}</p>
                <Link to={`/user/bookings/${b.id}`} className="btn-outline text-sm py-1.5 px-3">View</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
