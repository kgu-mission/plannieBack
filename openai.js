// openai.js
const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 계획 생성 및 명령어 분석 함수
async function generatePlan(userInput, conversationHistory = []) {
  try {
    // 대화 히스토리와 함께 사용자 입력 추가
    const messages = [
      { role: "system", content: "You are a helpful assistant that helps create, view, update, and delete plans. Please respond only in JSON format." },
      ...conversationHistory,  // 기존 대화 기록 추가
      { role: "user", content: userInput }  // 사용자 입력 추가
    ];

    const response = await openai.chat.completions.create({
      model: "ft:gpt-4o-mini-2024-07-18:personal::AP5BFzqE",
      messages: messages,
    });

    // OpenAI 응답에서 JSON 형식의 명령어만 추출
    const jsonResponse = response.choices[0].message.content;

    try {
      const parsedCommand = JSON.parse(jsonResponse);
      return parsedCommand; // JSON으로 파싱된 명령어 반환
    } catch (error) {
      console.error("JSON 파싱 오류:", error);
      throw new Error("OpenAI 응답에서 JSON 형식을 찾을 수 없습니다.");
    }
  } catch (error) {
    console.error("계획 생성 중 오류 발생:", error);
    throw error;
  }
}

module.exports = { generatePlan };
