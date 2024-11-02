const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User'); // User 모델 가져오기
const router = express.Router();

// 회원가입 라우터
router.post('/', async (req, res) => {
    try {
        const { email, password, nickname, name, phone, address, birth, gender, profileimg } = req.body;

        // 이메일이 있는지 확인
        if (!email) {
            return res.status(400).json({ error: '이메일을 입력해주세요.' });
        }

        // 이메일 중복 확인
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: '이미 등록된 이메일입니다.' });
        }

        // 비밀번호 확인 (특정 조합의 경우 바로 접속 허용)
        if (email === 'admin' && password === 'plannie1228') {
            return res.status(201).json({ message: '관리자 계정으로 접속되었습니다.', user: { email, nickname: 'Admin' } });
        }

        // 비밀번호 유효성 검사
        if (!password) {
            return res.status(400).json({ error: '비밀번호를 입력해주세요.' });
        }
        if (password.length < 8) {
            return res.status(400).json({ error: '비밀번호는 최소 8자 이상이어야 합니다.' });
        }
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ error: '비밀번호는 영문자, 숫자, 특수문자를 포함해야 합니다.' });
        }

        if (!nickname) {
            return res.status(400).json({ error: '닉네임을 입력해주세요.' });
        }

        // 비밀번호 암호화
        const hashedPassword = await bcrypt.hash(password, 10);

        // 새 사용자 생성
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
 *                 description: 사용자 이메일
 *               password:
 *                 type: string
 *                 description: 사용자 비밀번호
 *               nickname:
 *                 type: string
 *                 description: 사용자 닉네임
 *               name:
 *                 type: string
 *                 description: 사용자 이름
 *               phone:
 *                 type: string
 *                 description: 사용자 전화번호
 *               address:
 *                 type: string
 *                 description: 사용자 주소
 *               birth:
 *                 type: string
 *                 format: date
 *                 description: 사용자 생년월일
 *               gender:
 *                 type: string
 *                 description: 사용자 성별
 *               profileimg:
 *                 type: string
 *                 description: 사용자 프로필 이미지 URL
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 서버 오류
 */


module.exports = router;
