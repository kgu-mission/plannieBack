// openai.js
const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

async function generatePlan(userInput) {
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant that manages schedules. ..." },
        { role: "user", content: userInput }
      ],
      temperature: 0.7
    });

    const responseText = response.data.choices[0].message.content;
    console.log("OpenAI Response:", responseText); // OpenAI의 원본 응답 확인

    if (responseText.trim().startsWith("{") && responseText.trim().endsWith("}")) {
      const command = JSON.parse(responseText);
      command.isCalendarCommand = ["add", "view", "update", "delete"].includes(command.action);
      console.log("Parsed Command:", command); // 파싱된 명령어 확인
      return command;
    } else {
      console.log("General conversation detected.");
      return { isCalendarCommand: false };
    }
  } catch (error) {
    console.error("Error parsing OpenAI response:", error);
    return { isCalendarCommand: false, error: "Parsing error" };
  }
}

module.exports = { generatePlan };
