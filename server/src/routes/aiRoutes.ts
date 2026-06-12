import express from "express";
import { analyzeResume } from "../controllers/aiController.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

const isLocal = process.env.NODE_ENV !== "production";

/**
 * POST /api/ai/analyze
 * Body: { resume: string, jobDescription?: string, mode: "match" | "review" }
 * Returns: AI analysis with streaming-style chunked response
 */
router.post(
  "/analyze",
  isLocal ? (_req: any, _res: any, next: any) => next() : requireAuth,
  analyzeResume,
);

export default router;
