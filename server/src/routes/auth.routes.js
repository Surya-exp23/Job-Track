import express from "express";
import {
  register,
  verifyEmail,
  resendOtp,
  login,
  refresh,
  logout,
  getMe,
} from "../../../Real projects/JobTrack/server/src/controllers/auth.controller.js";
import { protect } from "../../../Real projects/JobTrack/server/src/middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", protect, getMe);

export default router;
