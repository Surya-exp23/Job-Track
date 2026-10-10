import mongoose from "mongoose";
import { Application } from "../models/application.model.js";
import { Job } from "../models/Jobs.model.js";
import { Resume } from "../models/resume.model.js";

const ALL_STATUSES = [
  "APPLIED",
  "SCREENING",
  "SHORTLISTED",
  "INTERVIEW",
  "SELECTED",
  "REJECTED",
  "WITHDRAWN",
];

const RECRUITER_STATUSES = [
  "SCREENING",
  "SHORTLISTED",
  "INTERVIEW",
  "SELECTED",
  "REJECTED",
];



const TERMINAL_STATUSES = ["SELECTED", "REJECTED", "WITHDRAWN"];

const applyJob = async (req, res, next) => {
  try {
    const { jobId, resumeId, notes } = req.body;

    if (!jobId || !resumeId) {
      return res.status(400).json({
        success: false,
        message: "jobId and resumeId are required",
      });
    }

    if (!mongoose.isValidObjectId(jobId) || !mongoose.isValidObjectId(resumeId)) {
      return res.status(404).json({
        success: false,
        message: "Job or resume not found",
      });
    }

    const job = await Job.findById(jobId);

    if (
      !job ||
      job.status !== "ACTIVE" ||
      (job.expiresAt && job.expiresAt <= new Date())
    ) {
      return res.status(400).json({
        success: false,
        message: "This job is not accepting applications",
      });
    }

    
    const resume = await Resume.findOne({ _id: resumeId, userId: req.user.id });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    const existing = await Application.findOne({
      candidateId: req.user.id,
      jobId,
    });

    if (existing) {
      // Withdrawing is reversible: a withdrawn application can be sent again
      if (existing.status === "WITHDRAWN") {
        existing.status = "APPLIED";
        existing.resumeId = resumeId;
        existing.notes = notes?.trim() || undefined;
        existing.appliedAt = new Date();
        existing.timeline.push({ status: "APPLIED", changedAt: new Date() });
        await existing.save();

        return res.status(200).json({
          success: true,
          message: "Application resubmitted successfully",
          data: { application: existing },
        });
      }

      return res.status(409).json({
        success: false,
        message: "You have already applied to this job",
      });
    }

    const application = await Application.create({
      candidateId: req.user.id,
      jobId,
      resumeId,
      notes: notes?.trim() || undefined,
      timeline: [{ status: "APPLIED" }],
    });

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: { application },
    });
  } catch (error) {
    // Race-safe: the unique index is the final guard against double applies
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already applied to this job",
      });
    }
    next(error);
  }
};

const getMyApplications = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = { candidateId: req.user.id };

    if (req.query.status) {
      const status = req.query.status.toUpperCase();

      if (!ALL_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `status must be one of: ${ALL_STATUSES.join(", ")}`,
        });
      }

      filter.status = status;
    }

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "jobId",
          select: "title location employmentType remoteType status",
          populate: { path: "companyId", select: "name logoUrl" },
        })
        .populate({ path: "resumeId", select: "fileName fileUrl" }),
      Application.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        applications,
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

const getJobApplications = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    if (!mongoose.isValidObjectId(jobId)) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }



    const job = await Job.findOne({ _id: jobId, createdBy: req.user.id });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = { jobId: job._id };

    if (req.query.status) {
      const status = req.query.status.toUpperCase();

      if (!ALL_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `status must be one of: ${ALL_STATUSES.join(", ")}`,
        });
      }

      filter.status = status;
    }

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: "candidateId", select: "email" })
        .populate({ path: "resumeId", select: "fileName fileUrl" }),
      Application.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        applications,
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

const getApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const job = await Job.findById(application.jobId).select("createdBy");

    const isCandidate = application.candidateId.toString() === req.user.id;
    const isJobOwner = job && job.createdBy.toString() === req.user.id;

    if (!isCandidate && !isJobOwner) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const full = await Application.findById(id)
      .populate({
        path: "jobId",
        select: "title location employmentType remoteType",
        populate: { path: "companyId", select: "name logoUrl" },
      })
      .populate({ path: "resumeId", select: "fileName fileUrl" })
      .populate({ path: "candidateId", select: "email" });

    return res.status(200).json({
      success: true,
      data: { application: full },
    });
  } catch (error) {
    next(error);
  }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!RECRUITER_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${RECRUITER_STATUSES.join(", ")}`,
      });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const application = await Application.findById(id).populate({
      path: "jobId",
      select: "createdBy",
    });

    if (!application || !application.jobId) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Only the job's owner moves its pipeline
    if (application.jobId.createdBy.toString() !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Terminal states are final and can never be reopened
    if (TERMINAL_STATUSES.includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: `This application is already ${application.status.toLowerCase()}`,
      });
    }

    application.status = status;
    application.timeline.push({
      status,
      note: note?.trim() || undefined,
      changedAt: new Date(),
    });
    await application.save();

    return res.status(200).json({
      success: true,
      message: `Application moved to ${status}`,
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};

const withdrawApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const application = await Application.findOne({
      _id: id,
      candidateId: req.user.id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (TERMINAL_STATUSES.includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: `This application is already ${application.status.toLowerCase()}`,
      });
    }

    
    application.status = "WITHDRAWN";
    application.timeline.push({ status: "WITHDRAWN", changedAt: new Date() });
    await application.save();

    return res.status(200).json({
      success: true,
      message: "Application withdrawn successfully",
    });
  } catch (error) {
    next(error);
  }
};

export {
  applyJob,
  getMyApplications,
  getJobApplications,
  getApplication,
  updateApplicationStatus,
  withdrawApplication,
};
