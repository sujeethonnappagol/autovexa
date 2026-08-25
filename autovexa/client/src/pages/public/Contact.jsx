import { useState } from 'react';
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';

export default function Contact() {
  const [sent, setSent] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="animate-fade-up">
      <section className="hero-mesh text-white py-16 md:py-24">
        <div className="page-container max-w-4xl text-center">
          <p className="text-amber-400 font-semibold text-sm uppercase tracking-wider mb-3">Get in Touch</p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Contact Us</h1>
          <p className="text-slate-300 text-base md:text-lg max-w-xl mx-auto">
            We&apos;d love to hear from you. Reach out anytime — our team is here to help.
          </p>
        </div>
      </section>

      <section className="page-container max-w-5xl py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Contact details */}
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Contact</h2>
            {[
              { icon: <FaEnvelope />, title: 'Email', value: 'support@autovexa.com', href: 'mailto:support@autovexa.com' },
              { icon: <FaPhoneAlt />, title: 'Phone', value: '+91 8123097054', href: 'tel:+918123097054' },
              { icon: <FaMapMarkerAlt />, title: 'Location', value: 'Bangalore, Karnataka, India', href: null },
            ].map((item) => (
              <div key={item.title} className="card-static p-5 sm:p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 text-lg">
                  {item.icon}
                </div>
                <div className="min-w-0 pt-1">
                  <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">{item.title}</h3>
                  {item.href ? (
                    <a href={item.href} className="text-slate-600 hover:text-amber-600 transition break-all mt-1 block">
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-slate-600 mt-1">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="card-static p-6 sm:p-8">
            {sent ? (
              <div className="text-center py-14 px-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-2xl font-bold">
                  ✓
                </div>
                <p className="text-emerald-700 font-semibold text-lg">Message sent!</p>
                <p className="text-slate-500 text-sm mt-2">We&apos;ll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-xl font-bold text-slate-900 mb-1">Send a message</h2>
                <div>
                  <label className="label">Name</label>
                  <input required className="input-field" placeholder="Your name" />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" required className="input-field" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="label">Message</label>
                  <textarea required rows={5} className="input-field resize-none" placeholder="How can we help?" />
                </div>
                <button type="submit" className="btn-primary w-full">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
