const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Sequelize 설정 파일 import
const moment = require('moment'); // 날짜 포맷팅을 위해 moment 라이브러리 사용

const planner = sequelize.define('Planner', {
    start_day: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        get() {
            const rawValue = this.getDataValue('start_day');
            return rawValue ? moment(rawValue).format('YYYY.MM.DD dddd') : null; // "YYYY.MM.DD EEEE" 형식으로 반환
        },
        set(value) {
            // "YYYY.MM.DD EEEE" 형식이 들어왔을 때 "YYYY-MM-DD"로 변환하여 저장
            const parsedDate = moment(value, 'YYYY.MM.DD dddd').format('YYYY-MM-DD');
            this.setDataValue('start_day', parsedDate);
        }
    },
    end_day: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        defaultValue: DataTypes.NOW,
        get() {
            const rawValue = this.getDataValue('end_day');
            return rawValue ? moment(rawValue).format('YYYY.MM.DD dddd') : null;
        },
        set(value) {
            const parsedDate = moment(value, 'YYYY.MM.DD dddd').format('YYYY-MM-DD');
            this.setDataValue('end_day', parsedDate);
        }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    start_time: {
        type: DataTypes.TIME,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIME')
    },
    end_time: {
        type: DataTypes.TIME,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIME + INTERVAL 1 HOUR')
    },
    memo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    notification: {
        type: DataTypes.ENUM('안 함', '5분 전', '10분 전', '15분 전', '30분 전', '1시간 전', '2시간 전', '1일 전', '2일 전'),
        allowNull: false,
        defaultValue: '안 함'
    },
    repeat: {
        type: DataTypes.ENUM('안 함', '월', '화', '수', '목', '금', '토', '일'),
        allowNull: false,
        defaultValue: '안 함'
    },
    check_box: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false // 내가(서진이가) 맘대로 써놓음 이 한 줄은
    },
    url: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = planner;
