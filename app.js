require('dotenv').config();
const axios = require('axios');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const plannerRouter = require('./routes/planner');
const Conversation = require('./models/conversation');
const connectDB = require('./config/mongodb');
const sequelize = require('./config/database');
const Planner = require('./models/planner');
const chatRouter = require('./routes/chat');
const createError = require('http-errors');
const moment = require('moment');
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

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/planner', plannerRouter);
app.use('/chat', chatRouter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// OpenAI로 일정 관리
app.post('/process-request', async (req, res) => {
  const userRequest = `${req.body.request} Please respond only in JSON format with the following structure: { "action": "add" | "update" | "delete", "id": "id_value", "title": "title_value", "date": "YYYY-MM-DD", "time": "HH:MM", "end_time": "HH:MM", "notification": true, "repeat": 0, "check_box": false }.`;

  try {
    const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: userRequest }]
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
    );

    const fullText = response.data.choices[0].message.content;
    const jsonMatch = fullText.match(/\{.*\}/s);

    if (jsonMatch) {
      const parsedCommand = JSON.parse(jsonMatch[0]);

      // 추가
      if (parsedCommand.action === 'add') {
        const newPlanner = await Planner.create({
          title: parsedCommand.title,
          start_day: moment(parsedCommand.date, "YYYY-MM-DD").isValid() ? parsedCommand.date : null,
          start_time: parsedCommand.time,
          end_time: parsedCommand.end_time,
          notification: parsedCommand.notification || false,
          repeat: parsedCommand.repeat || 0,
          check_box: parsedCommand.check_box || false
        });
        res.json({ message: '일정이 추가되었습니다.', planner: newPlanner });

        // 수정
      } else if (parsedCommand.action === 'update') {
        const planner = await Planner.findByPk(parsedCommand.id);
        if (planner) {
          await planner.update({
            title: parsedCommand.title || planner.title,
            start_day: moment(parsedCommand.date, "YYYY-MM-DD").isValid() ? parsedCommand.date : planner.start_day,
            start_time: parsedCommand.time || planner.start_time,
            end_time: parsedCommand.end_time || planner.end_time,
            notification: parsedCommand.notification ?? planner.notification,
            repeat: parsedCommand.repeat ?? planner.repeat,
            check_box: parsedCommand.check_box ?? planner.check_box
          });
          res.json({ message: '일정이 수정되었습니다.', planner });
        } else {
          res.status(404).json({ message: "수정할 일정이 없습니다." });
        }

        // 삭제
      } else if (parsedCommand.action === 'delete') {
        const planner = await Planner.findByPk(parsedCommand.id);
        if (planner) {
          await planner.destroy();
          res.json({ message: "일정이 삭제되었습니다." });
        } else {
          res.status(404).json({ message: "삭제할 일정이 없습니다." });
        }
      } else {
        res.status(400).json({ message: "유효하지 않은 명령입니다.", response: fullText });
      }
    } else {
      res.status(400).json({ message: "응답에서 JSON을 찾을 수 없습니다.", response: fullText });
    }
  } catch (error) {
    res.status(500).json({ message: "명령 처리 중 오류가 발생했습니다.", error: error.message });
  }
});

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

app.listen(3000, function () {
  console.log('서버가 3000번 포트에서 실행 중입니다.');
});

module.exports = app;
