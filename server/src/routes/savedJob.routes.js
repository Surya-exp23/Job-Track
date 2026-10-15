import express from "express";
import {
  saveJob,
  getSavedJobs,
  unsaveJob,
} from "../../../Real projects/JobTrack/server/src/controllers/savedjob.controller.js";
import { protect, restrictTo } from "../../../Real projects/JobTrack/server/src/middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protect, restrictTo("CANDIDATE"), saveJob);
router.get("/", protect, restrictTo("CANDIDATE"), getSavedJobs);
router.delete("/:jobId", protect, restrictTo("CANDIDATE"), unsaveJob);

export default router;
