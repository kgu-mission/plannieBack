// routes/chat.js
const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const moment = require('moment');
const { generatePlan } = require('../openai');
const plannerController = require('../controllers/plannerController');

/**
 * @swagger
 * /chat/send-message:
 *   post:
 *     summary: 채팅 메시지 전송 및 일정 관리
 *     description: 사용자의 채팅 메시지를 MongoDB에 저장하고, 일정 관련 명령어를 감지하여 MariaDB와 상호작용합니다.
 *     tags: [Chat]
 */

router.post('/send-message', async (req, res) => {
    const { conversationId, senderId, message, participants } = req.body;

    try {
        let chat = await Chat.findOne({ conversationId });
        if (!chat) {
            chat = new Chat({ conversationId, participants, messages: [] });
        }
        chat.messages.push({ senderId, message, timestamp: new Date() });

        // OpenAI 명령어 분석 및 수동 명령어 감지
        let command = await generatePlan(message);

        // "내일"이라는 키워드 감지 후 날짜 자동 계산
        if (command.isCalendarCommand && command.date === "내일") {
            command.date = moment().add(1, 'days').format('YYYY.MM.DD');
        }

        // 일정 추가 시 OpenAI로부터 받은 제목을 사용하도록 수정
        let chatResponse;
        if (command.isCalendarCommand && command.action === 'add') {
            const result = await plannerController.createPlanner({
                start_day: command.date,
                end_day: command.date,
                title: command.title || "일정", // OpenAI로부터 받은 제목을 사용
                start_time: command.start_time,
                end_time: command.end_time,
                userEmail: senderId
            });

            chatResponse = result.message || result.error || `${command.date}에 ${command.title} 일정이 추가되었습니다.`;
        } else {
            chatResponse = "네, 제가 어떻게 도와드릴까요? 필요하신 일정이나 계획을 알려주시면 도움을 드리겠습니다!";
        }

        // 챗봇의 응답 메시지 추가
        chat.messages.push({
            senderId: "ChatBot",
            message: chatResponse,
            timestamp: new Date()
        });

        await chat.save();
        res.status(200).json(chat);
    } catch (error) {
        console.error("메시지 저장 오류:", error);
        res.status(500).json({ message: "메시지 저장 중 오류가 발생했습니다.", error });
    }
});

/**
 * @swagger
 * /chat/send-message:
 *   post:
 *     summary: 채팅 메시지 전송 및 일정 관리
 *     description: MongoDB에 대화 저장 후 일정 관련 명령어를 감지하여 MariaDB와 상호작용합니다.
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               conversationId: { type: string, description: "대화방 고유 ID" }
 *               senderId: { type: string, description: "사용자 ID" }
 *               message: { type: string, description: "메시지 내용" }
 *     responses:
 *       200: { description: "메시지 처리 성공" }
 *       500: { description: "서버 오류" }
 */


module.exports = router;
