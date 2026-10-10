import express from "express";
import {
  saveJob,
  getSavedJobs,
  unsaveJob,
} from "../controllers/savedJob.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protect, restrictTo("CANDIDATE"), saveJob);
router.get("/", protect, restrictTo("CANDIDATE"), getSavedJobs);
router.delete("/:jobId", protect, restrictTo("CANDIDATE"), unsaveJob);

export default router;
