// models/MongoUser.js
const mongoose = require('mongoose');

// MongoDB User 스키마 정의 (email과 password만 저장)
const mongoUserSchema = new mongoose.Schema({
    _id: {  // 이메일을 _id로 사용하여 고유 식별자로 설정
        type: String,
        required: true,
    },
    // password: {
    //     type: String,
    //     required: true
    // },
    createdAt: {
        type: Date,
        default: Date.now,
    }
}, { _id: false });  // _id 필드를 이메일로 대체

// MongoDB User 모델 생성
module.exports = mongoose.model('MongoUser', mongoUserSchema);
