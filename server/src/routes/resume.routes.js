import express from "express";
import {
  uploadResume,
  getMyResumes,
  getResume,
  setDefaultResume,
  deleteResume,
} from "../controllers/resume.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import { uploadResumeFile } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.use(protect, restrictTo("CANDIDATE"));

router.post("/", uploadResumeFile, uploadResume);
router.get("/", getMyResumes);
router.get("/:id", getResume);
router.patch("/:id/default", setDefaultResume);
router.delete("/:id", deleteResume);

export default router;
