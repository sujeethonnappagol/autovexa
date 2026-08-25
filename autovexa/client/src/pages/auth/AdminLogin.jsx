import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../redux/authSlice';
import { FaUserShield } from 'react-icons/fa';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(login({ email, password, role: 'admin' }));
    if (login.fulfilled.match(result)) navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-950">
      <div className="auth-card animate-fade-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg">
            <FaUserShield className="text-amber-400 text-2xl" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Admin Login</h1>
          <p className="text-slate-500 text-sm mt-1">AutoVexa control panel</p>
        </div>
        {error && <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl mb-5 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input type="email" required className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" required className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Signing in...' : 'Login as Admin'}
          </button>
        </form>
        <p className="text-center text-sm mt-6">
          <Link to="/" className="text-slate-400 hover:text-amber-600 transition">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
