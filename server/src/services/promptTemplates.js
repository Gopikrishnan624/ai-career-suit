// Prompt templates for AI interactions
export const resumeAnalyzerPrompt = (resumeText) => `
Analyze the following resume and provide insights in a clear markdown format.
Include:
- An overall ATS readiness score out of 100
- Top strengths
- Gaps or weak areas
- Missing keywords or role-aligned terms
- Specific action items to improve the resume
- 3 suitable job roles based on the resume

Resume:
${resumeText}
`;

export const resumeChatPrompt = (resumeText, chatHistory, question) => `
You are an expert resume coach. Use the resume and the prior conversation to answer the user's latest question.

Rules:
- Be practical, concise, and specific to the resume.
- If the user asks for improvements, give actionable rewrite suggestions.
- If useful, provide short bullet points.
- Reply in markdown.

Resume:
${resumeText}

Conversation so far:
${chatHistory || 'No previous messages.'}

Latest user question:
${question}
`;

export const jobRecommendationPrompt = (resumeText) => `
Based on the following resume, recommend 5 suitable job opportunities or job titles.

Respond ONLY with valid JSON in this structure:
{
  "recommendations": [
    {
      "title": "string",
      "matchScore": 0,
      "reason": "string",
      "skillsToHighlight": ["string"],
      "nextStep": "string"
    }
  ]
}

Resume:
${resumeText}
`;

export const resumeCreationPrompt = (templateName, answers) => `
Create a polished professional resume in markdown using the selected template style.

Template style:
${templateName}

Candidate answers:
${answers}

Requirements:
- Write a complete resume in markdown
- Include a strong professional summary
- Improve wording while staying truthful to the provided details
- Use impactful achievement-oriented bullet points
- Include sections for contact placeholder, summary, skills, experience, projects, education, and certifications if relevant
- Keep formatting clean and recruiter-friendly
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

export const interviewScoringPrompt = (question, userAnswer) => `
Evaluate the following interview answer.

Question: ${question}
Answer: ${userAnswer}

Respond ONLY with valid JSON in this structure:
{
  "score": 0,
  "maxScore": 10,
  "pointsAwarded": 0,
  "feedback": "string",
  "strengths": ["string"],
  "improvements": ["string"],
  "sampleBetterAnswer": "string"
}

Scoring rules:
- score and pointsAwarded must both be integers from 0 to 10
- reward relevant, structured, confident answers
- penalize vague or incorrect answers
`;
