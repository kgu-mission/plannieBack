require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const { generatePlan } = require('./openai');  // openai.js에서 가져오기
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const Conversation = require('./models/conversation'); // 대화 기록 스키마 가져오기

const app = express();

// MongoDB 연결
mongoose.connect(process.env.MONGO_URI)  // MongoDB 연결 문자열
  .then(() => console.log('MongoDB 연결 성공'))
  .catch((error) => {
    console.error('MongoDB 연결 오류:', error);
    process.exit(1);  // DB 연결 실패 시 서버 종료
  });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 라우팅 설정
app.use('/', indexRouter);
app.use('/users', usersRouter);

// OpenAI를 사용한 계획 생성 라우터
app.post('/create-plan', async (req, res) => {
  const userInput = req.body.input;  // 사용자 입력 받기

  try {
    // 기존 대화 기록을 MongoDB에서 불러오기
    let conversation = await Conversation.findOne({ userId: 'default_user' });
    
    if (!conversation) {
      conversation = new Conversation({ userId: 'default_user', conversationHistory: [] });
    }

    // OpenAI API를 사용하여 계획을 생성
    const plan = await generatePlan(userInput, conversation.conversationHistory);
    
    // 대화 기록에 사용자 입력과 AI 응답 추가
    conversation.conversationHistory.push({ role: "user", content: userInput });
    conversation.conversationHistory.push({ role: "assistant", content: plan });

    // 대화 기록을 MongoDB에 저장
    await conversation.save();

    res.json({ plan: plan });
  } catch (error) {
    res.status(500).json({ error: "계획 생성 중 오류가 발생했습니다." });
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// 서버 실행
app.listen(3000, function () {
  console.log('서버가 3000번 포트에서 실행 중입니다.');
});

module.exports = app;

