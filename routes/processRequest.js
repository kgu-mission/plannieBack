// routes/processRequest.js
const express = require('express');
const router = express.Router();
const moment = require('moment');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config(); // 환경 변수 로드

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// 필요한 컨트롤러 및 모델 임포트
const { getConversationHistory, saveConversationHistory } = require('../controllers/conversationController');
const { getSchedule, addSchedule, updateSchedule, deleteSchedule } = require('../controllers/processRequest');

// 함수 정의
const functions = [
    {
        name: "get_schedule",
        description: "사용자가 특정 날짜의 일정을 **명확하게 요청**했을 때, 해당 날짜의 일정을 조회합니다.",
        parameters: {
            type: "object",
            properties: {
                date: {
                    type: "string",
                    description: "'오늘', '내일', 또는 'YYYY-MM-DD' 형식의 날짜"
                }
            },
            required: ["date"]
        }
    },
    {
        name: "add_schedule",
        description: "사용자가 새로운 일정을 추가하겠다고 **명확하게 요청**했을 때, 새로운 일정을 추가합니다.",
        parameters: {
            type: "object",
            properties: {
                title: {
                    type: "string",
                    description: "일정 제목"
                },
                date: {
                    type: "string",
                    description: "'오늘', '내일', 또는 'YYYY-MM-DD' 형식의 날짜"
                },
                start_time: {
                    type: "string",
                    description: "HH:MM 형식의 시작 시간"
                },
                end_time: {
                    type: "string",
                    description: "HH:MM 형식의 종료 시간"
                }
            },
            required: ["title", "date", "start_time", "end_time"]
        }
    },
    {
        name: "update_schedule",
        description: "사용자가 기존 일정을 수정하겠다고 **명확하게 요청**했을 때, 기존 일정을 수정합니다.",
        parameters: {
            type: "object",
            properties: {
                id: {
                    type: "integer",
                    description: "수정할 일정의 ID"
                },
                title: {
                    type: "string",
                    description: "새로운 일정 제목"
                },
                start_time: {
                    type: "string",
                    description: "HH:MM 형식의 새로운 시작 시간"
                },
                end_time: {
                    type: "string",
                    description: "HH:MM 형식의 새로운 종료 시간"
                }
            },
            required: ["id"]
        }
    },
    {
        name: "delete_schedule",
        description: "사용자가 일정을 삭제하겠다고 **명확하게 요청**했을 때, 일정을 삭제합니다.",
        parameters: {
            type: "object",
            properties: {
                id: {
                    type: "integer",
                    description: "삭제할 일정의 ID"
                }
            },
            required: ["id"]
        }
    }
];

// 라우터 설정
router.post('/', async (req, res) => {
    // 사용자 인증 처리 (인증되지 않은 경우 테스트용 ID 사용)
    const userId = req.user ? req.user.id : 'testUser@example.com';
    const userMessage = req.body.request;

    try {
        // 대화 기록 불러오기
        let conversationHistory = await getConversationHistory(userId);

        // 시스템 메시지 추가 (최초 대화 시)
        if (conversationHistory.length === 0) {
            conversationHistory.push({
                role: 'system',
                content: `
                    당신은 사용자와 대화를 하는 비서입니다.
                    사용자가 일정 조회, 추가, 수정, 삭제와 관련된 **명확한 요청**을 할 경우에만 해당 기능을 수행하기 위한 함수를 호출하세요.
                    그 외의 경우에는 일반적인 대화를 이어가세요.
                    오늘 날짜는 ${moment().format('YYYY년 MM월 DD일')}입니다.
                `
            });
        }

        // 사용자 메시지 추가
        conversationHistory.push({ role: 'user', content: userMessage });

        // OpenAI API 호출
        const openaiResponse = await openai.createChatCompletion({
            model: 'ft:gpt-4o-mini-2024-07-18:personal::AP5BFzqE', // 사용 중인 모델로 변경하세요
            messages: conversationHistory,
            functions: functions,
            function_call: "auto" // 모델이 필요 시 함수 호출
        });

        const assistantMessage = openaiResponse.data.choices[0].message;

        // 함수 호출 여부 확인
        if (assistantMessage.function_call) {
            const functionName = assistantMessage.function_call.name;
            const functionArgs = JSON.parse(assistantMessage.function_call.arguments);

            // 함수 실행
            let functionResponse;

            if (functionName === 'get_schedule') {
                functionResponse = await getSchedule(functionArgs.date, userId);
            } else if (functionName === 'add_schedule') {
                functionResponse = await addSchedule(functionArgs, userId);
            } else if (functionName === 'update_schedule') {
                functionResponse = await updateSchedule(functionArgs, userId);
            } else if (functionName === 'delete_schedule') {
                functionResponse = await deleteSchedule(functionArgs.id, userId);
            }

            // 대화 기록에 함수 호출 및 결과 추가
            conversationHistory.push({
                role: 'assistant',
                content: null,
                function_call: assistantMessage.function_call
            });
            conversationHistory.push({
                role: 'function',
                name: functionName,
                content: JSON.stringify(functionResponse)
            });

            // 최종 응답 생성
            const finalResponse = await openai.createChatCompletion({
                model: 'ft:gpt-4o-mini-2024-07-18:personal::AP5BFzqE', // 사용 중인 모델로 변경하세요
                messages: conversationHistory,
            });

            const finalAssistantMessage = finalResponse.data.choices[0].message;

            // 대화 기록에 최종 응답 추가
            conversationHistory.push(finalAssistantMessage);

            // 대화 기록 저장
            await saveConversationHistory(userId, conversationHistory);

            // 사용자에게 응답 전송
            res.json({ response: finalAssistantMessage.content });

        } else {
            // 함수 호출이 없을 경우 일반 대화로 처리
            conversationHistory.push(assistantMessage);
            await saveConversationHistory(userId, conversationHistory);
            res.json({ response: assistantMessage.content });
        }

    } catch (error) {
        console.error("Error processing request:", error);
        console.error(error.stack); // 에러 스택 트레이스 출력
        res.status(500).json({ message: "오류가 발생했습니다.", error: error.message });
    }

});

/**
 * @swagger
 * /chat:
 *   post:
 *     summary: 챗봇과의 대화
 *     description: 사용자가 챗봇에게 메시지를 보내고 응답을 받습니다.
 *     tags: [Chatbot]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               request:
 *                 type: string
 *                 description: 사용자의 메시지
 *             required:
 *               - request
 *     responses:
 *       200:
 *         description: 성공적으로 응답을 받았습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   description: 챗봇의 응답 메시지
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */

module.exports = router;
