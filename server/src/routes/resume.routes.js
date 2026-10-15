import express from "express";
import {
  uploadResume,
  getMyResumes,
  getResume,
  setDefaultResume,
  deleteResume,
} from "../../../Real projects/JobTrack/server/src/controllers/resume.controller.js";
import { protect, restrictTo } from "../../../Real projects/JobTrack/server/src/middlewares/auth.middleware.js";
import { uploadResumeFile } from "../../../Real projects/JobTrack/server/src/middlewares/upload.middleware.js";

const router = express.Router();

router.use(protect, restrictTo("CANDIDATE"));

router.post("/", uploadResumeFile, uploadResume);
router.get("/", getMyResumes);
router.get("/:id", getResume);
router.patch("/:id/default", setDefaultResume);
router.delete("/:id", deleteResume);

export default router;
