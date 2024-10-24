const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    conversationId: mongoose.Schema.Types.ObjectId,
    participants: [{ userId: String, nickname: String }],
    messages: [{
        senderId: String,
        message: String,
        timestamp: { type: Date, default: Date.now },
        messageType: { type: String, default: 'text' },
        status: { type: String, default: 'sent' }
    }]
});

const Chat = mongoose.model('Chat', ChatSchema);
module.exports = Chat;
