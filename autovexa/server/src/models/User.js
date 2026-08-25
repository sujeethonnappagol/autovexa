import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../config/db.js';

class User extends Model {
  async matchPassword(plain) {
    return bcrypt.compare(plain, this.password);
  }

  toSafeJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      role: this.role,
      status: this.status,
      businessName: this.businessName,
      address: this.address,
      gstNumber: this.gstNumber,
      vendorStatus: this.vendorStatus,
      createdAt: this.createdAt,
    };
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING(120), allowNull: false },
    email: { type: DataTypes.STRING(180), allowNull: false, unique: true },
    phone: { type: DataTypes.STRING(40), defaultValue: '' },
    password: { type: DataTypes.STRING(255), allowNull: false },
    role: {
      type: DataTypes.ENUM('user', 'vendor', 'admin'),
      defaultValue: 'user',
    },
    status: {
      type: DataTypes.ENUM('Active', 'Disabled'),
      defaultValue: 'Active',
    },
    businessName: { type: DataTypes.STRING(180), defaultValue: '' },
    address: { type: DataTypes.STRING(500), defaultValue: '' },
    gstNumber: { type: DataTypes.STRING(40), defaultValue: '' },
    vendorStatus: {
      type: DataTypes.ENUM('Pending', 'Active', 'Disabled', ''),
      defaultValue: '',
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  }
);

export default User;
