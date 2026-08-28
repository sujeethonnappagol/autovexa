import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { vendorAPI, bookingAPI, getErrorMessage } from '../../services/api';
import Loading from '../../components/Loading';
import { USE_MOCK } from '../../utils/constants';
import { mockBookings, mockVehicles } from '../../utils/mockData';

export default function VendorBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await vendorAPI.getMyBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      if (USE_MOCK) {
        const vendorId = JSON.parse(localStorage.getItem('user') || '{}').id;
        setBookings(mockBookings.filter((booking) => !vendorId || booking.vendor?.id === vendorId));
      } else {
        setError(getErrorMessage(err, 'Failed to load bookings'));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const formatPrice = (p) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
      Number(p) || 0
    );

  const updateStatus = async (id, status) => {
    setBusyId(id);
    try {
      await bookingAPI.updateStatus(id, status);
      await load();
    } catch (err) {
      if (USE_MOCK) {
        const booking = mockBookings.find((item) => item.id === id);
        if (booking) {
          booking.status = status;
          if (status === 'Cancelled') {
            const vehicle = mockVehicles.find((item) => item.id === booking.vehicleId);
            if (vehicle) vehicle.status = 'Available';
          }
        }
        await load();
      } else {
        alert(getErrorMessage(err, 'Could not update booking'));
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="page-container py-10 md:py-14 animate-fade-up">
      <div className="mb-8">
        <Link to="/vendor/dashboard" className="text-sm text-amber-600 font-semibold hover:underline">
          ← Dashboard
        </Link>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2">Bookings</h1>
        <p className="text-slate-500 mt-1">Bookings for your vehicles</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl mb-6 text-sm">{error}</div>
      )}

      {loading ? (
        <Loading message="Loading bookings..." />
      ) : bookings.length === 0 ? (
        <div className="card-static p-12 text-center">
          <p className="text-lg font-semibold text-slate-700">No bookings yet</p>
          <p className="text-slate-500 mt-2">When customers book your vehicles, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const id = b.bookingId || b.id;
            const vehicleLabel = b.vehicle
              ? `${b.vehicle.brand || ''} ${b.vehicle.model || ''}`.trim()
              : 'Vehicle';
            const customerName = b.customer?.name || b.customerName || 'Customer';
            return (
              <div key={id} className="card-static p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                      {id}
                    </p>
                    <h3 className="font-bold text-lg text-slate-900 mt-0.5">{vehicleLabel}</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Customer: {customerName}
                      {b.customer?.phone || b.customerPhone
                        ? ` · ${b.customer?.phone || b.customerPhone}`
                        : ''}
                    </p>
                    <p className="text-sm text-slate-500">Date: {b.bookingDate || '—'}</p>
                    <p className="text-lg font-extrabold text-slate-900 mt-2">
                      {formatPrice(b.amount)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 items-start sm:items-end">
                    <span
                      className={`status-badge ${
                        b.status === 'Confirmed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : b.status === 'Cancelled'
                            ? 'bg-red-50 text-red-700'
                            : b.status === 'Completed'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {b.status}
                    </span>
                    {b.status === 'Pending' && (
                      <button
                        type="button"
                        disabled={busyId === id}
                        onClick={() => updateStatus(id, 'Confirmed')}
                        className="btn-primary text-sm !min-h-[36px]"
                      >
                        Confirm
                      </button>
                    )}
                    {(b.status === 'Pending' || b.status === 'Confirmed') && (
                      <button
                        type="button"
                        disabled={busyId === id}
                        onClick={() => updateStatus(id, 'Completed')}
                        className="btn-outline text-sm !min-h-[36px]"
                      >
                        Mark completed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
