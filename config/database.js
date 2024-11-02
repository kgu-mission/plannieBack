// config/database.js
const { Sequelize } = require('sequelize');

// Sequelize 인스턴스 생성
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,  // DB_HOST 설정 확인
    dialect: 'mariadb',
    dialectOptions: {
        timezone: '+00:00'  // 타임존 설정
    },
    logging: console.log,       // 모든 SQL 로그 출력 (디버깅 시 유용)
    pool: {
        max: 5,
        min: 0,
        acquire: 60000,        // 연결 시도 최대 시간 설정 (기본값보다 넉넉하게 설정)
        idle: 10000            // 사용되지 않고 유지되는 연결의 최대 시간
    }
});

module.exports = sequelize;
