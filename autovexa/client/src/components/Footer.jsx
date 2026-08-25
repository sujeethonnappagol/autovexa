import { Link } from 'react-router-dom';
import { FaCarSide, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { HiOutlineArrowRight } from 'react-icons/hi';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 mt-auto">
      {/* CTA strip */}
      <div className="border-b border-slate-800">
        <div className="page-container py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-white text-xl font-bold">Ready to find your next vehicle?</h3>
            <p className="text-sm mt-1">Browse hundreds of verified listings from trusted vendors.</p>
          </div>
          <Link to="/vehicles" className="btn-primary shrink-0">
            Explore Vehicles <HiOutlineArrowRight />
          </Link>
        </div>
      </div>

      <div className="page-container py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
              <FaCarSide className="text-white text-lg" />
            </div>
            <span className="text-xl font-extrabold">
              <span className="text-white">Auto</span>
              <span className="brand-text">Vexa</span>
            </span>
          </div>
          <p className="text-sm leading-relaxed">
            Premium online vehicle marketplace. Discover, compare, and book cars from verified showrooms across India.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Explore</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/" className="hover:text-amber-400 transition">Home</Link></li>
            <li><Link to="/vehicles" className="hover:text-amber-400 transition">All Vehicles</Link></li>
            <li><Link to="/about" className="hover:text-amber-400 transition">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-amber-400 transition">Contact</Link></li>
            <li><Link to="/vendor/register" className="hover:text-amber-400 transition">Become a Vendor</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h4>
          <ul className="space-y-2.5 text-sm">
            <li><a href="#" className="hover:text-amber-400 transition">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-amber-400 transition">Terms of Service</a></li>
            <li><a href="#" className="hover:text-amber-400 transition">Cookie Policy</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <FaEnvelope className="text-amber-500 shrink-0" />
              support@autovexa.com
            </li>
            <li className="flex items-center gap-3">
              <FaPhoneAlt className="text-amber-500 shrink-0" />
              +91 8123097054
            </li>
            <li className="flex items-start gap-3">
              <FaMapMarkerAlt className="text-amber-500 shrink-0 mt-0.5" />
              Bangalore, Karnataka, India
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="page-container py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <p>© 2026 AutoVexa. All rights reserved.</p>
          <p className="text-slate-600">Built for a premium vehicle marketplace experience.</p>
        </div>
      </div>
    </footer>
  );
}
