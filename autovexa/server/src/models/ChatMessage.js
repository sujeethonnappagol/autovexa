import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

class ChatMessage extends Model {}

ChatMessage.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    sessionId: {
      type: DataTypes.STRING(64),
      allowNull: false,
      index: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('user', 'assistant', 'system'),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'ChatMessage',
    tableName: 'chat_messages',
    indexes: [{ fields: ['sessionId'] }, { fields: ['userId'] }],
  }
);

ChatMessage.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(ChatMessage, { foreignKey: 'userId' });

export default ChatMessage;
