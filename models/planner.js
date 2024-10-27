const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Sequelize 설정 파일 import

const planner = sequelize.define('Planner', {
    start_day: { type: DataTypes.DATEONLY, allowNull: false },
    end_day: { type: DataTypes.DATEONLY, allowNull: true },
    title: { type: DataTypes.STRING, allowNull: false },
    start_time: { type: DataTypes.TIME, allowNull: false },
    end_time: { type: DataTypes.TIME, allowNull: false },
    memo: { type: DataTypes.STRING, allowNull: true },
    notification: { type: DataTypes.BOOLEAN, allowNull: false },
    repeat: { type: DataTypes.INTEGER, allowNull: false },
    check_box: { type: DataTypes.BOOLEAN, allowNull: false }
});

module.exports = planner;
