require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const connectDB = require('./config/mongodb');
const sequelize = require('./config/database');

// 라우터 임포트
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const plannerRouter = require('./routes/planner');
const signupRouter = require('./routes/signup');
const userProfileRouter = require('./routes/userProfile');
const processRequestRouter = require('./routes/processRequest');

// 미들웨어 임포트
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// MongoDB 연결
connectDB();

// MySQL/PostgreSQL 연결 및 모델 동기화
sequelize.sync({ alter: false })
    .then(() => console.log('MySQL/PostgreSQL 연결 성공 및 테이블 동기화 완료'))
    .catch((error) => {
      console.error('MySQL/PostgreSQL 연결 오류:', error);
      process.exit(1);
    });

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 라우터 설정
app.use('/', indexRouter);                  // 기본 라우터 (홈페이지 등)
app.use('/users', usersRouter);             // 사용자 관련 라우트
app.use('/planner', plannerRouter);         // 플래너 관련 라우트
app.use('/api', signupRouter);              // /api/signup 경로로 접근
app.use('/user', userProfileRouter);        // /user/update 경로로 접근
app.use('/process-request', processRequestRouter); // /process-request 경로로 접근

// 404 에러 처리 미들웨어
app.use(notFound);

// 에러 처리 미들웨어
app.use(errorHandler);

app.listen(3000, function () {
  console.log('서버가 3000번 포트에서 실행 중입니다.');
});

module.exports = app;
