// models/MongoUser.js
const mongoose = require('mongoose');

// MongoDB User 스키마 정의 (email만 저장)
const mongoUserSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

module.exports = mongoose.model('MongoUser', mongoUserSchema);
