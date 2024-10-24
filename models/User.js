const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Sequelize 설정 파일 import

const User = sequelize.define('User', {
    email: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
    password: { type: DataTypes.STRING, allowNull: false },
    nickname: { type: DataTypes.STRING, allowNull: true },
    name: { type: DataTypes.STRING, allowNull: true },
    birth: { type: DataTypes.DATE, allowNull: true },
    profileimg: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    gender: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.STRING, allowNull: true },
    gToken: { type: DataTypes.STRING, allowNull: true },
    nToken: { type: DataTypes.STRING, allowNull: true },
    kToken: { type: DataTypes.STRING, allowNull: true },
    createdAt: { type: DataTypes.DATE, allowNull: true }
});

module.exports = User;
