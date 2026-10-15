import express from "express";
import {
  applyJob,
  getMyApplications,
  getJobApplications,
  getApplication,
  updateApplicationStatus,
  withdrawApplication,
} from "../controllers/application.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protect, restrictTo("CANDIDATE"), applyJob);
router.get("/mine", protect, getMyApplications);
router.get("/job/:jobId", protect, restrictTo("RECRUITER"), getJobApplications);
// /mine and /job/:jobId sit above /:id so they aren't read as ids
router.get("/:id", protect, getApplication);
router.patch("/:id", protect, restrictTo("RECRUITER"), updateApplicationStatus);
router.delete("/:id", protect, restrictTo("CANDIDATE"), withdrawApplication);

export default router;
