import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'autovexa',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false,
    define: {
      underscored: false,
      timestamps: true,
    },
    // Avoid long hangs on some XAMPP/MySQL setups
    dialectOptions: {
      connectTimeout: 10000,
    },
  }
);

/**
 * Connect only — do not sync here (sync can hang on XAMPP).
 * Tables are created by: npm run seed
 */
export async function connectDB() {
  await sequelize.authenticate();
  console.log(
    `MySQL connected: ${process.env.DB_HOST || '127.0.0.1'}/${process.env.DB_NAME || 'autovexa'}`
  );
}

/** Optional: create/update tables (used by seed.js) */
export async function syncDB() {
  console.log('Syncing models...');
  await sequelize.sync();
  console.log('MySQL models synced');
}

export default sequelize;
