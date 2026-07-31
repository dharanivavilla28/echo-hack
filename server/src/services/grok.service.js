import { generateContent as generateGrokContent } from '../config/grok.config.js';
import { generateGeminiContent } from '../config/gemini.config.js';
import { generateFeatherlessContent } from '../config/featherless.config.js';

export const askGrok = async (messages) => {
  const featherlessKey = process.env.FEATHERLESS_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  // Option 1: Featherless AI (if configured)
  if (featherlessKey && featherlessKey.trim() !== '' && featherlessKey !== 'your_featherless_api_key_here') {
    try {
      console.log('Generating code using Featherless AI...');
      return await generateFeatherlessContent(messages);
    } catch (featherlessError) {
      console.error('Featherless AI Error:', featherlessError.message);
      throw new Error(`Featherless AI Error: ${featherlessError.message}`);
    }
  }

  // Option 2: Google Gemini API (if configured)
  if (geminiKey && geminiKey.trim() !== '' && geminiKey !== 'your_gemini_api_key_here') {
    try {
      console.log('Generating code using Gemini API...');
      return await generateGeminiContent(messages);
    } catch (geminiError) {
      console.error('Gemini API Error:', geminiError.message);
      throw new Error(`Gemini API Error: ${geminiError.message}`);
    }
  }

  // Option 3: xAI Grok
  try {
    console.log('Generating code using xAI Grok API...');
    return await generateGrokContent(messages);
  } catch (error) {
    console.error('Grok API Error:', error.message);
    throw new Error(error.message || 'The AI service is currently unavailable. Please try again later.');
  }
};
