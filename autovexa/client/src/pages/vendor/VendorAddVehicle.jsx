import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createVehicle } from '../../redux/vehicleSlice';
import { BRANDS, VEHICLE_TYPES, FUEL_TYPES, TRANSMISSIONS, FEATURES_LIST } from '../../utils/constants';

const empty = {
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  price: '',
  fuelType: 'Petrol',
  transmission: 'Manual',
  mileage: '',
  engine: '',
  seatingCapacity: 5,
  color: '',
  type: 'SUV',
  description: '',
  features: [],
  images: '',
  status: 'Available',
};

export default function VendorAddVehicle() {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.vehicles);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const toggleFeature = (feat) => {
    setForm((f) => ({
      ...f,
      features: f.features.includes(feat)
        ? f.features.filter((x) => x !== feat)
        : [...f.features, feat],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.brand || !form.model || !form.price) {
      setError('Brand, model and price are required.');
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      year: Number(form.year),
      price: Number(form.price),
      seatingCapacity: Number(form.seatingCapacity) || 5,
      images: form.images
        ? form.images.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    };
    const result = await dispatch(createVehicle(payload));
    setSaving(false);
    if (createVehicle.fulfilled.match(result)) {
      navigate('/vendor/vehicles');
    } else {
      setError(result.payload || 'Failed to add vehicle');
    }
  };

  return (
    <div className="page-container py-10 md:py-14 animate-fade-up max-w-3xl">
      <div className="mb-8">
        <Link to="/vendor/dashboard" className="text-sm text-amber-600 font-semibold hover:underline">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2">Add Vehicle</h1>
        <p className="text-slate-500 mt-1">List a new vehicle in your showroom</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl mb-6 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card-static p-6 sm:p-8 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Brand *</label>
            <select required className="input-field" value={form.brand} onChange={(e) => set('brand', e.target.value)}>
              <option value="">Select brand</option>
              {BRANDS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Model *</label>
            <input required className="input-field" placeholder="e.g. Fortuner" value={form.model} onChange={(e) => set('model', e.target.value)} />
          </div>
          <div>
            <label className="label">Year *</label>
            <input type="number" required className="input-field" min="1990" max="2030" value={form.year} onChange={(e) => set('year', e.target.value)} />
          </div>
          <div>
            <label className="label">Price (INR) *</label>
            <input type="number" required className="input-field" min="0" placeholder="1500000" value={form.price} onChange={(e) => set('price', e.target.value)} />
          </div>
          <div>
            <label className="label">Vehicle Type</label>
            <select className="input-field" value={form.type} onChange={(e) => set('type', e.target.value)}>
              {VEHICLE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Fuel Type</label>
            <select className="input-field" value={form.fuelType} onChange={(e) => set('fuelType', e.target.value)}>
              {FUEL_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Transmission</label>
            <select className="input-field" value={form.transmission} onChange={(e) => set('transmission', e.target.value)}>
              {TRANSMISSIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Mileage</label>
            <input className="input-field" placeholder="e.g. 17 km/l" value={form.mileage} onChange={(e) => set('mileage', e.target.value)} />
          </div>
          <div>
            <label className="label">Engine</label>
            <input className="input-field" placeholder="e.g. 1498 CC" value={form.engine} onChange={(e) => set('engine', e.target.value)} />
          </div>
          <div>
            <label className="label">Seating Capacity</label>
            <input type="number" className="input-field" min="1" max="12" value={form.seatingCapacity} onChange={(e) => set('seatingCapacity', e.target.value)} />
          </div>
          <div>
            <label className="label">Color</label>
            <input className="input-field" placeholder="White" value={form.color} onChange={(e) => set('color', e.target.value)} />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input-field" value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option value="Available">Available</option>
              <option value="Booked">Booked</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">Image URLs (comma-separated)</label>
          <input
            className="input-field"
            placeholder="https://example.com/car.jpg"
            value={form.images}
            onChange={(e) => set('images', e.target.value)}
          />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            className="input-field resize-none"
            rows={3}
            placeholder="Short description of the vehicle"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </div>

        <div>
          <label className="label mb-2">Features</label>
          <div className="flex flex-wrap gap-2">
            {FEATURES_LIST.map((feat) => (
              <button
                key={feat}
                type="button"
                onClick={() => toggleFeature(feat)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition ${
                  form.features.includes(feat)
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-amber-400'
                }`}
              >
                {feat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" disabled={saving || loading} className="btn-primary">
            {saving || loading ? 'Saving...' : 'Add Vehicle'}
          </button>
          <Link to="/vendor/vehicles" className="btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
