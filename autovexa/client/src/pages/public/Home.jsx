import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVehicles, selectFilteredVehicles } from '../../redux/vehicleSlice';
import VehicleCard from '../../components/VehicleCard';
import Loading from '../../components/Loading';
import {
  FaSearch, FaShieldAlt, FaCar, FaFileInvoice, FaCheckCircle,
  FaArrowRight, FaStar,
} from 'react-icons/fa';
import { HiOutlineSparkles } from 'react-icons/hi';
import { BRANDS } from '../../utils/constants';

export default function Home() {
  const dispatch = useDispatch();
  const vehicles = useSelector(selectFilteredVehicles);
  const { loading } = useSelector((s) => s.vehicles);

  useEffect(() => {
    dispatch(fetchVehicles());
  }, [dispatch]);

  const featured = vehicles.slice(0, 6);

  return (
    <div className="animate-fade-up">
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative min-h-[560px] md:min-h-[640px] flex items-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1800&q=80')",
          }}
        />
        <div className="hero-overlay absolute inset-0" />
        {/* Soft amber glow */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative page-container py-16 md:py-28 w-full">
          <div className="max-w-3xl">
            <div className="glass-dark inline-flex items-center gap-2 text-amber-300 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6">
              <HiOutlineSparkles className="text-sm" />
              Premium Vehicle Marketplace
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] tracking-tight mb-6">
              Find Your Perfect
              <span className="block mt-1 bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                Vehicle Today
              </span>
            </h1>
            <p className="text-base md:text-lg text-slate-300 mb-4 max-w-xl leading-relaxed">
              Explore premium cars from verified vendors. Compare, book, and drive — all in one seamless experience.
            </p>
            <p className="text-sm text-amber-200/90 mb-8 font-medium">
              Create a free account to book your dream car in minutes.
            </p>
            <div className="flex flex-wrap items-center gap-3 mb-12">
              <Link to="/vehicles" className="btn-primary text-base !min-h-[48px] !px-8">
                Explore Vehicles <FaArrowRight className="text-sm" />
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 font-semibold text-white min-h-[48px] px-6 rounded-xl border-2 border-white/35 hover:bg-white hover:text-slate-900 transition-all duration-300"
              >
                Sign Up Free
              </Link>
              <Link
                to="/vendor/register"
                className="inline-flex items-center justify-center gap-2 font-medium text-slate-200 min-h-[48px] px-5 rounded-xl hover:text-white transition"
              >
                Become a Vendor
              </Link>
            </div>
          </div>

          {/* Search bar — aligned row */}
          <div className="glass-panel rounded-2xl p-3 sm:p-4 shadow-2xl shadow-black/30 max-w-3xl">
            <div className="search-bar">
              <div className="flex-1 relative min-w-0">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                <input
                  type="text"
                  placeholder="Search by brand or model..."
                  className="input-field !pl-11 !min-h-[48px] !border-0 bg-white/90 focus:bg-white w-full"
                />
              </div>
              <Link to="/vehicles" className="btn-primary !min-h-[48px] !px-8 w-full sm:w-auto">
                Search
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ───────────────────────────────────── */}
      <section className="bg-slate-950 text-white">
        <div className="page-container py-10 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
          {[
            { value: '150+', label: 'Vehicles Listed' },
            { value: '40+', label: 'Trusted Vendors' },
            { value: '2,500+', label: 'Happy Customers' },
            { value: '4.9', label: 'Average Rating', icon: true },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl md:text-3xl font-extrabold text-amber-400 flex items-center justify-center gap-1">
                {s.value}
                {s.icon && <FaStar className="text-amber-400 text-lg" />}
              </p>
              <p className="text-xs md:text-sm text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Vehicles ─────────────────────────────── */}
      <section className="page-container section-pad">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-amber-600 font-semibold text-sm uppercase tracking-wider mb-1">Handpicked</p>
            <h2 className="section-title">Featured Vehicles</h2>
            <p className="section-sub">Top picks from our verified showrooms</p>
          </div>
          <Link
            to="/vehicles"
            className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700 transition"
          >
            View all vehicles <FaArrowRight className="text-xs" />
          </Link>
        </div>

        {loading ? (
          <Loading message="Loading featured vehicles..." />
        ) : (
          <div className="product-grid">
            {featured.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        )}
      </section>

      {/* ── Popular Brands ────────────────────────────────── */}
      <section className="bg-white border-y border-slate-100">
        <div className="page-container section-pad">
          <div className="text-center mb-10">
            <p className="text-amber-600 font-semibold text-sm uppercase tracking-wider mb-1">Top Makes</p>
            <h2 className="section-title">Popular Brands</h2>
            <p className="section-sub">Browse by your favourite manufacturer</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-5">
            {BRANDS.map((b) => (
              <Link
                key={b}
                to={`/vehicles?brand=${encodeURIComponent(b)}`}
                className="group flex items-center justify-center bg-slate-50 hover:bg-slate-950 rounded-2xl py-5 px-3 text-center font-semibold text-slate-700 hover:text-white transition-all duration-300 border border-slate-100 hover:border-slate-900 hover:shadow-lg"
              >
                <span className="text-sm md:text-base group-hover:scale-105 transition-transform">{b}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why AutoVexa ──────────────────────────────────── */}
      <section className="page-container section-pad">
        <div className="text-center mb-12">
          <p className="text-amber-600 font-semibold text-sm uppercase tracking-wider mb-1">Benefits</p>
          <h2 className="section-title">Why Choose AutoVexa</h2>
          <p className="section-sub max-w-xl mx-auto">Everything you need for a confident vehicle purchase</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-7">
          {[
            {
              icon: <FaShieldAlt />,
              title: 'Trusted Vendors',
              desc: 'Every showroom is verified before listing vehicles on our platform.',
              color: 'from-emerald-500 to-teal-600',
            },
            {
              icon: <FaCar />,
              title: 'Wide Selection',
              desc: 'Hundreds of cars, SUVs, and EVs from top brands across India.',
              color: 'from-blue-500 to-indigo-600',
            },
            {
              icon: <FaCheckCircle />,
              title: 'Secure Booking',
              desc: 'Simple, transparent booking with clear pricing and confirmation.',
              color: 'from-amber-500 to-orange-600',
            },
            {
              icon: <FaFileInvoice />,
              title: 'Easy Invoicing',
              desc: 'Download your booking invoice anytime from your dashboard.',
              color: 'from-violet-500 to-purple-600',
            },
          ].map((item) => (
            <div key={item.title} className="card-static p-6 hover:shadow-lg transition-shadow duration-300 group">
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                {item.icon}
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────── */}
      <section className="hero-mesh text-white py-16 md:py-20">
        <div className="page-container">
          <div className="text-center mb-12">
            <p className="text-amber-400 font-semibold text-sm uppercase tracking-wider mb-1">Simple Process</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">How It Works</h2>
            <p className="text-slate-400 mt-2">Five easy steps to your next vehicle</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { step: '01', title: 'Search', desc: 'Browse by brand, type, or budget' },
              { step: '02', title: 'Compare', desc: 'View full specs & photos' },
              { step: '03', title: 'Book', desc: 'Reserve with a few clicks' },
              { step: '04', title: 'Confirm', desc: 'Get instant booking ID' },
              { step: '05', title: 'Invoice', desc: 'Download anytime' },
            ].map((item, i) => (
              <div key={item.step} className="relative text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-slate-950 font-extrabold text-lg shadow-lg shadow-amber-500/20">
                  {item.step}
                </div>
                <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
                {i < 4 && (
                  <div className="hidden lg:block absolute top-7 left-[60%] w-[80%] h-px bg-gradient-to-r from-amber-500/40 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────── */}
      <section className="page-container section-pad">
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-8 py-14 md:px-16 md:py-16 text-center">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
              Ready to Drive Your Dream?
            </h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              Join thousands of customers who found their perfect vehicle on AutoVexa.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/vehicles" className="btn-primary text-base px-8 py-3">
                Browse Vehicles
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center font-semibold text-white py-3 px-6 rounded-xl border-2 border-white/25 hover:bg-white hover:text-slate-900 transition-all"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
