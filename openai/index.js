// openai/index.js
const axios = require('axios');

async function getOpenAIResponse(userRequest) {
    const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
            model: "ft:gpt-4o-mini-2024-07-18:personal::ANrGXQKs",
            messages: [{ role: "user", content: userRequest }]
        },
        {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        }
    );
    return response.data.choices[0].message.content;
}

module.exports = { getOpenAIResponse };
