import express from "express";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import {
  createAnalysis,
  getMyAnalyses,
  getAnalysis,
  deleteAnalysis,
} from "../controllers/resumeAnalysis.controller.js";

const router = express.Router();

router.use(protect, restrictTo("CANDIDATE"));

router.post("/", createAnalysis);
router.get("/", getMyAnalyses);
router.get("/:id", getAnalysis);
router.delete("/:id", deleteAnalysis);

export default router;
