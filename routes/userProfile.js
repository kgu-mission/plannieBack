// routes/userProfile.js

const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User'); // MariaDB User 모델 가져오기
const authenticateToken = require('../middlewares/authMiddleware');
const router = express.Router();

/**
 * 회원 정보 수정 라우터
 */
router.put('/update', authenticateToken, async (req, res) => {
    try {
        const { password, nickname, name, phone, address, birth, gender, profileimg } = req.body;
        const email = req.user.email; // 토큰에서 추출한 사용자 email

        // 사용자 조회
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: '수정할 사용자를 찾을 수 없습니다.' });
        }

        // 비밀번호 유효성 검사 및 암호화
        if (password) {
            if (password.length < 8) {
                return res.status(400).json({ error: '비밀번호는 최소 8자 이상이어야 합니다.' });
            }
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/;
            if (!passwordRegex.test(password)) {
                return res.status(400).json({ error: '비밀번호는 영문자, 숫자, 특수문자를 포함해야 합니다.' });
            }
            user.password = await bcrypt.hash(password, 10);
        }
        if (nickname) user.nickname = nickname;
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (address) user.address = address;
        if (birth) user.birth = birth;
        if (gender) user.gender = gender;
        if (profileimg) user.profileimg = profileimg;

        // 변경 사항 저장
        await user.save();
        res.json({ message: '회원정보가 수정되었습니다.', user });
    } catch (error) {
        console.error('회원정보 수정 중 오류:', error);
        res.status(500).json({ error: '회원정보 수정 중 오류가 발생했습니다.' });
    }
});

/**
 * @swagger
 * /user/update:
 *   put:
 *     summary: 회원정보 수정
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: 새로운 비밀번호
 *               nickname:
 *                 type: string
 *                 description: 새로운 닉네임
 *               name:
 *                 type: string
 *                 description: 새로운 이름
 *               phone:
 *                 type: string
 *                 description: 새로운 전화번호
 *               address:
 *                 type: string
 *                 description: 새로운 주소
 *               birth:
 *                 type: string
 *                 format: date
 *                 description: 새로운 생년월일
 *               gender:
 *                 type: string
 *                 description: 성별
 *               profileimg:
 *                 type: string
 *                 description: 새로운 프로필 이미지 URL
 *     responses:
 *       200:
 *         description: 회원정보 수정 성공
 *       401:
 *         description: 인증 필요 (JWT 토큰 누락)
 *       404:
 *         description: 사용자 정보 없음
 *       500:
 *         description: 서버 오류
 */

/**
 * 회원 탈퇴 라우터
 */
router.delete('/delete', authenticateToken, async (req, res) => {
    try {
        const email = req.user.email; // 토큰에서 추출한 사용자 email

        // 사용자 조회
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: '삭제할 사용자를 찾을 수 없습니다.' });
        }

        // 사용자 삭제
        await user.destroy();
        res.json({ message: '회원탈퇴가 완료되었습니다.' });
    } catch (error) {
        console.error('회원탈퇴 중 오류:', error);
        res.status(500).json({ error: '회원탈퇴 중 오류가 발생했습니다.' });
    }
});

/**
 * @swagger
 * /user/delete:
 *   delete:
 *     summary: 회원탈퇴
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 회원탈퇴 성공
 *       401:
 *         description: 인증 필요 (JWT 토큰 누락)
 *       404:
 *         description: 사용자 정보 없음
 *       500:
 *         description: 서버 오류
 */

module.exports = router;
