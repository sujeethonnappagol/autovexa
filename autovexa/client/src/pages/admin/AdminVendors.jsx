import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, getErrorMessage } from '../../services/api';
import Loading from '../../components/Loading';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  businessName: '',
  address: '',
  gstNumber: '',
  password: '',
};

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [createdCreds, setCreatedCreds] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await adminAPI.getVendors();
      setVendors(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load vendors'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { data } = await adminAPI.createVendor(form);
      setCreatedCreds({
        email: data.loginEmail || data.email,
        password: data.loginPassword || form.password || 'vendor123',
        name: data.name,
        businessName: data.businessName,
      });
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not create vendor'));
    } finally {
      setSaving(false);
    }
  };

  const approve = async (id) => {
    setBusyId(id);
    try {
      await adminAPI.approveVendor(id);
      await load();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const disable = async (id) => {
    setBusyId(id);
    try {
      await adminAPI.disableVendor(id);
      await load();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this vendor permanently?')) return;
    setBusyId(id);
    try {
      await adminAPI.deleteVendor(id);
      await load();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="page-container py-10 md:py-14 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <Link to="/admin/dashboard" className="text-sm text-amber-600 font-semibold hover:underline">
            ← Dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2">Manage Vendors</h1>
          <p className="text-slate-500 mt-1">
            Create vendors and share their login email &amp; password with them.
          </p>
        </div>
        <button type="button" onClick={() => setShowForm((s) => !s)} className="btn-primary">
          {showForm ? 'Close form' : '+ Add Vendor'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {createdCreds && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-6">
          <p className="font-bold text-emerald-800 mb-2">Vendor created — share these login details</p>
          <p className="text-sm text-emerald-900">
            <strong>Name:</strong> {createdCreds.name}
            {createdCreds.businessName ? ` (${createdCreds.businessName})` : ''}
          </p>
          <p className="text-sm text-emerald-900">
            <strong>Email:</strong> {createdCreds.email}
          </p>
          <p className="text-sm text-emerald-900">
            <strong>Password:</strong> {createdCreds.password}
          </p>
          <p className="text-xs text-emerald-700 mt-2">
            Vendor login page: /vendor/login — passwords are not shown again after you close this.
          </p>
          <button
            type="button"
            className="text-sm font-semibold text-emerald-800 underline mt-2"
            onClick={() => setCreatedCreds(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="card-static p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Owner Name *</label>
            <input required className="input-field" value={form.name} onChange={(e) => set('name', e.target.value)} />
          </div>
          <div>
            <label className="label">Business Name</label>
            <input className="input-field" value={form.businessName} onChange={(e) => set('businessName', e.target.value)} />
          </div>
          <div>
            <label className="label">Login Email *</label>
            <input type="email" required className="input-field" value={form.email} onChange={(e) => set('email', e.target.value)} />
          </div>
          <div>
            <label className="label">Login Password *</label>
            <input
              required
              className="input-field"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              minLength={6}
            />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input-field" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </div>
          <div>
            <label className="label">GST Number</label>
            <input className="input-field" value={form.gstNumber} onChange={(e) => set('gstNumber', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Address</label>
            <input className="input-field" value={form.address} onChange={(e) => set('address', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Creating...' : 'Create Vendor Account'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <Loading message="Loading vendors..." />
      ) : vendors.length === 0 ? (
        <div className="card-static p-10 text-center text-slate-500">No vendors yet. Add one above.</div>
      ) : (
        <div className="space-y-3">
          {vendors.map((v) => (
            <div
              key={v.id}
              className="card-static p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <p className="font-bold text-slate-900">
                  {v.businessName || v.name}{' '}
                  <span className="text-slate-400 font-normal text-sm">({v.name})</span>
                </p>
                <p className="text-sm text-slate-500 mt-0.5">
                  {v.email} {v.phone ? `· ${v.phone}` : ''}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Vehicles: {v.totalVehicles ?? 0} · Status:{' '}
                  <span className="font-semibold">{v.vendorStatus || v.status}</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(v.vendorStatus === 'Pending' || v.status === 'Pending') && (
                  <button
                    type="button"
                    disabled={busyId === v.id}
                    onClick={() => approve(v.id)}
                    className="btn-primary text-sm !min-h-[36px]"
                  >
                    Approve
                  </button>
                )}
                <button
                  type="button"
                  disabled={busyId === v.id}
                  onClick={() => disable(v.id)}
                  className="btn-outline text-sm !min-h-[36px]"
                >
                  Disable
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
