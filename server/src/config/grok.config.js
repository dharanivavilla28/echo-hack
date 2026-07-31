import axios from 'axios';

const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';
const MODEL_NAME = 'grok-3';

const generateContent = async (messages) => {
  try {
    const response = await axios.post(
      XAI_API_URL,
      {
        model: MODEL_NAME,
        messages,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.XAI_API_KEY}`,
        },
        timeout: 120000,
      }
    );

    const text = response.data.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error('Grok returned an empty response');
    }

    return text;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.error) {
      const details = typeof error.response.data.error === 'string' 
        ? error.response.data.error 
        : error.response.data.error.message || JSON.stringify(error.response.data.error);
      console.error('Grok API Error:', error.response.status, details);
      throw new Error(`Grok API Error (${error.response.status}): ${details}`);
    }
    if (error.response) {
      console.error('Grok API Error:', error.response.status, error.response.data);
      throw new Error(`Grok API failed with status ${error.response.status}`);
    }
    console.error('Grok API Error:', error.message);
    throw new Error(`Grok API failed: ${error.message}`);
  }
};

export { generateContent };
