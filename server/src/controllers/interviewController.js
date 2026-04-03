import { interviewPrepPrompt } from '../services/promptTemplates.js';
import { callAI } from '../services/aiService.js';
import Analysis from '../models/Analysis.js';
import mongoose from 'mongoose';
import { waitForMongoConnection } from '../utils/dbReady.js';

function normalizeQuestions(aiResult) {
  if (!aiResult) return [];

  if (Array.isArray(aiResult.questions)) {
    return aiResult.questions
      .map((item) => (typeof item === 'string' ? item : item?.question))
      .filter((q) => typeof q === 'string' && q.trim().length > 0);
  }

  if (typeof aiResult.text === 'string') {
    return aiResult.text.split('\n').map((q) => q.trim()).filter(Boolean);
  }

  if (typeof aiResult === 'string') {
    return aiResult.split('\n').map((q) => q.trim()).filter(Boolean);
  }

  return [];
}

export async function generateQuestions(req, res) {
  try {
    const { jobDescription, userBackground } = req.body;

    if (!jobDescription || !userBackground) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const prompt = interviewPrepPrompt(jobDescription, userBackground);
    const result = await callAI(prompt);
    const normalizedQuestions = normalizeQuestions(result);

    if (normalizedQuestions.length === 0) {
      return res.status(502).json({
        error: 'AI returned an unexpected format for interview questions. Please try again.',
      });
    }

    const canSave = await waitForMongoConnection(3000);
    if (canSave) {
      const analysis = new Analysis({
        userId: req.user.id,
        type: 'interview',
        input: { jobDescription, userBackground },
        result: result,
      });
      try {
        await analysis.save();
      } catch (saveError) {
        console.warn('Failed to save interview analysis:', saveError.message);
      }
    } else {
      console.warn(`Skipping interview analysis save: MongoDB not ready (state ${mongoose.connection.readyState}).`);
    }

    res.json({
      success: true,
      questions: normalizedQuestions,
      raw: result,
    });
  } catch (error) {
    console.error('Interview generation error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function scoreAnswer(req, res) {
  try {
    const { question, userAnswer } = req.body;

    if (!question || !userAnswer) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const scoringPrompt = `
      Score the following interview answer on a scale of 1-10.
      Question: ${question}
      Answer: ${userAnswer}

      Provide:
      1. Score (1-10)
      2. Feedback
      3. Suggestions for improvement
    `;

    const result = await callAI(scoringPrompt);

    res.json({
      success: true,
      feedback: result,
    });
  } catch (error) {
    console.error('Answer scoring error:', error);
    res.status(500).json({ error: error.message });
  }
}
