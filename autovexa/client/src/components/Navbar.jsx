import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import { HiOutlineMenuAlt3, HiOutlineX } from 'react-icons/hi';
import { FaCarSide } from 'react-icons/fa';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { isAuthenticated, role } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const navLink = (to, label) => (
    <Link
      key={to}
      to={to}
      className={`text-sm font-medium transition-colors duration-200 ${
        location.pathname === to
          ? 'text-amber-400'
          : 'text-slate-300 hover:text-white'
      }`}
    >
      {label}
    </Link>
  );

  let links;
  if (!isAuthenticated) {
    links = (
      <>
        {navLink('/', 'Home')}
        {navLink('/vehicles', 'Vehicles')}
        {navLink('/about', 'About')}
        {navLink('/contact', 'Contact')}
        <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition">
          Login
        </Link>
        <Link
          to="/signup"
          className="btn-primary text-sm py-2 px-5 shadow-amber-500/20"
        >
          Get Started
        </Link>
      </>
    );
  } else if (role === 'admin') {
    links = (
      <>
        {navLink('/admin/dashboard', 'Dashboard')}
        {navLink('/admin/vendors', 'Vendors')}
        {navLink('/admin/vehicles', 'Vehicles')}
        {navLink('/admin/users', 'Users')}
        <button onClick={handleLogout} className="btn-outline border-slate-500 text-slate-300 hover:bg-white hover:text-slate-900 text-sm py-1.5 px-4">
          Logout
        </button>
      </>
    );
  } else if (role === 'vendor') {
    links = (
      <>
        {navLink('/vendor/dashboard', 'Dashboard')}
        {navLink('/vendor/vehicles', 'My Vehicles')}
        {navLink('/vendor/bookings', 'Bookings')}
        <button onClick={handleLogout} className="btn-outline border-slate-500 text-slate-300 hover:bg-white hover:text-slate-900 text-sm py-1.5 px-4">
          Logout
        </button>
      </>
    );
  } else {
    links = (
      <>
        {navLink('/', 'Home')}
        {navLink('/vehicles', 'Vehicles')}
        {navLink('/user/bookings', 'My Bookings')}
        {navLink('/user/dashboard', 'Dashboard')}
        <button onClick={handleLogout} className="btn-outline border-slate-500 text-slate-300 hover:bg-white hover:text-slate-900 text-sm py-1.5 px-4">
          Logout
        </button>
      </>
    );
  }

  return (
    <nav
      className={`sticky top-0 z-50 transition-[background,box-shadow,border-color,backdrop-filter] duration-500 ease-out ${
        scrolled
          ? 'glass-nav'
          : 'bg-slate-950 border-b border-transparent'
      }`}
    >
      <div className="page-container">
        <div className="flex items-center justify-between h-16 md:h-[4.25rem]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-105 transition-transform">
              <FaCarSide className="text-white text-lg" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              <span className="text-white">Auto</span>
              <span className="brand-text">Vexa</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7">{links}</div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-2xl text-white p-1"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <HiOutlineX /> : <HiOutlineMenuAlt3 />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden flex flex-col gap-4 pb-5 pt-3 mt-1 border-t border-white/10 animate-fade-up">
            {links}
          </div>
        )}
      </div>
    </nav>
  );
}
