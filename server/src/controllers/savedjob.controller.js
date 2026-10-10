import mongoose from "mongoose";
import { SavedJob } from "../models/savedJob.model.js";
import { Job } from "../models/Jobs.model.js";

const saveJob = async (req, res, next) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "jobId is required",
      });
    }

    if (!mongoose.isValidObjectId(jobId)) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const job = await Job.findById(jobId).select("_id");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const existing = await SavedJob.findOne({ userId: req.user.id, jobId });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Job is already in your saved list",
      });
    }

    const savedJob = await SavedJob.create({
      userId: req.user.id,
      jobId,
    });

    return res.status(201).json({
      success: true,
      message: "Job saved successfully",
      data: { savedJob },
    });
  } catch (error) {
    // Race-safe: the unique index is the final guard against double saves
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Job is already in your saved list",
      });
    }
    next(error);
  }
};

const getSavedJobs = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = { userId: req.user.id };

    const [savedJobs, total] = await Promise.all([
      SavedJob.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "jobId",
          select: "title location employmentType remoteType status",
          populate: { path: "companyId", select: "name logoUrl" },
        }),
      SavedJob.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        savedJobs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const unsaveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    if (!mongoose.isValidObjectId(jobId)) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }


    await SavedJob.deleteOne({ userId: req.user.id, jobId });

    return res.status(200).json({
      success: true,
      message: "Job removed from your saved list",
    });
  } catch (error) {
    next(error);
  }
};

export { saveJob, getSavedJobs, unsaveJob };
