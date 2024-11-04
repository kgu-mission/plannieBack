require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const connectDB = require('./config/mongodb');
const sequelize = require('./config/database');
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./swagger');

// Import routes
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const plannerRouter = require('./routes/planner');
const signupRouter = require('./routes/signup');
const authRouter = require('./routes/auth');
const userProfileRouter = require('./routes/userProfile');
const processRequestRouter = require('./routes/processRequest');
const chatRouter = require('./routes/chat');

// Import middlewares
const authenticateToken = require('./middlewares/authMiddleware');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Database connections
connectDB(); // Connect to MongoDB
sequelize.sync({ alter: false })
    .then(() => console.log('MySQL/PostgreSQL 연결 성공 및 테이블 동기화 완료'))
    .catch((error) => {
        console.error('MySQL/PostgreSQL 연결 오류:', error);
        process.exit(1); // Exit on database connection failure
    });

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middlewares
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Route handlers
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/planner', authenticateToken, plannerRouter); // Protected route
app.use('/signup', signupRouter);
app.use('/auth', authRouter);
app.use('/user', authenticateToken, userProfileRouter); // Protected route
app.use('/process-request', processRequestRouter);
app.use('/chat', chatRouter);

// Error handling middlewares
app.use(notFound); // 404 Not Found handler
app.use(errorHandler); // General error handler

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
});

module.exports = app;
