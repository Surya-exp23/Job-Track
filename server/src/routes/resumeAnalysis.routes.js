import express from "express";
import { protect, restrictTo } from "../../../Real projects/JobTrack/server/src/middlewares/auth.middleware.js";
import {
  createAnalysis,
  getMyAnalyses,
  getAnalysis,
  deleteAnalysis,
} from "../../../Real projects/JobTrack/server/src/controllers/resumeAnalysis.controller.js";

const router = express.Router();

router.use(protect, restrictTo("CANDIDATE"));

router.post("/", createAnalysis);
router.get("/", getMyAnalyses);
router.get("/:id", getAnalysis);
router.delete("/:id", deleteAnalysis);

export default router;
