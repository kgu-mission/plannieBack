const { Sequelize } = require('sequelize');

// Sequelize 인스턴스 생성
// const sequelize = new Sequelize('plannie', 'admin', 'qwer1234', {
//     host: '3.38.77.119',  // EC2 인스턴스의 퍼블릭 IP 또는 RDS 엔드포인트 사용
//     dialect: 'mariadb',
//     dialectOptions: {
//         timezone: '+00:00'  // 타임존 설정
//     },
//     logging: false,  // 로깅 비활성화
//     pool: {
//         max: 5,  // 최대 연결 수
//         min: 0,  // 최소 연결 수
//         acquire: 60000,  // 연결 시도 최대 시간 (밀리초)
//         idle: 10000  // 연결이 사용되지 않고 유지되는 최대 시간
//     }
// });
const sequelize = new Sequelize('plannie', 'admin', 'qwer1234', {
    host: 'database-plannie.cr4w208kyjvg.ap-northeast-2.rds.amazonaws.com',
    dialect: 'mariadb',
    logging: console.log, // 모든 SQL 로그 출력
});

module.exports = sequelize;
