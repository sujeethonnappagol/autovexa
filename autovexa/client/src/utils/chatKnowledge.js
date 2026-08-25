/** ~20 AutoVexa knowledge topics (keyword-matched) */
export const KNOWLEDGE = [
  {
    keys: ['hello', 'hi', 'hey', 'good morning', 'good evening'],
    answer:
      "Hello! I'm VexaBot, your AutoVexa assistant. Ask me about browsing vehicles, booking, vendors, logins, or pricing.",
  },
  {
    keys: ['what is autovexa', 'about autovexa', 'what is this', 'about this site'],
    answer:
      'AutoVexa is a premium online vehicle marketplace. You can browse cars from verified vendors, compare specs, book a vehicle, and download invoices — all in one place.',
  },
  {
    keys: ['how to book', 'book a car', 'booking', 'reserve', 'book now'],
    answer:
      "To book: 1) Go to Vehicles 2) Open a listing 3) Click Book Now 4) Fill your details and date 5) Confirm. You'll get a booking ID. Sign in as a customer first.",
  },
  {
    keys: ['login', 'sign in', 'how to login'],
    answer:
      'Use Login from the menu. Customers: /login · Vendors: /vendor/login · Admins: /admin/login. Demo customer: sujeet@example.com / user123',
  },
  {
    keys: ['register', 'sign up', 'create account', 'signup'],
    answer:
      'Customers can Sign Up from the menu. Vendors use "Become a Vendor" or /vendor/register — vendor accounts need admin approval before login.',
  },
  {
    keys: ['vendor', 'become a vendor', 'sell', 'list my car'],
    answer:
      'Register as a vendor, wait for admin approval, then log in to add vehicles, manage availability, and view bookings for your listings.',
  },
  {
    keys: ['admin', 'admin panel', 'admin login'],
    answer:
      'Admins manage vendors, vehicles, users, and bookings. Demo: admin@autovexa.com / admin123 (via /admin/login).',
  },
  {
    keys: ['filter', 'search', 'sort', 'find car'],
    answer:
      'On the Vehicles page use filters (brand, type, fuel, transmission, price) and sort (price or year). The home search also jumps to the listing page.',
  },
  {
    keys: ['price', 'cost', 'payment', 'pay'],
    answer:
      'Listing prices are shown in INR. Booking uses a mock summary (vehicle amount + fee + tax). Real payment is not enabled in this demo frontend.',
  },
  {
    keys: ['invoice', 'download invoice', 'receipt'],
    answer:
      'After a confirmed booking, open My Bookings (customer account) to view details and download a mock invoice from your dashboard.',
  },
  {
    keys: ['brand', 'toyota', 'bmw', 'hyundai', 'which brands'],
    answer:
      'We list popular brands including Toyota, BMW, Mercedes-Benz, Audi, Hyundai, Tata, Mahindra, Kia, Honda, and Maruti Suzuki. Filter by brand on the Vehicles page.',
  },
  {
    keys: ['fuel', 'petrol', 'diesel', 'electric', 'ev', 'cng'],
    answer:
      'Vehicles are tagged by fuel type: Petrol, Diesel, Electric, Hybrid, and CNG. Use the Fuel Type filter on Vehicles to narrow results.',
  },
  {
    keys: ['available', 'availability', 'stock'],
    answer:
      'Each card shows Available or Booked status. Only Available vehicles can be booked. Vendors can change availability from their dashboard.',
  },
  {
    keys: ['contact', 'support', 'help', 'phone', 'email'],
    answer:
      'Reach us via the Contact page, email support@autovexa.com, or phone +91 8123097054. I can also answer common product questions here.',
  },
  {
    keys: ['demo', 'password', 'credentials', 'test account'],
    answer:
      'Demo accounts — Customer: sujeet@example.com / user123 · Vendor: abc@motors.com / vendor123 · Admin: admin@autovexa.com / admin123',
  },
  {
    keys: ['my bookings', 'booking status', 'pending', 'confirmed'],
    answer:
      'Log in as a customer and open My Bookings to see Booking ID, vehicle, date, amount, and status (Pending, Confirmed, Cancelled, Completed).',
  },
  {
    keys: ['profile', 'edit profile', 'update profile'],
    answer:
      'After login, use Profile or Dashboard links in the menu to view or update your account details (mock update in this frontend).',
  },
  {
    keys: ['transmission', 'automatic', 'manual'],
    answer:
      'Listings include Manual, Automatic, AMT, CVT, and DCT. Filter by transmission on the Vehicles page.',
  },
  {
    keys: ['suv', 'sedan', 'hatchback', 'vehicle type', 'types'],
    answer:
      'Types include Hatchback, Sedan, SUV, MUV, Coupe, Convertible, Pickup, EV, Bike, and Scooter. Use the Vehicle Type filter to browse.',
  },
  {
    keys: ['mobile', 'responsive', 'app'],
    answer:
      'AutoVexa is a responsive web app — it works on desktop, tablet, and mobile browsers. There is no separate native app in this demo.',
  },
  {
    keys: ['thank', 'thanks', 'bye', 'goodbye'],
    answer:
      "You're welcome! Happy browsing on AutoVexa. Open Vehicles anytime to continue exploring.",
  },
];

export const SUGGESTIONS = [
  'How do I book a car?',
  'Demo login credentials',
  'How to become a vendor?',
  'How do filters work?',
];

export function findAnswer(text) {
  const q = text.toLowerCase().trim();
  if (!q) return null;

  let best = null;
  let bestScore = 0;

  for (const item of KNOWLEDGE) {
    let score = 0;
    for (const key of item.keys) {
      if (q.includes(key)) score += key.length;
    }
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }

  if (best) return best.answer;

  return (
    'I can only help with AutoVexa topics — booking, login, vendors, filters, invoices, and similar. ' +
    'Try: "How do I book?", "Demo credentials", or "Become a vendor".'
  );
}
