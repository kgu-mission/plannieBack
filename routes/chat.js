// routes/chat.js
// routes/chat.js
const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
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

        // OpenAI 명령어 분석
        let command = await generatePlan(message);
        console.log("Command Analysis Result:", command);

        let chatResponse;

        if (command.isCalendarCommand) {
            // 일정 관련 명령어인 경우 MariaDB와 상호작용 수행
            const { action, date, title, start_time, end_time } = command;

            if (action === 'view') {
                const planners = await plannerController.getPlannersByDate({
                    query: { date },
                    user: { email: senderId }
                });
                chatResponse = planners.length > 0
                    ? `해당 날짜의 일정은 다음과 같습니다:\n${planners.map(planner => `- ${planner.start_time} ~ ${planner.end_time}: ${planner.title}`).join('\n')}`
                    : '해당 날짜에 일정이 없습니다.';
            } else if (action === 'add') {
                const result = await plannerController.createPlanner({
                    body: { title, start_day: date, end_day: date, start_time, end_time },
                    user: { email: senderId }
                });
                chatResponse = result.message || "일정이 추가되었습니다.";
            } else if (action === 'update') {
                const result = await plannerController.updatePlannerById({
                    params: { id: command.id },
                    body: { title, start_day: date, start_time, end_time },
                    user: { email: senderId }
                });
                chatResponse = result.message || "일정이 수정되었습니다.";
            } else if (action === 'delete') {
                const result = await plannerController.deletePlannerById({
                    params: { id: command.id },
                    user: { email: senderId }
                });
                chatResponse = result.message || "일정이 삭제되었습니다.";
            }
        } else {
            // 일정 관련 명령어가 아닌 경우 일반 대화 응답 생성
            chatResponse = "네, 도움이 필요하시면 말씀해주세요!";
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

router.post('/send-message', async (req, res) => { /* 코드 생략 */ });


module.exports = router;
