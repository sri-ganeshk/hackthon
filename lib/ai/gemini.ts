import { GoogleGenerativeAI } from '@google/generative-ai';

let genAIInstance: GoogleGenerativeAI | null = null;

/** Get singleton Google Generative AI client */
export function getGeminiClient(): GoogleGenerativeAI {
  if (!genAIInstance) {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not defined');
    }
    genAIInstance = new GoogleGenerativeAI(apiKey);
  }
  return genAIInstance;
}

/** Get a Gemini generative model */
export function getGeminiModel(modelName = 'gemini-1.5-flash') {
  return getGeminiClient().getGenerativeModel({ model: modelName });
}
