import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

class Vehicle extends Model {
  toClient() {
    const vendor = this.User || this.vendor;
    return {
      id: this.id,
      brand: this.brand,
      model: this.model,
      year: this.year,
      price: Number(this.price),
      fuelType: this.fuelType,
      transmission: this.transmission,
      mileage: this.mileage,
      engine: this.engine,
      seatingCapacity: this.seatingCapacity,
      color: this.color,
      registrationYear: this.registrationYear,
      description: this.description,
      features: this.features || [],
      type: this.type,
      status: this.status,
      images:
        this.images?.length > 0
          ? this.images
          : ['https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800'],
      vendor: vendor
        ? {
            id: vendor.id,
            name: vendor.businessName || vendor.name,
            email: vendor.email,
            phone: vendor.phone,
          }
        : { id: this.vendorId, name: 'Vendor' },
      createdAt: this.createdAt
        ? new Date(this.createdAt).toISOString().slice(0, 10)
        : null,
    };
  }
}

Vehicle.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    brand: { type: DataTypes.STRING(80), allowNull: false },
    model: { type: DataTypes.STRING(80), allowNull: false },
    year: { type: DataTypes.INTEGER, allowNull: false },
    price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    fuelType: { type: DataTypes.STRING(40), allowNull: false },
    transmission: { type: DataTypes.STRING(40), allowNull: false },
    mileage: { type: DataTypes.STRING(40), defaultValue: '' },
    engine: { type: DataTypes.STRING(40), defaultValue: '' },
    seatingCapacity: { type: DataTypes.INTEGER, defaultValue: 5 },
    color: { type: DataTypes.STRING(40), defaultValue: '' },
    registrationYear: { type: DataTypes.INTEGER, allowNull: true },
    description: { type: DataTypes.TEXT, defaultValue: '' },
    features: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    type: { type: DataTypes.STRING(40), defaultValue: 'SUV' },
    status: {
      type: DataTypes.ENUM('Available', 'Booked', 'Disabled'),
      defaultValue: 'Available',
    },
    images: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    vendorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Vehicle',
    tableName: 'vehicles',
  }
);

Vehicle.belongsTo(User, { foreignKey: 'vendorId', as: 'User' });
User.hasMany(Vehicle, { foreignKey: 'vendorId' });

export default Vehicle;
