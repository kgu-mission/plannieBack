require('dotenv').config();
const OpenAI = require('openai');
const moment = require('moment');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


async function generatePlan(userInput) {
    try {
        // OpenAI API 호출
        const response = await openai.chat.completions.create({
            model: "ft:gpt-4o-mini-2024-07-18:personal::AP5BFzqE",
            messages: [
                {
                    role: "system",
                    content: `
          당신은 일정을 관리하는 유용한 도우미입니다.
          사용자의 요청에 따라 오직 JSON 형식의 명령만 반환하십시오.

          - 일정을 조회할 경우 {"action": "조회", "date": "YYYY-MM-DD"} 형식으로 응답하십시오.
          - 일정을 추가할 경우 {"action": "생성", "date": "YYYY-MM-DD", "time": "HH:mm", "description": "이벤트 상세"} 형식으로 응답하십시오.
          - 일정을 수정할 경우 {"action": "수정", "date": "YYYY-MM-DD", "time": "HH:mm", "description": "수정된 이벤트 상세"} 형식으로 응답하십시오.
          - 일정을 삭제할 경우 {"action": "삭제", "date": "YYYY-MM-DD", "time": "HH:mm"} 형식으로 응답하십시오.
          예시 응답:
          {"action": "생성", "date": "YYYY-MM-DD", "time": "HH:mm", "description": "이벤트 상세"}
          {"action": "생성", "date": "YYYY-MM-DD", "time": "HH:mm", "description": "추가 이벤트"}

          이 JSON 형식 외의 텍스트는 추가하지 마십시오. 날짜는 "YYYY-MM-DD", 시간은 "HH:mm" 형식으로 유지하십시오.
          `
                },
                { role: "user", content: userInput }
            ],
            temperature: 0.5 // 낮은 온도로 더 일관된 응답 유도
        });

        const responseText = response.choices[0].message.content;
        console.log("OpenAI 응답:", responseText);

        // 여러 JSON 객체가 연속으로 반환되었을 때 각 객체를 분리하고 개별 파싱
        const commandArray = responseText
            .split('\n') // 개행으로 구분된 각 JSON 객체를 분리
            .map(item => {
                try {
                    return JSON.parse(item);
                } catch (error) {
                    console.error("JSON 파싱 오류:", error);
                    return null;
                }
            })
            .filter(item => item !== null); // 유효한 JSON 객체만 필터링


        // 각 명령에 대해 isCalendarCommand 설정
        commandArray.forEach(command => {
            command.isCalendarCommand = ["생성", "조회", "수정", "삭제"].includes(command.action);

            // 날짜 변환
            if (command.date === "오늘") {
                command.date = moment().format("YYYY-MM-DD");
            } else if (command.date === "내일") {
                command.date = moment().add(1, 'days').format("YYYY-MM-DD");
            }
        });

        console.log("파싱된 명령어들:", commandArray);
        return commandArray;
    } catch (error) {
        console.error("OpenAI 요청 오류:", error);
        return { isCalendarCommand: false, error: "요청 오류" };
    }
}

module.exports = { generatePlan };
