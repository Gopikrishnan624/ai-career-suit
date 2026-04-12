import express from "express";
import { simulateCareer } from "../controllers/simulatorController.js";
import { generateQuestions, scoreAnswer } from "../controllers/interviewController.js";
import {
  analyzeResume,
  chatWithResume,
  createResume,
  recommendJobs,
} from "../controllers/resumeController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import Analysis from "../models/Analysis.js";

const router = express.Router();

// All AI routes require authentication
router.use(authMiddleware);

// Resume route using in-memory upload and shared controller
router.post("/resume", upload.single("resume"), analyzeResume);
router.post("/resume/chat", chatWithResume);
router.post("/resume/recommend-jobs", recommendJobs);
router.post("/resume/create", createResume);

// Career simulator routes
router.post("/simulator", simulateCareer);

// Interview routes
router.post("/interview/generate", generateQuestions);
router.post("/interview/score", scoreAnswer);

// Get user's past analyses
router.get("/analyses", async (req, res) => {
  try {
    const analyses = await Analysis.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
