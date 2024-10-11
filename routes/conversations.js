const express = require('express');
const Conversation = require('../models/conversation'); // conversation 모델 가져오기
const router = express.Router();

// 새로운 대화 저장 (POST /conversations)
router.post('/conversations', async (req, res) => {
    const { userId, role, content } = req.body;

    try {
        let conversation = await Conversation.findOne({ userId });

        if (!conversation) {
            conversation = new Conversation({
                userId,
                conversationHistory: [{ role, content }]
            });
        } else {
            conversation.conversationHistory.push({ role, content });
        }

        await conversation.save();
        res.status(201).json({ message: 'Conversation saved', conversation });
    } catch (error) {
        console.error('Error saving conversation:', error);
        res.status(500).json({ message: 'Error saving conversation' });
    }
});

// 사용자 ID로 대화 조회 (GET /conversations/:userId)
router.get('/conversations/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const conversation = await Conversation.findOne({ userId });

        if (!conversation) {
            return res.status(404).json({ message: 'No conversation found for this user' });
        }

        res.status(200).json({ conversation });
    } catch (error) {
        console.error('Error retrieving conversation:', error);
        res.status(500).json({ message: 'Error retrieving conversation' });
    }
});

// 대화 삭제 (DELETE /conversations/:userId)
router.delete('/conversations/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const conversation = await Conversation.findOneAndDelete({ userId });

        if (!conversation) {
            return res.status(404).json({ message: 'No conversation found to delete' });
        }

        res.status(200).json({ message: 'Conversation deleted' });
    } catch (error) {
        console.error('Error deleting conversation:', error);
        res.status(500).json({ message: 'Error deleting conversation' });
    }
});

module.exports = router;

