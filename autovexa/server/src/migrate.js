import 'dotenv/config';
import sequelize, { connectDB, syncDB } from './config/db.js';
import './models/User.js';
import './models/Vehicle.js';
import './models/Booking.js';
import './models/ChatMessage.js';

async function migrate() {
  await connectDB();
  await sequelize.sync({ alter: true });
  console.log('Database schema updated without deleting existing data.');
  await sequelize.close();
}

migrate().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
