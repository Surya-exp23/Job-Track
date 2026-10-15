import express from "express";
import {
  createCompany,
  getCompanies,
  getCompany,
  updateCompany,
  deleteCompany,
} from "../controllers/company.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getCompanies);
router.get("/:id", getCompany);
router.post("/", protect, restrictTo("RECRUITER"), createCompany);
router.patch("/:id", protect, updateCompany);
router.delete("/:id", protect, deleteCompany);

export default router;
