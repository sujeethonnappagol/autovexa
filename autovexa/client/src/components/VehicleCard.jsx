import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaGasPump, FaCogs, FaTachometerAlt, FaCheckCircle, FaClock } from 'react-icons/fa';

const FALLBACK = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600';

export default function VehicleCard({ vehicle }) {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useSelector((s) => s.auth);

  const formatPrice = (p) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(p) || 0);

  const available = vehicle.status === 'Available';
  const detailPath = `/vehicles/${vehicle.id}`;

  const handleBook = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated || role !== 'user') {
      navigate('/signup', {
        state: {
          from: detailPath,
          message: 'Please sign up or log in as a customer to book a vehicle.',
        },
      });
      return;
    }
    navigate(detailPath);
  };

  return (
    <div className="card group h-full flex flex-col">
      <Link to={detailPath} className="relative overflow-hidden bg-slate-100 shrink-0 block">
        <img
          src={vehicle.images?.[0] || FALLBACK}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="vehicle-img"
          loading="lazy"
        />
        <span
          className={`absolute top-3 left-3 status-badge shadow-sm backdrop-blur-md ${
            available ? 'bg-emerald-500/85 text-white' : 'bg-amber-500/85 text-white'
          }`}
        >
          {available ? (
            <>
              <FaCheckCircle className="text-[10px]" /> Available
            </>
          ) : (
            <>
              <FaClock className="text-[10px]" /> {vehicle.status}
            </>
          )}
        </span>
        <span className="absolute top-3 right-3 glass-dark text-white text-xs font-bold px-2.5 py-1 rounded-lg">
          {vehicle.year}
        </span>
      </Link>

      <div className="card-body flex flex-col flex-1">
        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
          {vehicle.brand}
        </p>
        <Link to={detailPath}>
          <h3 className="font-bold text-lg text-slate-900 leading-snug mb-3 hover:text-amber-600 transition">
            {vehicle.model}
          </h3>
        </Link>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-500 mb-4 pb-4 border-b border-slate-100">
          <span className="flex items-center gap-1.5">
            <FaGasPump className="text-slate-400" /> {vehicle.fuelType}
          </span>
          <span className="flex items-center gap-1.5">
            <FaCogs className="text-slate-400" /> {vehicle.transmission}
          </span>
          <span className="flex items-center gap-1.5">
            <FaTachometerAlt className="text-slate-400" /> {vehicle.mileage}
          </span>
        </div>

        <div className="mt-auto">
          <p className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
            {formatPrice(vehicle.price)}
          </p>
          <p className="text-xs text-slate-400 mb-4">by {vehicle.vendor?.name || 'Vendor'}</p>

          <div className="flex gap-2.5">
            <Link to={detailPath} className="flex-1 text-center btn-outline text-sm">
              Details
            </Link>
            {available && (
              <button type="button" onClick={handleBook} className="flex-1 btn-primary text-sm">
                Book Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
