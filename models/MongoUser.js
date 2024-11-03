// models/MongoUser.js
const mongoose = require('mongoose');

// MongoDB User 스키마 정의 (email만 저장)
const mongoUserSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    }
}, { _id: false }); // 기본적으로 제공되는 _id를 사용하므로, 별도로 인덱싱하지 않도록 설정

// MongoDB User 모델 생성
module.exports = mongoose.model('MongoUser', mongoUserSchema);
