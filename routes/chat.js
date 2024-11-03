const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat'); // Chat 모델 가져오기
const { analyzeUserMessage, executeCalendarCommand } = require('../controllers/processRequest'); // 일정 처리 함수 임포트

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
 *     summary: 대화방에 메시지를 전송합니다.
 *     description: "`senderId`는 메시지를 보낸 사용자의 고유 식별자이며, `nickname`은 채팅 화면에 표시될 사용자명입니다."
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
 *                 description: "대화방의 고유 ID"
 *               senderId:
 *                 type: string
 *                 description: "메시지를 보낸 사용자의 고유 식별자 (예: email)"
 *               message:
 *                 type: string
 *                 description: "보낼 메시지 내용"
 *               messageType:
 *                 type: string
 *                 description: "메시지 타입 (예: text, image)"
 *               participants:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       description: "대화방에 참여하는 사용자의 고유 식별자"
 *                     nickname:
 *                       type: string
 *                       description: "대화방에 표시될 사용자의 닉네임"
 *     responses:
 *       200:
 *         description: "메시지 전송 성공"
 *       400:
 *         description: "잘못된 요청"
 *       500:
 *         description: "서버 오류"
 */

router.post('/send-message', async (req, res) => {
    const { conversationId, senderId, message, messageType, participants } = req.body;

    try {
        // 1. 새로운 채팅 메시지를 MongoDB에 저장
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

        // 2. 일정 관련 명령어인지 확인하고, 해당 명령어를 분석하여 MariaDB와 상호작용
        let plannerResponse = '';
        if (message) {
            try {
                const command = await analyzeUserMessage(message); // 메시지 분석
                // 일정 명령어일 때만 executeCalendarCommand를 호출
                if (command && command.isCalendarCommand) {
                    plannerResponse = await executeCalendarCommand(command);
                }
            } catch (error) {
                console.error("일정 처리 중 오류 발생:", error);
                plannerResponse = "일정 처리 중 오류가 발생했습니다.";
            }
        }

        // 3. 응답 전송
        res.status(200).json({ message: "메시지가 저장되었습니다.", chat: savedChat, plannerResponse });
    } catch (error) {
        console.error("메시지 저장 또는 처리 중 오류 발생:", error);
        res.status(500).json({ message: "메시지 저장 또는 처리 중 오류가 발생했습니다.", error: error.message });
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   senderId:
 *                     type: string
 *                     description: "메시지 보낸 사용자의 ID"
 *                   message:
 *                     type: string
 *                     description: "메시지 내용"
 *                   messageType:
 *                     type: string
 *                     description: "메시지 타입"
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                     description: "메시지 전송 시간"
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
        console.error("메시지 조회 중 오류 발생:", error);
        res.status(500).json({ message: "메시지 조회 중 오류가 발생했습니다.", error: error.message });
    }
});

module.exports = router;
