const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User'); // User 모델 가져오기
const router = express.Router();

// 회원 정보 수정 라우터
router.put('/update', async (req, res) => {
    try {
        const { id, password, nickname, name, phone, address, birth, gender, profileimg } = req.body;

        // 이메일이 아닌 ID로 사용자 조회
        const user = await User.findOne({ where: { email: id } });  // email 필드에 id 값을 사용
        if (!user) {
            return res.status(404).json({ error: '수정할 사용자를 찾을 수 없습니다.' });
        }

        // 필요한 경우 수정할 필드만 업데이트
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

module.exports = router;
