import express from "express";
import { getMyProfile, updateMyProfile } from "../../../Real projects/JobTrack/server/src/controllers/profile.controller.js";
import { protect } from "../../../Real projects/JobTrack/server/src/middlewares/auth.middleware.js";

const router = express.Router();

router.get("/me", protect, getMyProfile);
router.patch("/me", protect, updateMyProfile);

export default router;
