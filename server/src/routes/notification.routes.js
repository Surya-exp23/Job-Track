import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../../../Real projects/JobTrack/server/src/controllers/notification.controller.js";
import { protect } from "../../../Real projects/JobTrack/server/src/middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getNotifications);
router.patch("/read-all", protect, markAllAsRead);
router.patch("/:id/read", protect, markAsRead);

export default router;
