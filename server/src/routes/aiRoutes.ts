import express from "express";
import multer from "multer";
import { analyzeResume, parseResumeFile } from "../controllers/aiController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

const isLocal = process.env.NODE_ENV !== "production";
const skipAuth = isLocal
  ? (_req: any, _res: any, next: any) => next()
  : requireAuth;

// File upload config (10MB max, memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

/**
 * POST /api/ai/analyze
 * Body: { resume: string, jobDescription: string, mode: "match" }
 * Streams thinking steps + final result via SSE
 */
router.post("/analyze", skipAuth, analyzeResume);

/**
 * POST /api/ai/parse-file
 * Multipart form: file (PDF, DOC, TXT)
 * Returns: { text: string }
 */
router.post("/parse-file", skipAuth, upload.single("file"), parseResumeFile);

export default router;
