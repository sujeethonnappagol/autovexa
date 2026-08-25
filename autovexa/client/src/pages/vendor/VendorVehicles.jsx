import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { vendorAPI, vehicleAPI, getErrorMessage } from '../../services/api';
import Loading from '../../components/Loading';

export default function VendorVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await vendorAPI.getMyVehicles();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load vehicles'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const formatPrice = (p) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  const toggleAvailability = async (id) => {
    setBusyId(id);
    try {
      await vehicleAPI.toggleAvailability(id);
      await load();
    } catch (err) {
      alert(getErrorMessage(err, 'Could not update status'));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this vehicle?')) return;
    setBusyId(id);
    try {
      await vehicleAPI.delete(id);
      await load();
    } catch (err) {
      alert(getErrorMessage(err, 'Could not delete vehicle'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="page-container py-10 md:py-14 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <Link to="/vendor/dashboard" className="text-sm text-amber-600 font-semibold hover:underline">
            ← Dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2">My Vehicles</h1>
          <p className="text-slate-500 mt-1">{vehicles.length} listing(s)</p>
        </div>
        <Link to="/vendor/vehicles/add" className="btn-primary">
          + Add Vehicle
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl mb-6 text-sm">{error}</div>
      )}

      {loading ? (
        <Loading message="Loading your vehicles..." />
      ) : vehicles.length === 0 ? (
        <div className="card-static p-12 text-center">
          <p className="text-lg font-semibold text-slate-700">No vehicles yet</p>
          <p className="text-slate-500 mt-2 mb-6">Add your first vehicle to start receiving bookings.</p>
          <Link to="/vendor/vehicles/add" className="btn-primary">
            Add Vehicle
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {vehicles.map((v) => (
            <div key={v.id} className="card-static p-5 sm:p-6 flex flex-col md:flex-row gap-4 md:items-center">
              <img
                src={v.images?.[0] || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400'}
                alt={`${v.brand} ${v.model}`}
                className="w-full md:w-36 h-28 object-cover rounded-xl bg-slate-100 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">{v.brand}</p>
                <h3 className="font-bold text-lg text-slate-900">
                  {v.model} <span className="text-slate-400 font-medium text-sm">({v.year})</span>
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {v.fuelType} · {v.transmission} · {v.mileage || 'N/A'}
                </p>
                <p className="text-lg font-extrabold text-slate-900 mt-2">{formatPrice(v.price)}</p>
              </div>
              <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                <span
                  className={`status-badge justify-center ${
                    v.status === 'Available' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {v.status}
                </span>
                <button
                  type="button"
                  disabled={busyId === v.id}
                  onClick={() => toggleAvailability(v.id)}
                  className="btn-outline text-sm !min-h-[40px] !py-2"
                >
                  Toggle status
                </button>
                <button
                  type="button"
                  disabled={busyId === v.id}
                  onClick={() => remove(v.id)}
                  className="text-sm font-semibold text-red-600 hover:text-red-700 px-3 py-2"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
