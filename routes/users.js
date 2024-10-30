// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');  // User 모델 가져오기
const bcrypt = require('bcrypt'); // 비밀번호 암호화를 위한 bcrypt
const jwt = require('jsonwebtoken'); // JWT를 위한 jsonwebtoken 라이브러리

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 사용자 관련 API
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: 사용자 목록 조회
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: 사용자 목록에 대한 응답 메시지
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: respond with a resource
 */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: 회원가입 API
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "your_password"
 *               nickname:
 *                 type: string
 *                 example: "nickname"
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *       400:
 *         description: 잘못된 요청
 */
router.post('/register', async (req, res) => {
  const { email, password, nickname } = req.body;
  try {
    // 이메일 중복 검사
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: '이미 존재하는 이메일입니다.' });
    }

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);
    // 사용자 생성
    const user = await User.create({ email, password: hashedPassword, nickname });
    res.status(201).json({ message: '회원가입 성공', user });
  } catch (error) {
    res.status(500).json({ message: '회원가입 실패', error: error.message });
  }
});

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: 로그인 API
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "your_password"
 *     responses:
 *       200:
 *         description: 로그인 성공
 *       401:
 *         description: 인증 실패
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: '해당 이메일의 사용자를 찾을 수 없습니다.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
        { email: user.email },
        process.env.JWT_SECRET || 'default_secret', // 환경변수 기본값 설정
        { expiresIn: '1h' }
    );

    res.setHeader('Authorization', `Bearer ${token}`);
    res.json({ message: '로그인 성공', token });
  } catch (error) {
    res.status(500).json({ message: '로그인 처리 중 오류가 발생했습니다.', error: error.message });
  }
});

module.exports = router;
