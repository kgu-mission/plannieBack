const { Sequelize } = require('sequelize');

// Sequelize 인스턴스 생성
const sequelize = new Sequelize('planieDB', 'admin', 'qwer1234', {
    host: 'database-planie.cr4w208kyjvg.ap-northeast-2.rds.amazonaws.com',  // RDS 엔드포인트
    dialect: 'mariadb',
    dialectOptions: {
        timezone: "Etc/GMT0"  // 타임존 설정
    },
    logging: false,  // 로깅 비활성화
    pool: {
        max: 5,  // 최대 연결 수
        min: 0,  // 최소 연결 수
        acquire: 30000,  // 연결 시도 최대 시간 (밀리초)
        idle: 10000  // 연결이 사용되지 않고 유지되는 최대 시간
    }
});

module.exports = sequelize;
