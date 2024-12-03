// 필요한 라이브러리 가져오기
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const plannerController = require('../controllers/gpt-plannnerConntroller.js'); // MariaDB와 상호작용하는 일정 관리 컨트롤러
const OpenAI = require('openai');

// OpenAI 설정 및 객체 초기화
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

router.post('/send-message2', async (req, res) => {
    const { senderId, message } = req.body;
    const token = req.headers.authorization?.split(' ')[1]; // Bearer 토큰 형식에서 추출

    if (!message || !senderId || !token) {
        return res.status(400).json({ error: "Message, senderId, and token are required." });
    }

    try {
        // 사용자 입력 파싱 시도
        let requestData = extractDetailsFromNaturalLanguage(message);

        if (!requestData) {
            // 일정 관련 작업을 찾을 수 없는 경우 GPT를 이용해 사용자의 의도를 확인
            const response = await openai.chat.completions.create({
                model: "ft:gpt-4o-mini-2024-07-18:personal::AP5BFzqE",
                messages: [
                    {
                        role: "system",
                        content: `당신은 일정 관리 도우미입니다.
            사용자의 자연어 입력에서 다음 정보를 추출하세요:
            - action: '생성', '조회', '수정', '삭제' 중 하나
            - date: YYYY-MM-DD 형식으로 날짜
            - start_time: HH:mm 형식의 시작 시간
            - end_time: HH:mm 형식의 종료 시간
            - title: 일정을 설명하는 제목
            출력은 JSON 형식으로 반환하세요. 필드가 누락되었을 경우, null을 사용하세요.`,
                    },
                    { role: "user", content: message }
                ],
                max_tokens: 300,
                temperature: 0.5,
            });

            const botReply = response.choices[0]?.message?.content?.trim() || "응답을 생성하지 못했습니다.";
            return res.status(200).json({
                originalReply: botReply,
                parsedData: null
            });
        }

        // 사용자 이메일 추가
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        requestData.userEmail = decodedToken.email;

        // 일정 처리 함수 호출
        const result = await handleGPTRequest(requestData);

        // 응답 데이터를 사용자가 이해할 수 있도록 포맷 변경
        let formattedResult;
        if (requestData.action === '조회' && Array.isArray(result)) {
            formattedResult = result.map((planner, index) =>
                `${index + 1}. ${planner.start_time} ~ ${planner.end_time}: ${planner.title}`
            ).join('\n');
        } else {
            formattedResult = result;
        }

        // GPT 응답과 처리 결과를 모두 반환
        res.status(200).json({
            parsedData: requestData,
            actionResult: formattedResult
        });

    } catch (error) {
        console.error("서버 오류:", error);
        res.status(500).json({ error: "서버 오류가 발생했습니다." });
    }
});

const extractDetailsFromNaturalLanguage = (response) => {
    // 일정 관련 작업(action) 추출
    const actionMatch = response.match(/(생성|조회|수정|삭제|추가)/);
    const action = actionMatch ? actionMatch[1] : null;

    // 날짜 추출 (YYYY.MM.DD 또는 YYYY-MM-DD 형식 또는 'YYYY년 MM월 DD일' 형식)
    const dateMatch = response.match(/(\d{4}[-.]\d{2}[-.]\d{2}|\d{4}년\s?\d{1,2}월\s?\d{1,2}일)/);
    let date = null;
    if (dateMatch) {
        date = dateMatch[1]
            .replace(/년|월/g, '-')
            .replace(/일/g, '')
            .replace(/\s+/g, '')
            .replace(/\./g, '-');
    }

    // 시작 시간 추출 (HH:mm 형식)
    const startTimeMatch = response.match(/(\d{1,2}:\d{2})/);
    const start_time = startTimeMatch ? startTimeMatch[1] : null;

    // 종료 시간 추출 - 자연어에서 종료 시간이 명시된 경우
    const endTimeMatch = response.match(/(\d{1,2}:\d{2})부터\s?(\d{1,2}:\d{2})까지/);
    const end_time = endTimeMatch ? endTimeMatch[2] : null;

    // title 추출
    // 특정 키워드(일정, 스터디, 공부 등) 뒤에 오는 내용에서 조사를 포함한 단어를 제목으로 추출
    const titleMatch = response.match(/(?:생일|스터디|회의|이벤트|작업|공부)\s*([^생성조회수정삭제추가]+?)\s*(?:를|을|에)?\s*(?=생성|조회|수정|삭제|추가)?/);
    const title = titleMatch ? titleMatch[1].trim() : "생일"; // 기본값으로 '일정' 설정

    // 필드가 충분하지 않다면 null을 반환
    if (!action || !date) {
        console.log("필수 필드 중 하나를 찾지 못했습니다. 추출된 데이터:", { action, date, start_time, title });
        return null; // 필요한 필드를 모두 추출하지 못한 경우
    }

    return {
        action,
        date,
        start_time,
        end_time,
        title,
    };
};




// handleGPTRequest 함수 수정
const handleGPTRequest = async (data) => {
    const { action, date, title, start_time, end_time, userEmail, id, memo, notification, repeat, check_box, url } = data;

    if (action === "생성" || action === "수정") {
        if (!title) {
            throw new Error("일정 제목이 필요합니다.");
        }
    }

    switch (action) {
        case "생성":
            return await plannerController.createPlanner({ start_day: date, end_day: date, title, start_time, end_time, userEmail });

        case "조회":
            const planners = await plannerController.getPlannersByDate({ query: { date }, user: { email: userEmail } });
            return planners.map(planner => ({
                start_time: planner.start_time,
                end_time: planner.end_time,
                title: planner.title
            }));

        case "수정":
            return await plannerController.updatePlannerById({
                params: { id },
                body: { start_day: date, end_day: date, title, start_time, end_time, memo, notification, repeat, check_box, url },
                user: { email: userEmail }
            });

        case "삭제":
            return await plannerController.deletePlannerById({ params: { id }, user: { email: userEmail } });

        case "월간 조회":
            const [year, month] = date.split('-');
            return await plannerController.getPlannersByMonth({ query: { year, month }, user: { email: userEmail } });

        default:
            return { error: "알 수 없는 요청 유형입니다." };
    }
};

module.exports = router;
