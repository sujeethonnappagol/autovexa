import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
// Import models so associations register before sync
import './models/User.js';
import './models/Vehicle.js';
import './models/Booking.js';
import authRoutes from './routes/auth.js';
import vehicleRoutes from './routes/vehicles.js';
import bookingRoutes from './routes/bookings.js';
import adminRoutes from './routes/admin.js';
import vendorRoutes from './routes/vendor.js';
import chatRoutes from './routes/chat.js';
import './models/ChatMessage.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'AutoVexa API',
    database: 'MySQL',
    time: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/chat', chatRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || 'Server error',
  });
});

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`AutoVexa API (MySQL) running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  console.error('Check MySQL is running and DB credentials in server/.env');
  process.exit(1);
});
