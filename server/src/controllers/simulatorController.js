import { careerAdvicePrompt } from '../services/promptTemplates.js';
import { callAI } from '../services/aiService.js';
import Analysis from '../models/Analysis.js';
import mongoose from 'mongoose';
import { waitForMongoConnection } from '../utils/dbReady.js';

export async function simulateCareer(req, res) {
  try {
    const { currentRole, targetRole, experience, skills } = req.body;

    if (!currentRole || !targetRole || !experience) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const prompt = careerAdvicePrompt(currentRole, targetRole, experience);
    const result = await callAI(prompt);

    const canSave = await waitForMongoConnection(3000);
    if (canSave) {
      const analysis = new Analysis({
        userId: req.user.id,
        type: 'simulator',
        input: { currentRole, targetRole, experience, skills },
        result: result,
      });
      try {
        await analysis.save();
      } catch (saveError) {
        console.warn('Failed to save simulator analysis:', saveError.message);
      }
    } else {
      console.warn(`Skipping simulator analysis save: MongoDB not ready (state ${mongoose.connection.readyState}).`);
    }

    res.json({
      success: true,
      simulation: result,
    });
  } catch (error) {
    console.error('Simulator error:', error.message);
    res.status(500).json({ error: error.message });
  }
}
