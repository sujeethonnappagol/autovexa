import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { vendorRegister, clearError } from '../../redux/authSlice';
import { FaStore } from 'react-icons/fa';

export default function VendorRegister() {
  const [form, setForm] = useState({ ownerName: '', email: '', phone: '', businessName: '', address: '', gst: '', password: '', confirm: '' });
  const dispatch = useDispatch();
  const { loading, error, successMessage } = useSelector((s) => s.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return alert('Passwords do not match');
    dispatch(clearError());
    await dispatch(vendorRegister(form));
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="card p-8 w-full max-w-lg">
        <div className="text-center mb-6">
          <FaStore className="text-4xl text-amber-500 mx-auto mb-2" />
          <h1 className="text-2xl font-bold">Register as Vendor</h1>
        </div>
        {error && <div className="bg-red-50 text-amber-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        {successMessage && <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4 text-sm">{successMessage}</div>}
        {!successMessage && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="label">Owner Name</label><input required className="input-field" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} /></div>
              <div><label className="label">Email</label><input type="email" required className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><label className="label">Phone</label><input required className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div><label className="label">Business Name</label><input required className="input-field" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} /></div>
            </div>
            <div><label className="label">Business Address</label><textarea required className="input-field" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div><label className="label">GST Number</label><input required className="input-field" value={form.gst} onChange={(e) => setForm({ ...form, gst: e.target.value })} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="label">Password</label><input type="password" required className="input-field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
              <div><label className="label">Confirm Password</label><input type="password" required className="input-field" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} /></div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Submitting...' : 'Register as Vendor'}</button>
          </form>
        )}
        <p className="text-center text-sm mt-4 text-slate-600">Already registered? <Link to="/vendor/login" className="text-amber-500 font-semibold">Login</Link></p>
      </div>
    </div>
  );
}
