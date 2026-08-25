import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVehicleById } from '../../redux/vehicleSlice';
import { createBooking } from '../../redux/bookingSlice';
import Loading from '../../components/Loading';
import { FaCheck, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800';

export default function VehicleDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedVehicle: vehicle, loading, error } = useSelector((s) => s.vehicles);
  const { isAuthenticated, role, user } = useSelector((s) => s.auth);
  const bookingState = useSelector((s) => s.bookings);
  const [imgIdx, setImgIdx] = useState(0);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bookingDate: '',
  });

  useEffect(() => {
    if (id) dispatch(fetchVehicleById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (user) {
      setBookingForm((f) => ({
        ...f,
        name: user.name || f.name,
        email: user.email || f.email,
        phone: user.phone || f.phone,
      }));
    }
  }, [user]);

  const formatPrice = (p) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(p) || 0);

  const openBooking = () => {
    if (!isAuthenticated || role !== 'user') {
      navigate('/signup', {
        state: {
          from: `/vehicles/${id}`,
          message: 'Please sign up or log in as a customer to book this vehicle.',
        },
      });
      return;
    }
    if (vehicle?.status !== 'Available') {
      setBookingError('This vehicle is not available for booking.');
      return;
    }
    setBookingError('');
    setShowBooking(true);
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setBookingError('');
    if (!isAuthenticated || role !== 'user') {
      navigate('/login');
      return;
    }
    const vehiclePrice = 50000;
    const bookingFee = 5000;
    const tax = 4000;
    const result = await dispatch(
      createBooking({
        vehicleId: vehicle.id,
        bookingDate: bookingForm.bookingDate,
        vehiclePrice,
        bookingFee,
        tax,
        name: bookingForm.name,
        email: bookingForm.email,
        phone: bookingForm.phone,
        address: bookingForm.address,
      })
    );
    if (createBooking.fulfilled.match(result)) {
      setShowBooking(false);
      navigate('/user/bookings');
    } else {
      setBookingError(result.payload || 'Booking failed. Please try again.');
    }
  };

  if (loading) return <Loading message="Loading vehicle details..." />;

  if (error || !vehicle) {
    return (
      <div className="page-container py-16 text-center">
        <p className="text-lg font-semibold text-slate-800 mb-2">Vehicle not found</p>
        <p className="text-slate-500 mb-6">{error || 'This listing may have been removed.'}</p>
        <Link to="/vehicles" className="btn-primary">
          Back to Vehicles
        </Link>
      </div>
    );
  }

  const images =
    vehicle.images?.length > 0 ? vehicle.images : [FALLBACK_IMG];
  const available = vehicle.status === 'Available';

  return (
    <div className="page-container py-10 md:py-14 animate-fade-up">
      <Link to="/vehicles" className="text-amber-600 font-semibold hover:underline mb-4 inline-block">
        ← Back to Vehicles
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        <div>
          <div className="relative rounded-2xl overflow-hidden bg-slate-100">
            <img
              src={images[imgIdx] || FALLBACK_IMG}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="w-full h-80 md:h-96 object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
                >
                  <FaChevronLeft />
                </button>
                <button
                  type="button"
                  onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
                >
                  <FaChevronRight />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {images.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setImgIdx(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 ${
                    i === imgIdx ? 'border-amber-500' : 'border-transparent'
                  }`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-amber-600 font-semibold text-sm uppercase tracking-wider">
            {vehicle.brand}
          </p>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
            {vehicle.model}{' '}
            <span className="text-slate-400 text-xl font-semibold">({vehicle.year})</span>
          </h1>
          <p className="text-3xl font-extrabold text-slate-900 mt-4">
            {formatPrice(vehicle.price)}
          </p>
          <span
            className={`status-badge mt-3 ${
              available ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
            }`}
          >
            {vehicle.status}
          </span>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm mt-6 mb-6">
            {[
              ['Fuel', vehicle.fuelType],
              ['Transmission', vehicle.transmission],
              ['Mileage', vehicle.mileage || '—'],
              ['Type', vehicle.type],
              ['Engine', vehicle.engine || '—'],
              ['Seats', vehicle.seatingCapacity || '—'],
              ['Color', vehicle.color || '—'],
              ['Vendor', vehicle.vendor?.name || '—'],
            ].map(([label, val]) => (
              <div key={label} className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 font-medium">{label}</p>
                <p className="font-semibold text-slate-800">{val}</p>
              </div>
            ))}
          </div>

          {vehicle.description && (
            <p className="text-slate-600 text-sm leading-relaxed mb-6">{vehicle.description}</p>
          )}

          {vehicle.features?.length > 0 && (
            <div className="mb-8">
              <h3 className="font-bold text-slate-900 mb-2">Features</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {vehicle.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                    <FaCheck className="text-emerald-500 text-xs shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {available ? (
            <button type="button" onClick={openBooking} className="btn-primary w-full text-lg">
              Book Now
            </button>
          ) : (
            <button type="button" disabled className="btn-primary w-full text-lg opacity-50 cursor-not-allowed">
              Currently Unavailable
            </button>
          )}
          {!isAuthenticated && (
            <p className="text-xs text-slate-500 mt-3 text-center">
              You need to{' '}
              <Link to="/signup" className="text-amber-600 font-semibold">
                sign up
              </Link>{' '}
              or{' '}
              <Link to="/login" className="text-amber-600 font-semibold">
                log in
              </Link>{' '}
              as a customer to book.
            </p>
          )}
        </div>
      </div>

      {showBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-xl font-bold mb-4">
              Book {vehicle.brand} {vehicle.model}
            </h3>
            {bookingError && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4">{bookingError}</div>
            )}
            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input
                  required
                  className="input-field"
                  value={bookingForm.name}
                  onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  required
                  className="input-field"
                  value={bookingForm.email}
                  onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  required
                  className="input-field"
                  value={bookingForm.phone}
                  onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Address</label>
                <textarea
                  required
                  className="input-field resize-none"
                  rows={2}
                  value={bookingForm.address}
                  onChange={(e) => setBookingForm({ ...bookingForm, address: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Booking Date</label>
                <input
                  type="date"
                  required
                  className="input-field"
                  value={bookingForm.bookingDate}
                  onChange={(e) => setBookingForm({ ...bookingForm, bookingDate: e.target.value })}
                />
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-sm space-y-1">
                <h4 className="font-bold mb-2">Booking Summary</h4>
                <div className="flex justify-between">
                  <span>Token amount</span>
                  <span>₹50,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Booking Fee</span>
                  <span>₹5,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>₹4,000</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2 mt-2">
                  <span>Total</span>
                  <span>₹59,000</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBooking(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingState.loading}
                  className="btn-primary flex-1"
                >
                  {bookingState.loading ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
