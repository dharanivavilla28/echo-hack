import axios from 'axios';

const FEATHERLESS_API_URL = 'https://api.featherless.ai/v1/chat/completions';
const DEFAULT_MODEL = 'Qwen/Qwen2.5-Coder-32B-Instruct';

const generateFeatherlessContent = async (messages) => {
  const apiKey = process.env.FEATHERLESS_API_KEY;
  if (!apiKey || apiKey === 'your_featherless_api_key_here') {
    throw new Error('FEATHERLESS_API_KEY is not configured in server/.env');
  }

  const modelName = process.env.FEATHERLESS_MODEL || DEFAULT_MODEL;

  try {
    const response = await axios.post(
      FEATHERLESS_API_URL,
      {
        model: modelName,
        messages: Array.isArray(messages) ? messages : [{ role: 'user', content: String(messages) }],
        temperature: 0.7,
        max_tokens: 4096,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 120000,
      }
    );

    const text = response.data.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error('Featherless AI returned an empty response');
    }

    return text;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.error) {
      const details = typeof error.response.data.error === 'string'
        ? error.response.data.error
        : error.response.data.error.message || JSON.stringify(error.response.data.error);
      console.error('Featherless API Error:', error.response.status, details);
      throw new Error(`Featherless API Error (${error.response.status}): ${details}`);
    }
    if (error.response) {
      console.error('Featherless API Error:', error.response.status, error.response.data);
      throw new Error(`Featherless API failed with status ${error.response.status}`);
    }
    console.error('Featherless API Error:', error.message);
    throw new Error(`Featherless API failed: ${error.message}`);
  }
};

export { generateFeatherlessContent };
