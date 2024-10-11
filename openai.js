const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 계획 생성 함수
async function generatePlan(userInput, conversationHistory = []) {
  try {
    // 기존 대화 기록을 포함한 메시지 구성
    const messages = [
      { role: "system", content: "You are a helpful assistant that creates plans." },
      ...conversationHistory,  // 대화 기록 추가
      { role: "user", content: userInput }  // 새로 들어온 사용자 입력 추가
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error generating plan:", error);
    throw error;
  }
}

module.exports = { generatePlan };

