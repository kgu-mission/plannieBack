const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat'); // Chat 모델 가져오기

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: 채팅 API
 */

/**
 * @swagger
 * /chat/send-message:
 *   post:
 *     summary: 새로운 대화방을 생성하거나 기존 대화방에 메시지를 추가합니다.
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               conversationId:
 *                 type: string
 *                 description: 대화방의 ID
 *               senderId:
 *                 type: string
 *                 description: 메시지를 보낸 사용자 ID
 *               message:
 *                 type: string
 *                 description: 메시지 내용
 *               messageType:
 *                 type: string
 *                 description: 메시지 타입 (예: text, image)
 *               participants:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       description: 참여자 ID
 *                     nickname:
 *                       type: string
 *                       description: 참여자 닉네임
 *     responses:
 *       200:
 *         description: 메시지가 저장되었습니다.
 *       500:
 *         description: 메시지 저장 중 오류가 발생했습니다.
 */
router.post('/send-message', async (req, res) => {
    const { conversationId, senderId, message, messageType, participants } = req.body;

    try {
        let chat = await Chat.findOne({ conversationId });

        if (!chat) {
            chat = new Chat({
                conversationId,
                participants,
                messages: [{ senderId, message, messageType, timestamp: new Date() }]
            });
        } else {
            chat.messages.push({ senderId, message, messageType, timestamp: new Date() });
        }

        const savedChat = await chat.save();
        res.status(200).json({ message: "메시지가 저장되었습니다.", chat: savedChat });
    } catch (error) {
        res.status(500).json({ message: "메시지 저장 중 오류가 발생했습니다.", error: error.message });
    }
});

/**
 * @swagger
 * /chat/messages/{conversationId}:
 *   get:
 *     summary: 특정 대화방의 채팅 기록을 조회합니다.
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         schema:
 *           type: string
 *         required: true
 *         description: 대화방의 ID
 *     responses:
 *       200:
 *         description: 특정 대화방의 메시지 기록 조회 성공
 *       404:
 *         description: 대화방을 찾을 수 없습니다.
 *       500:
 *         description: 메시지 조회 중 오류가 발생했습니다.
 */
router.get('/messages/:conversationId', async (req, res) => {
    try {
        const conversationId = req.params.conversationId;
        const chat = await Chat.findOne({ conversationId });

        if (chat) {
            res.status(200).json(chat.messages);
        } else {
            res.status(404).json({ message: "대화방을 찾을 수 없습니다." });
        }
    } catch (error) {
        res.status(500).json({ message: "메시지 조회 중 오류가 발생했습니다.", error: error.message });
    }
});

module.exports = router;
