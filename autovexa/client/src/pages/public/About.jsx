import { Link } from 'react-router-dom';
import { FaShieldAlt, FaUsers, FaCar, FaHandshake } from 'react-icons/fa';

export default function About() {
  return (
    <div className="animate-fade-up">
      <section className="hero-mesh text-white py-16 md:py-28">
        <div className="page-container max-w-4xl text-center">
          <p className="text-amber-400 font-semibold text-sm uppercase tracking-wider mb-3">Our Story</p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-5">About AutoVexa</h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
            We&apos;re building India&apos;s trusted online vehicle marketplace — connecting buyers with verified showrooms.
          </p>
        </div>
      </section>

      <section className="page-container max-w-4xl py-12 md:py-20">
        <div className="mb-12 md:mb-16 space-y-5">
          <p className="text-lg text-slate-600 leading-relaxed">
            AutoVexa was founded with a simple mission: make buying a vehicle as seamless as shopping online,
            without sacrificing trust or transparency. We partner with verified vendors so every listing
            you see has been vetted for quality and legitimacy.
          </p>
          <p className="text-slate-600 leading-relaxed">
            From compact hatchbacks to luxury SUVs and electric vehicles, our platform brings together
            a wide selection under one roof — with clear pricing, detailed specs, and a booking flow
            designed for confidence. Create a free account to start booking.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 mb-12 md:mb-16">
          {[
            { icon: <FaShieldAlt />, title: 'Verified Partners', desc: 'Every vendor goes through an approval process.' },
            { icon: <FaCar />, title: 'Diverse Inventory', desc: 'Cars, SUVs, EVs — from economy to premium.' },
            { icon: <FaUsers />, title: 'Customer First', desc: 'Support and transparent communication at every step.' },
            { icon: <FaHandshake />, title: 'Fair Deals', desc: 'Clear pricing with no hidden surprises.' },
          ].map((item) => (
            <div key={item.title} className="card-static p-6 flex gap-4 items-start">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg shrink-0">
                {item.icon}
              </div>
              <div className="pt-0.5">
                <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-2">
          <Link to="/signup" className="btn-primary mr-3">Sign Up to Book</Link>
          <Link to="/vehicles" className="btn-outline">Explore Vehicles</Link>
        </div>
      </section>
    </div>
  );
}
