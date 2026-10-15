import express from "express";
import {
  createJob,
  getJobs,
  getMyJobs,
  getMyJob,
  getJob,
  updateJob,
  deleteJob,
} from "../controllers/job.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getJobs);
// /mine comes before /:id, otherwise "mine" is read as a job id
router.get("/mine", protect, getMyJobs);
router.get("/mine/:id", protect, getMyJob);
router.get("/:id", getJob);
router.post("/", protect, restrictTo("RECRUITER"), createJob);
router.patch("/:id", protect, updateJob);
router.delete("/:id", protect, deleteJob);

export default router;
