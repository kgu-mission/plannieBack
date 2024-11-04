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
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
          You are a helpful assistant that manages schedules. 
          If the user requests to view, add, update, or delete a schedule, respond with a structured JSON command only. 
          Use the format {"action": "조회", "date": "YYYY-MM-DD"} for schedule-related commands.`
        },
        { role: "user", content: userInput }
      ],
      temperature: 0.7
    });

    const responseText = response.choices[0].message.content;
    console.log("OpenAI Response:", responseText);

    // JSON 형식인지 확인 후 파싱 시도
    let command;
    try {
      command = JSON.parse(responseText);
    } catch (error) {
      console.error("JSON 파싱 오류:", error);
      return { isCalendarCommand: false, error: "Parsing error" };
    }

    // 일정 관련 명령어 여부를 검사
    command.isCalendarCommand = ["생성", "조회", "수정", "삭제"].includes(command.action);

    // 날짜 변환: '오늘', '내일'을 실제 날짜로 변환
    if (command.date === "오늘") {
      command.date = moment().format("YYYY-MM-DD");
    } else if (command.date === "내일") {
      command.date = moment().add(1, 'days').format("YYYY-MM-DD");
    }

    console.log("Parsed Command:", command);
    return command;
  } catch (error) {
    console.error("OpenAI 요청 오류:", error);
    return { isCalendarCommand: false, error: "Request error" };
  }
}

module.exports = { generatePlan };
