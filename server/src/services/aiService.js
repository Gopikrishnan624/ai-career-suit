import { Groq } from "groq-sdk";

let groq = null;

function getGroqClient() {
  if (!groq) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not set in environment variables');
    }
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groq;
}

export const callAI = async (prompt) => {
  try {
    const client = getGroqClient();

    console.log('Calling Groq API with model: openai/gpt-oss-120b');
    
    const response = await client.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "openai/gpt-oss-120b",
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
    });

    const content = response.choices[0].message.content;
    console.log('Groq response received, length:', content.length);
    
    // Try to parse as JSON, otherwise return as text
    try {
      return JSON.parse(content);
    } catch {
      // If not JSON, return the text content
      return { text: content };
    }
  } catch (error) {
    console.error('Groq API Error:', error.response?.data ?? error.message);
    
    // Provide user-friendly error message
    const status = error.response?.status || error.status;
    const apiError = error.response?.data?.error;

    if (status === 429) {
      throw new Error('API rate limit exceeded. Please try again in a few moments.');
    } else if (status === 401 || status === 403) {
      throw new Error('Invalid Groq API key. Please check your configuration.');
    } else if (status === 400) {
      let message = 'Invalid request to AI service. Please try again with different input.';
      if (apiError?.message) {
        message = `Bad request: ${apiError.message}`;
      }
      throw new Error(message);
    }
    
    throw error;
  }
};
