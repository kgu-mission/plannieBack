require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const connectDB = require('./config/mongodb');
const sequelize = require('./config/database');
const cors = require('cors');


// Swagger 설정
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./swagger');

// 라우터 임포트
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const plannerRouter = require('./routes/planner');
const signupRouter = require('./routes/signup');
const authRouter = require('./routes/auth');                // 로그인 라우터
const userProfileRouter = require('./routes/userProfile');  // 회원정보 수정 및 탈퇴 라우터
const processRequestRouter = require('./routes/processRequest');
const chatRouter = require('./routes/chat');                // 채팅 라우터 추가

// 미들웨어 임포트
const authenticateToken = require('./middlewares/authMiddleware'); // 인증 미들웨어
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
app.use(cors()); // 모든 요청에 대해 CORS를 허용

// MongoDB 연결
connectDB(); // MongoDB 연결이 확실히 성공했는지 확인

// MySQL/PostgreSQL 연결 및 모델 동기화
sequelize.sync({ alter: false })
    .then(() => console.log('MySQL/PostgreSQL 연결 성공 및 테이블 동기화 완료'))
    .catch((error) => {
        console.error('MySQL/PostgreSQL 연결 오류:', error);
        process.exit(1);
    });

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(cors()); // 모든 요청에 대해 CORS를 허용
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Swagger UI 설정
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // /api-docs 경로에서 Swagger UI 제공

// 라우터 설정
app.use('/', indexRouter);                       // 기본 라우터 (홈페이지 등)
app.use('/users', usersRouter);                  // 사용자 관련 라우트
app.use('/planner', authenticateToken, plannerRouter); // 인증 미들웨어 적용된 플래너 라우트
app.use('/signup', signupRouter);                // 회원가입 라우트
app.use('/auth', authRouter);                    // 로그인 라우트
app.use('/user', authenticateToken, userProfileRouter); // 인증 미들웨어 적용된 회원정보 수정 및 탈퇴 라우트
app.use('/process-request', processRequestRouter);      // /process-request 경로로 접근
app.use('/chat', chatRouter);                    // 채팅 라우트 추가

// 404 에러 처리 미들웨어
app.use(notFound);

// 에러 처리 미들웨어
app.use(errorHandler);

const PORT = process.env.PORT || 3000; // 동적 포트 설정
app.listen(PORT, function () {
    console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
});

module.exports = app;
