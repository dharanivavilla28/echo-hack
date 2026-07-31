import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = "gemini-2.5-flash";

const generateGeminiContent = async (messages) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY is not configured in server/.env');
  }

  const ai = new GoogleGenAI({ apiKey });

  // Convert chat messages array into prompt string for Gemini
  let promptText = '';
  if (Array.isArray(messages)) {
    promptText = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
  } else {
    promptText = String(messages);
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: promptText,
    });

    if (!response || !response.text) {
      throw new Error('Gemini returned an empty response');
    }

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    throw new Error(`Gemini API failed: ${error.message}`);
  }
};

export { generateGeminiContent };