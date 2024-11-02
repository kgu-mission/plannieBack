// models/MongoUser.js
const mongoose = require('mongoose');

// MongoDB User 스키마 정의 (email과 password만 저장)
const mongoUserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true, // 이메일 중복 방지
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

// MongoDB User 모델 생성
module.exports = mongoose.model('MongoUser', mongoUserSchema);
