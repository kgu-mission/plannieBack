const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Sequelize 설정 파일 import

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID, // UUID 타입으로 설정하여 고유 ID 생성
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nickname: {
        type: DataTypes.STRING,
        allowNull: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    birth: {
        type: DataTypes.DATE,
        allowNull: true
    },
    profileimg: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: true
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    // gToken: {
    //     type: DataTypes.STRING,
    //     allowNull: true
    // }, // 구글 OAuth 토큰
    // nToken: {
    //     type: DataTypes.STRING,
    //     allowNull: true
    // }, // 네이버 OAuth 토큰
    // kToken: {
    //     type: DataTypes.STRING,
    //     allowNull: true
    // }, // 카카오 OAuth 토큰
}, {
    timestamps: true, // 자동으로 createdAt, updatedAt 필드를 생성하여 관리
    updatedAt: 'updatedAt', // 업데이트 시간을 관리하는 필드 추가
});

module.exports = User;
