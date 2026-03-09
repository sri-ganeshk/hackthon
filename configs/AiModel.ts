import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY ?? '';
const genAI = new GoogleGenerativeAI(apiKey);

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: 'application/json' as const,
};

const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/** AI model for generating course outlines */
export const courseOutlineAIModel = model.startChat({
  generationConfig,
  history: [
    {
      role: 'user',
      parts: [
        {
          text:
            'Generate a study material for the provided content which includes both user input and extracted PDF content. ' +
            'Enhance the response with additional chapters or topics if required. ' +
            'The study material should include: a course title, a summary of the course, and a list of chapters. ' +
            'Each chapter must include a chapter title, a chapter summary, an emoji icon, and a list of topics in JSON format. ' +
            'If the PDF content suggests more detailed topics or additional chapters, please include them.',
        },
      ],
    },
    {
      role: 'model',
      parts: [
        {
          text:
            '```json\n' +
            '{\n' +
            '  "courseSummary": "This course offers an enhanced and comprehensive study material.",\n' +
            '  "chapters": [\n' +
            '    {\n' +
            '      "chapterTitle": "Introduction",\n' +
            '      "chapterSummary": "An overview of the course.",\n' +
            '      "emoji": "📖",\n' +
            '      "topics": ["Course Overview", "Objectives"]\n' +
            '    }\n' +
            '  ]\n' +
            '}\n' +
            '```',
        },
      ],
    },
  ],
});
