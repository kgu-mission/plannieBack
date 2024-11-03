// routes/signup.js

const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User'); // MariaDB User 모델 가져오기
const MongoUser = require('../models/MongoUser'); // MongoDB User 모델 가져오기
const router = express.Router();

// 요청이 JSON 형식인지 확인하는 미들웨어
router.use((req, res, next) => {
    if (req.is('application/json')) {
        next();
    } else {
        res.status(400).json({ error: 'Content-Type은 application/json이어야 합니다.' });
    }
});

router.post('/', async (req, res) => {
    try {
        console.log("Received data:", req.body);  // 요청 바디 확인용 로그
        const { email, password, nickname, name, phone, address, birth, gender, profileimg } = req.body;

        // 필수 항목 확인
        if (!email) {
            return res.status(400).json({ error: '이메일을 입력해주세요.' });
        }
        if (!password) {
            return res.status(400).json({ error: '비밀번호를 입력해주세요.' });
        }
        if (!nickname) {
            return res.status(400).json({ error: '닉네임을 입력해주세요.' });
        }

        // MariaDB에서 이메일 중복 확인
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: '이미 등록된 이메일입니다.' });
        }

        // MongoDB에서 이메일 중복 확인
        const existingMongoUser = await MongoUser.findOne({ _id: email });
        if (existingMongoUser) {
            return res.status(400).json({ error: '이미 등록된 이메일입니다.' });
        }

        // 비밀번호 암호화
        const hashedPassword = await bcrypt.hash(password, 10);

        // MariaDB에 새 사용자 생성
        const newUser = await User.create({
            email,
            password: hashedPassword,
            nickname,
            name,
            phone,
            address,
            birth,
            gender,
            profileimg
        });

        // MongoDB에 새 사용자 생성 (email을 _id와 email 필드 모두에 저장)
        const newMongoUser = new MongoUser({
            _id: email,
            email: email
        });
        await newMongoUser.save();
        console.log("MongoDB에 사용자 저장 성공:", newMongoUser); // 저장 성공 로그

        res.status(201).json({ message: '회원가입 성공!', user: newUser });
    } catch (error) {
        console.error('회원가입 에러:', error);
        res.status(500).json({ error: '회원가입 중 오류가 발생했습니다.' });
    }
});

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: 회원가입
 *     description: 회원가입 시 사용자의 정보를 MariaDB와 MongoDB에 저장합니다. MongoDB에는 이메일만 저장됩니다.
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
 *                 description: "사용자 이메일 (필수)"
 *               password:
 *                 type: string
 *                 description: "사용자 비밀번호 (필수)"
 *               nickname:
 *                 type: string
 *                 description: "사용자 닉네임 (필수)"
 *             required: # 필수 필드 지정
 *               - email
 *               - password
 *               - nickname
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "회원가입 성공!"
 *                 user:
 *                   type: object
 *                   description: MariaDB에 저장된 사용자 정보
 *       400:
 *         description: 잘못된 요청 (이메일 중복, 유효성 실패 등)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "이메일을 입력해주세요."
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "회원가입 중 오류가 발생했습니다."
 */

module.exports = router;
