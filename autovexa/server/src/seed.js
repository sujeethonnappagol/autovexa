import 'dotenv/config';
import sequelize, { connectDB, syncDB } from './config/db.js';
import User from './models/User.js';
import Vehicle from './models/Vehicle.js';
import Booking from './models/Booking.js';

const vehiclesSeed = [
  {
    brand: 'Toyota',
    model: 'Fortuner',
    year: 2025,
    price: 4200000,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    mileage: '14 km/l',
    engine: '2755 CC',
    seatingCapacity: 7,
    color: 'White',
    type: 'SUV',
    description: 'Rugged and reliable SUV for city and off-road.',
    features: ['Air Conditioning', 'ABS', 'Airbags', 'Sunroof', 'Rear Camera'],
    images: ['https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800'],
  },
  {
    brand: 'BMW',
    model: 'X5',
    year: 2024,
    price: 9500000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    mileage: '11 km/l',
    engine: '2998 CC',
    seatingCapacity: 5,
    color: 'Black',
    type: 'SUV',
    description: 'Luxury performance SUV.',
    features: ['Air Conditioning', 'ABS', 'Airbags', 'Sunroof', 'Cruise Control'],
    images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800'],
  },
  {
    brand: 'Hyundai',
    model: 'Creta',
    year: 2025,
    price: 1850000,
    fuelType: 'Petrol',
    transmission: 'Manual',
    mileage: '17 km/l',
    engine: '1497 CC',
    seatingCapacity: 5,
    color: 'White',
    type: 'SUV',
    description: 'Popular compact SUV with modern features.',
    features: ['Air Conditioning', 'ABS', 'Airbags', 'Bluetooth'],
    images: ['https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800'],
  },
  {
    brand: 'Tata',
    model: 'Nexon',
    year: 2025,
    price: 1450000,
    fuelType: 'Electric',
    transmission: 'Automatic',
    mileage: '312 km/charge',
    engine: 'Electric',
    seatingCapacity: 5,
    color: 'Red',
    type: 'Electric Vehicle',
    description: 'Stylish electric SUV with strong range.',
    features: ['Air Conditioning', 'ABS', 'Airbags', 'Keyless Entry'],
    images: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800'],
  },
  {
    brand: 'Honda',
    model: 'City',
    year: 2024,
    price: 1350000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    mileage: '18 km/l',
    engine: '1498 CC',
    seatingCapacity: 5,
    color: 'White',
    type: 'Sedan',
    description: 'Comfortable and efficient sedan.',
    features: ['Air Conditioning', 'ABS', 'Airbags', 'Cruise Control'],
    images: ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800'],
  },
];

async function seed() {
  await connectDB();
  await syncDB();

  console.log('Clearing tables...');
  await Booking.destroy({ where: {}, force: true });
  await Vehicle.destroy({ where: {}, force: true });
  await User.destroy({ where: {}, force: true });

  console.log('Creating users...');
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@autovexa.com',
    phone: '+91 9000000001',
    password: 'admin123',
    role: 'admin',
  });

  const vendor = await User.create({
    name: 'Rajesh Kumar',
    email: 'abc@motors.com',
    phone: '+91 98765 43210',
    password: 'vendor123',
    role: 'vendor',
    businessName: 'ABC Motors',
    address: '123 MG Road, Bangalore',
    gstNumber: '29ABCDE1234F1Z5',
    vendorStatus: 'Active',
  });

  const vendor2 = await User.create({
    name: 'Priya Sharma',
    email: 'premium@auto.com',
    phone: '+91 98765 43211',
    password: 'vendor123',
    role: 'vendor',
    businessName: 'Premium Auto',
    address: '45 Park Street, Mumbai',
    gstNumber: '27FGHIJ5678K2L6',
    vendorStatus: 'Active',
  });

  const customer = await User.create({
    name: 'Sujeet Honnappagol',
    email: 'sujeet@example.com',
    phone: '+91 98765 11111',
    password: 'user123',
    role: 'user',
  });

  console.log('Creating vehicles...');
  for (let i = 0; i < vehiclesSeed.length; i++) {
    await Vehicle.create({
      ...vehiclesSeed[i],
      vendorId: i < 3 ? vendor.id : vendor2.id,
      status: 'Available',
    });
  }

  console.log('Seed complete.');
  console.log('--- Demo accounts ---');
  console.log('Admin:    admin@autovexa.com / admin123');
  console.log('Vendor:   abc@motors.com / vendor123');
  console.log('Customer: sujeet@example.com / user123');
  console.log(`Users: admin=${admin.id}, vendor=${vendor.id}, customer=${customer.id}`);

  await sequelize.close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
