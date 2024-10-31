// openai/index.js
const axios = require('axios');

async function getOpenAIResponse(userRequest) {
    const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
            model: "gpt-3.5-turbo",
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
