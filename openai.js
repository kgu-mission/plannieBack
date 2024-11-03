// openai.js
const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

async function generatePlan(userInput) {
  try {
    const messages = [
      { role: "system", content: "You are a helpful assistant for managing schedules. If the message is related to managing schedules, respond only with a JSON command for add, view, update, or delete actions. Otherwise, respond as a normal conversation." },
      { role: "user", content: userInput }
    ];

    const response = await openai.createChatCompletion({
      model: "ft:gpt-4o-mini-2024-07-18:personal::AP5BFzqE",
      messages: messages
    });

    const responseText = response.data.choices[0].message.content;

    // JSON 형식인지 확인 후 파싱
    if (responseText.trim().startsWith("{") && responseText.trim().endsWith("}")) {
      const command = JSON.parse(responseText);
      command.isCalendarCommand = command.action && ["add", "view", "update", "delete"].includes(command.action);
      return command;
    } else {
      return { isCalendarCommand: false };
    }
  } catch (error) {
    console.error("OpenAI 응답에서 JSON 파싱 오류:", error);
    throw error;
  }
}

// 일반 대화 응답 생성 함수
async function generateGeneralResponse(userInput) {
  try {
    const response = await openai.createChatCompletion({
      model: "ft:gpt-4o-mini-2024-07-18:personal::AP5BFzqE",
      messages: [
        { role: "system", content: "You are a friendly assistant for chatting with users." },
        { role: "user", content: userInput }
      ]
    });
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("일반 대화 응답 생성 오류:", error);
    return "죄송합니다. 현재 요청을 처리할 수 없습니다.";
  }
}

module.exports = { generatePlan, generateGeneralResponse };
