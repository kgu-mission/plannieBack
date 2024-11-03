// routes/chat.js
const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const { analyzeUserMessage } = require('../controllers/processRequest');
const { generatePlan } = require('../openai');
const plannerController = require('../controllers/plannerController');

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: 채팅 및 일정 관리 API
 */

/**
 * @swagger
 * /chat/send-message:
 *   post:
 *     summary: 채팅 메시지 전송 및 일정 관리
 *     description: 사용자의 채팅 메시지를 MongoDB에 저장하고, 일정 관련 명령어를 처리합니다.
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
 *                 description: 대화방의 고유 ID
 *               senderId:
 *                 type: string
 *                 description: 메시지를 보낸 사용자의 고유 식별자 (예: email)
 *               message:
 *                 type: string
 *                 description: 보낼 메시지 내용
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
 *                       description: 대화방에 참여하는 사용자의 고유 식별자
 *                     nickname:
 *                       type: string
 *                       description: 대화방에 표시될 사용자의 닉네임
 *     responses:
 *       200:
 *         description: 메시지 및 일정 처리 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: 전송 상태 메시지
 *                 chat:
 *                   type: object
 *                   description: 저장된 채팅 메시지 정보
 *       500:
 *         description: 서버 오류
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

        let plannerResponse = '';
        const command = await generatePlan(message);

        if (command && command.action) {
            const { action, title, date, start_time, end_time } = command;
            if (action === 'add') {
                plannerResponse = await plannerController.createPlanner({
                    body: { title, start_day: date, end_day: date, start_time, end_time },
                    user: { email: senderId }
                });
            } else if (action === 'update') {
                plannerResponse = await plannerController.updatePlannerById({
                    params: { id: command.id },
                    body: { title, start_day: date, start_time, end_time },
                    user: { email: senderId }
                });
            } else if (action === 'delete') {
                plannerResponse = await plannerController.deletePlannerById({
                    params: { id: command.id },
                    user: { email: senderId }
                });
            } else if (action === 'view') {
                plannerResponse = await plannerController.getPlannersByDate({
                    query: { date },
                    user: { email: senderId }
                });
            }

            chat.messages.push({
                senderId: "ChatBot",
                message: plannerResponse.message || "일정 처리 결과를 가져오는 중 오류 발생",
                messageType: "text",
                timestamp: new Date()
            });
        } else {
            chat.messages.push({
                senderId: "ChatBot",
                message: "일반 대화 처리 중입니다.",
                messageType: "text",
                timestamp: new Date()
            });
        }

        await chat.save();
        res.status(200).json({ message: "메시지가 저장되었습니다.", chat });
    } catch (error) {
        console.error("메시지 저장 또는 처리 중 오류 발생:", error);
        res.status(500).json({ message: "메시지 저장 또는 처리 중 오류가 발생했습니다.", error: error.message });
    }
});

module.exports = router;
