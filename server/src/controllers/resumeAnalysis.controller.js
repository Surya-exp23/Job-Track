import mongoose from "mongoose";
import { Resume } from "../models/resume.model.js";
import { ResumeAnalysis } from "../models/resumeAnalysis.model.js";
import { Job } from "../models/Jobs.model.js";
import { extractResumeText } from "../utils/resumeText.js";
import { analyzeResume } from "../utils/groq.js";

const createAnalysis = async (req, res, next) => {
  const { resumeId, jobId } = req.body;

  try {
    if (!resumeId || !mongoose.isValidObjectId(resumeId)) {
      return res.status(400).json({ success: false, message: "A valid resumeId is required" });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user.id });

    if (!resume) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }

    let job = null;

    if (jobId) {
      if (!mongoose.isValidObjectId(jobId)) {
        return res.status(400).json({ success: false, message: "Invalid jobId" });
      }

      job = await Job.findById(jobId);

      if (!job) {
        return res.status(404).json({ success: false, message: "Job not found" });
      }
    }

    resume.parsingStatus = "PROCESSING";
    resume.parsingError = undefined;
    await resume.save();

    const resumeText = await extractResumeText(resume);

    if (!resumeText.trim()) {
      throw new Error("No readable text found in the resume");
    }

    const result = await analyzeResume(resumeText, job);

    const analysis = await ResumeAnalysis.create({
      userId: req.user.id,
      resumeId: resume._id,
      jobId: job?._id,
      ...result,
    });

    resume.parsingStatus = "COMPLETED";
    await resume.save();

    return res.status(201).json({
      success: true,
      message: "Resume analyzed successfully",
      data: { analysis },
    });
  } catch (error) {

    if (resumeId && mongoose.isValidObjectId(resumeId)) {
      await Resume.findOneAndUpdate(
        { _id: resumeId, userId: req.user.id },
        { parsingStatus: "FAILED", parsingError: error.message?.slice(0, 500) }
      ).catch(() => {});
    }
    next(error);
  }
};

const getMyAnalyses = async (req, res, next) => {
  try {
    const filter = { userId: req.user.id };

    if (req.query.resumeId) {
      if (!mongoose.isValidObjectId(req.query.resumeId)) {
        return res.status(400).json({ success: false, message: "Invalid resumeId" });
      }
      filter.resumeId = req.query.resumeId;
    }

    const analyses = await ResumeAnalysis.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Analyses retrieved successfully",
      data: { analyses },
    });
  } catch (error) {
    next(error);
  }
};

const getAnalysis = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: "Analysis not found" });
    }

    const analysis = await ResumeAnalysis.findOne({ _id: id, userId: req.user.id });

    if (!analysis) {
      return res.status(404).json({ success: false, message: "Analysis not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Analysis retrieved successfully",
      data: { analysis },
    });
  } catch (error) {
    next(error);
  }
};

const deleteAnalysis = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: "Analysis not found" });
    }

    const analysis = await ResumeAnalysis.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!analysis) {
      return res.status(404).json({ success: false, message: "Analysis not found" });
    }

    return res.status(200).json({ success: true, message: "Analysis deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export { createAnalysis, getMyAnalyses, getAnalysis, deleteAnalysis };
