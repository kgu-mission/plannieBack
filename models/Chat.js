// models/Chat.js
const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true }, // 대화방 ID
    participants: [{ userId: String, nickname: String }], // 참여자 정보
    messages: [{
        senderId: String,                                   // 송신자 ID
        message: String,                                    // 메시지 내용
        timestamp: { type: Date, default: Date.now },       // 전송 시간
        messageType: { type: String, default: 'text' },     // 메시지 유형 (예: text, image 등)
        status: { type: String, default: 'sent' }           // 메시지 상태 (예: sent, delivered, read)
    }]
});

const Chat = mongoose.model('Chat', ChatSchema);
module.exports = Chat;
