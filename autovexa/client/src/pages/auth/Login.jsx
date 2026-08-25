import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../redux/authSlice';
import { FaCarSide } from 'react-icons/fa';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(login({ email, password, role: 'user' }));
    if (login.fulfilled.match(result)) navigate('/user/dashboard');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="auth-card animate-fade-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <FaCarSide className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Welcome back</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to your AutoVexa account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-amber-600 p-3 rounded-xl mb-5 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              className="input-field"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              required
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-slate-500">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-amber-600 font-semibold hover:text-amber-700">
            Create Account
          </Link>
        </p>

        <div className="mt-6 pt-5 border-t border-slate-100 flex justify-center gap-4 text-xs text-slate-400">
          <Link to="/vendor/login" className="hover:text-amber-600 transition">Vendor Login</Link>
          <span>·</span>
          <Link to="/admin/login" className="hover:text-amber-600 transition">Admin Login</Link>
        </div>
      </div>
    </div>
  );
}
