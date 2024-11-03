// openai.js
const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function generatePlan(userInput) {
  try {
    const messages = [
      { role: "system", content: "You are a helpful assistant for managing schedules. Respond only with a JSON command." },
      { role: "user", content: userInput }
    ];

    const response = await openai.chat.completions.create({
      model: "ft:gpt-4o-mini-2024-07-18:personal::AP5BFzqE",
      messages: messages
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("OpenAI 응답에서 JSON 파싱 오류:", error);
    throw error;
  }
}

module.exports = { generatePlan };
