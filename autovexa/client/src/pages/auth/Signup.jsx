import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../../redux/authSlice';
import { FaCarSide } from 'react-icons/fa';
import { getPasswordError, isStrongPassword, isValidPhone, normalizePhone } from '../../utils/validators';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, successMessage } = useSelector((s) => s.auth);
  const redirectMsg = location.state?.message;

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const nextErrors = {};
    const phone = normalizePhone(form.phone);

    if (!form.name.trim()) nextErrors.name = 'Full name is required';
    if (!/\S+@\S+\.\S+/.test(form.email.trim())) nextErrors.email = 'Please enter a valid email address';
    if (!isValidPhone(phone)) nextErrors.phone = 'Phone number must be exactly 10 digits';
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
    const result = await dispatch(register({ ...form, phone }));
    if (register.fulfilled.match(result)) {
      navigate('/login', { replace: true, state: { message: 'Registration successful. Please login.' } });
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="auth-card animate-fade-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <FaCarSide className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Create account</h1>
          <p className="text-slate-500 text-sm mt-1">Join AutoVexa and find your dream car</p>
          {redirectMsg && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mt-4">
              {redirectMsg}
            </p>
          )}
        </div>

        {error && <div className="bg-red-50 border border-red-100 text-amber-600 p-3 rounded-xl mb-5 text-sm">{error}</div>}
        {successMessage && <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-3 rounded-xl mb-5 text-sm">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input required className={`input-field ${errors.name ? 'border-red-300 focus:ring-red-200' : ''}`} placeholder="John Doe" value={form.name} onChange={(e) => updateField('name', e.target.value)} />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" required className={`input-field ${errors.email ? 'border-red-300 focus:ring-red-200' : ''}`} placeholder="you@example.com" value={form.email} onChange={(e) => updateField('email', e.target.value)} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>
          <div>
            <label className="label">Phone</label>
            <input
              required
              className={`input-field ${errors.phone ? 'border-red-300 focus:ring-red-200' : ''}`}
              placeholder="9876543210"
              value={form.phone}
              onChange={(e) => updateField('phone', normalizePhone(e.target.value))}
            />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" required className={`input-field ${errors.password ? 'border-red-300 focus:ring-red-200' : ''}`} placeholder="••••••••" value={form.password} onChange={(e) => updateField('password', e.target.value)} />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>
          <div>
            <label className="label">Confirm Password</label>
            <input type="password" required className={`input-field ${errors.confirm ? 'border-red-300 focus:ring-red-200' : ''}`} placeholder="••••••••" value={form.confirm} onChange={(e) => updateField('confirm', e.target.value)} />
            {errors.confirm && <p className="mt-1 text-xs text-red-600">{errors.confirm}</p>}
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-600 font-semibold hover:text-amber-700">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
