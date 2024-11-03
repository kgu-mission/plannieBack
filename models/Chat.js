// models/Chat.js
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    conversationId: {
        type: String, // ObjectId에서 String으로 변경
        required: true,
        unique: true // 각 대화방의 ID가 고유하도록 설정
    },
    participants: [
        {
            userId: String,
            nickname: String
        }
    ],
    messages: [
        {
            senderId: String,
            message: String,
            messageType: String,
            timestamp: { type: Date, default: Date.now }
        }
    ]
});

module.exports = mongoose.model('Chat', chatSchema);
