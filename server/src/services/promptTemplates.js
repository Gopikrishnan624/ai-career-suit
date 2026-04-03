// Prompt templates for AI interactions
export const resumeAnalyzerPrompt = (resumeText) => `
Analyze the following resume and provide insights in a clear bullet list format.
Include strengths, weaknesses, keyword recommendations, and high-level action items.

Resume:
${resumeText}
`;


export const careerAdvicePrompt = (currentRole, targetRole, experience) => `
Based on the following information, provide career advice in JSON format:
- Current Role: ${currentRole}
- Target Role: ${targetRole}
- Years of Experience: ${experience}

Respond with JSON containing:
- skills: array of skills to develop
- learningPath: array of recommended learning steps
- timeline: string describing transition timeline
- opportunities: array of opportunities
- obstacles: array of potential obstacles with solutions

Respond ONLY with valid JSON, no other text.
`;

export const interviewPrepPrompt = (jobDescription, userBackground) => `
Prepare interview questions based on:
- Job Description: ${jobDescription}
- Candidate Background: ${userBackground}

Respond with JSON containing:
- questions: array of 5 interview question objects, each with {question: string, difficulty: string}
- tips: array of interview tips
- keyTopics: array of topics likely to be discussed

Respond ONLY with valid JSON, no other text.
`;
