// routes/chat.js
const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const plannerController = require('../controllers/plannerController');
const { generatePlan, generateGeneralResponse } = require('../openai'); // 일반 대화 응답 함수 추가

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
 *     description: 사용자의 채팅 메시지를 MongoDB에 저장하고, 일정 관련 명령어가 감지되면 일정 조회, 추가, 수정, 삭제 작업을 수행합니다. 일반 대화일 경우 자연스러운 챗봇 응답을 반환합니다.
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
 *                 example: "71a6c798-a448-4547-9c8e-474a9917084a"
 *               senderId:
 *                 type: string
 *                 description: "메시지를 보낸 사용자의 고유 식별자 (예: email)"
 *                 example: "juytj21@gmail.com"
 *               message:
 *                 type: string
 *                 description: "보낼 메시지 내용"
 *                 example: "내일 일정 조회해줘"
 *               messageType:
 *                 type: string
 *                 description: "메시지 타입 (예: text, image)"
 *                 example: "text"
 *               participants:
 *                 type: array
 *                 description: "대화방에 참여하는 사용자 목록"
 *                 items:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       description: "대화방에 참여하는 사용자의 고유 식별자"
 *                       example: "juytj21@gmail.com"
 *                     nickname:
 *                       type: string
 *                       description: "대화방에 표시될 사용자의 닉네임"
 *                       example: "User"
 *     responses:
 *       200:
 *         description: "메시지 및 일정 처리 성공"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: "전송 상태 메시지"
 *                   example: "메시지가 저장되었습니다."
 *                 chat:
 *                   type: object
 *                   description: "저장된 채팅 메시지 정보"
 *                   properties:
 *                     conversationId:
 *                       type: string
 *                       description: "대화방의 고유 ID"
 *                       example: "71a6c798-a448-4547-9c8e-474a9917084a"
 *                     participants:
 *                       type: array
 *                       description: "대화방에 참여하는 사용자 목록"
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                             description: "사용자의 고유 식별자"
 *                             example: "juytj21@gmail.com"
 *                           nickname:
 *                             type: string
 *                             description: "사용자의 닉네임"
 *                             example: "User"
 *                     messages:
 *                       type: array
 *                       description: "저장된 채팅 메시지 목록"
 *                       items:
 *                         type: object
 *                         properties:
 *                           senderId:
 *                             type: string
 *                             description: "메시지를 보낸 사용자 ID"
 *                             example: "juytj21@gmail.com"
 *                           message:
 *                             type: string
 *                             description: "메시지 내용"
 *                             example: "내일 일정 조회해줘"
 *                           messageType:
 *                             type: string
 *                             description: "메시지 타입"
 *                             example: "text"
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                             description: "메시지 전송 시간"
 *                             example: "2024-11-03T19:59:43.113Z"
 *       500:
 *         description: "서버 오류"
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

        let plannerResponse;
        const command = await generatePlan(message); // 명령어 분석

        if (command && command.isCalendarCommand) {
            // 일정 관련 명령어가 감지되면 MariaDB와 상호작용
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
                message: plannerResponse.message || "일정 처리 완료되었습니다.",
                messageType: "text",
                timestamp: new Date()
            });
        } else {
            // 일반 대화 응답 요청
            const generalResponse = await generateGeneralResponse(message);
            chat.messages.push({
                senderId: "ChatBot",
                message: generalResponse,
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
