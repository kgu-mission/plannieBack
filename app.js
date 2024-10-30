require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const axios = require('axios');
const createError = require('http-errors');
const moment = require('moment');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const plannerRouter = require('./routes/planner');
const chatRouter = require('./routes/chat');
const connectDB = require('./config/mongodb');
const sequelize = require('./config/database');
const Planner = require('./models/planner');
const { swaggerUi, swaggerSpec } = require('./swagger');

const app = express();

// MongoDB 연결
connectDB();

// MySQL/PostgreSQL 연결 및 모델 동기화
sequelize.sync({ alter: true })
    .then(() => console.log('MySQL/PostgreSQL 연결 성공 및 테이블 동기화 완료'))
    .catch((error) => {
      console.error('MySQL/PostgreSQL 연결 오류:', error);
      process.exit(1);
    });

// 미들웨어 설정
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 라우터 설정
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/planner', plannerRouter);
app.use('/chat', chatRouter);

// Swagger API 문서 경로
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// OpenAI로 일정 관리 - 본문 동일
app.post('/process-request', async (req, res) => {
  // 내용 생략 - 기존과 동일
});

// 404 에러 핸들러
app.use((req, res, next) => {
  res.status(404).json({
    message: "Not Found",
    status: 404,
  });
});

// 오류 핸들러 (JSON으로 응답)
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    status: err.status || 500,
  });
});

// 서버 실행
app.listen(3000, function () {
  console.log('서버가 3000번 포트에서 실행 중입니다.');
});

module.exports = app;
