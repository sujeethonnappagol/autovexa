import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';
import Vehicle from './Vehicle.js';

class Booking extends Model {}

Booking.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    bookingId: {
      type: DataTypes.STRING(32),
      unique: true,
      allowNull: false,
    },
    vehicleId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    customerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    vendorId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    bookingDate: { type: DataTypes.STRING(20), allowNull: false },
    vehiclePrice: { type: DataTypes.DECIMAL(12, 2), defaultValue: 50000 },
    bookingFee: { type: DataTypes.DECIMAL(12, 2), defaultValue: 5000 },
    tax: { type: DataTypes.DECIMAL(12, 2), defaultValue: 4000 },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    status: {
      type: DataTypes.ENUM('Pending', 'Confirmed', 'Cancelled', 'Completed'),
      defaultValue: 'Confirmed',
    },
    customerName: { type: DataTypes.STRING(120), defaultValue: '' },
    customerEmail: { type: DataTypes.STRING(180), defaultValue: '' },
    customerPhone: { type: DataTypes.STRING(40), defaultValue: '' },
    customerAddress: { type: DataTypes.STRING(500), defaultValue: '' },
  },
  {
    sequelize,
    modelName: 'Booking',
    tableName: 'bookings',
    hooks: {
      beforeValidate: (booking) => {
        if (!booking.bookingId) {
          booking.bookingId = `BK${Date.now().toString().slice(-8)}`;
        }
      },
    },
  }
);

Booking.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });
Booking.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });
Booking.belongsTo(User, { foreignKey: 'vendorId', as: 'vendor' });
Vehicle.hasMany(Booking, { foreignKey: 'vehicleId' });
User.hasMany(Booking, { foreignKey: 'customerId', as: 'customerBookings' });
User.hasMany(Booking, { foreignKey: 'vendorId', as: 'vendorBookings' });

export default Booking;
