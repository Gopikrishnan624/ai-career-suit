import {
  jobRecommendationPrompt,
  resumeAnalyzerPrompt,
  resumeChatPrompt,
  resumeCreationPrompt,
} from '../services/promptTemplates.js';
import { callAI } from '../services/aiService.js';
import Analysis from '../models/Analysis.js';
import { extractTextFromPDF } from '../utils/pdfParser.js';
import mongoose from 'mongoose';
import { waitForMongoConnection } from '../utils/dbReady.js';

function formatChatHistory(messages = []) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return '';
  }

  return messages
    .filter((message) => message?.role && message?.content)
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join('\n');
}

export async function analyzeResume(req, res) {
  try {
    console.log('Resume upload started');
    
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!req.user) {
      console.log('No user in request');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    console.log('File received:', req.file.originalname, 'Size:', req.file.size);

    const resumeText = await extractTextFromPDF(req.file.buffer);
    console.log('Text extracted, length:', resumeText.length);

    const prompt = resumeAnalyzerPrompt(resumeText);
    console.log('Calling AI API...');
    const result = await callAI(prompt);
    console.log('AI response received:', typeof result);

    const analysis = new Analysis({
      userId: req.user.id,
      type: 'resume',
      input: resumeText.substring(0, 500),
      result: JSON.stringify(result),
    });

    const canSave = await waitForMongoConnection(3000);
    if (canSave) {
      try {
        await analysis.save();
        console.log('Analysis saved to database');
      } catch (saveError) {
        console.warn('Failed to save analysis to database:', saveError.message);
      }
    } else {
      console.warn(`Skipping analysis save: MongoDB not ready (state ${mongoose.connection.readyState}).`);
    }

    res.json({
      success: true,
      resumeText,
      analysis: result,
    });
  } catch (error) {
    console.error('Resume analysis error:', error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message, code: error.code });
    }

    if (error.message && error.message.includes('Unable to extract text from PDF')) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

export async function chatWithResume(req, res) {
  try {
    const { resumeText, messages, question } = req.body;

    if (!resumeText || !question) {
      return res.status(400).json({ error: 'resumeText and question are required' });
    }

    const prompt = resumeChatPrompt(resumeText, formatChatHistory(messages), question);
    const result = await callAI(prompt);

    res.json({
      success: true,
      reply: result,
    });
  } catch (error) {
    console.error('Resume chat error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

export async function recommendJobs(req, res) {
  try {
    const { resumeText } = req.body;

    if (!resumeText) {
      return res.status(400).json({ error: 'resumeText is required' });
    }

    const prompt = jobRecommendationPrompt(resumeText);
    const result = await callAI(prompt);

    res.json({
      success: true,
      recommendations: result?.recommendations || [],
      raw: result,
    });
  } catch (error) {
    console.error('Job recommendation error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

export async function createResume(req, res) {
  try {
    const { templateName, answers } = req.body;

    if (!templateName || !answers) {
      return res.status(400).json({ error: 'templateName and answers are required' });
    }

    const prompt = resumeCreationPrompt(templateName, answers);
    const result = await callAI(prompt);

    res.json({
      success: true,
      resume: result,
    });
  } catch (error) {
    console.error('Resume creation error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
