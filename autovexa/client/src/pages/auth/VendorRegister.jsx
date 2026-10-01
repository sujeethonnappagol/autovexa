import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { vendorRegister, clearError } from '../../redux/authSlice';
import { FaStore } from 'react-icons/fa';
import { getPasswordError, isStrongPassword, isValidPhone, normalizePhone } from '../../utils/validators';

export default function VendorRegister() {
  const [form, setForm] = useState({ ownerName: '', email: '', phone: '', businessName: '', address: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, successMessage } = useSelector((s) => s.auth);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const nextErrors = {};
    const phone = normalizePhone(form.phone);

    if (!form.ownerName.trim()) nextErrors.ownerName = 'Owner name is required';
    if (!/\S+@\S+\.\S+/.test(form.email.trim())) nextErrors.email = 'Please enter a valid email address';
    if (!isValidPhone(phone)) nextErrors.phone = 'Phone number must be exactly 10 digits';
    if (!form.businessName.trim()) nextErrors.businessName = 'Showroom name is required';
    if (!form.address.trim()) nextErrors.address = 'Business address is required';
    if (form.password !== form.confirm) nextErrors.confirm = 'Passwords do not match';

    const passwordError = getPasswordError(form.password);
    if (passwordError) nextErrors.password = passwordError;
    if (!isStrongPassword(form.password) && !passwordError) {
      nextErrors.password = 'Password must be at least 5 characters, include 2 digits and 1 special character';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const phone = normalizePhone(form.phone);

    if (!validateForm()) return;

    dispatch(clearError());
    const result = await dispatch(vendorRegister({ ...form, phone }));
    if (vendorRegister.fulfilled.match(result)) {
      navigate('/vendor/login', { replace: true, state: { message: 'Vendor registration submitted. Please login.' } });
    }
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
              <div><label className="label">Owner Name</label><input required className={`input-field ${errors.ownerName ? 'border-red-300 focus:ring-red-200' : ''}`} value={form.ownerName} onChange={(e) => updateField('ownerName', e.target.value)} />{errors.ownerName && <p className="mt-1 text-xs text-red-600">{errors.ownerName}</p>}</div>
              <div><label className="label">Email</label><input type="email" required className={`input-field ${errors.email ? 'border-red-300 focus:ring-red-200' : ''}`} value={form.email} onChange={(e) => updateField('email', e.target.value)} />{errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}</div>
              <div><label className="label">Phone</label><input required className={`input-field ${errors.phone ? 'border-red-300 focus:ring-red-200' : ''}`} value={form.phone} onChange={(e) => updateField('phone', normalizePhone(e.target.value))} />{errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}</div>
              <div><label className="label">Showroom Name</label><input required className={`input-field ${errors.businessName ? 'border-red-300 focus:ring-red-200' : ''}`} value={form.businessName} onChange={(e) => updateField('businessName', e.target.value)} />{errors.businessName && <p className="mt-1 text-xs text-red-600">{errors.businessName}</p>}</div>
            </div>
            <div><label className="label">Business Address</label><textarea required className={`input-field ${errors.address ? 'border-red-300 focus:ring-red-200' : ''}`} rows={2} value={form.address} onChange={(e) => updateField('address', e.target.value)} />{errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="label">Password</label><input type="password" required className={`input-field ${errors.password ? 'border-red-300 focus:ring-red-200' : ''}`} value={form.password} onChange={(e) => updateField('password', e.target.value)} />{errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}</div>
              <div><label className="label">Confirm Password</label><input type="password" required className={`input-field ${errors.confirm ? 'border-red-300 focus:ring-red-200' : ''}`} value={form.confirm} onChange={(e) => updateField('confirm', e.target.value)} />{errors.confirm && <p className="mt-1 text-xs text-red-600">{errors.confirm}</p>}</div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Submitting...' : 'Register as Vendor'}</button>
          </form>
        )}
        <p className="text-center text-sm mt-4 text-slate-600">Already registered? <Link to="/vendor/login" className="text-amber-500 font-semibold">Login</Link></p>
      </div>
    </div>
  );
}
