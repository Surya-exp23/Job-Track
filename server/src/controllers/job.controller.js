import mongoose from "mongoose";
import{ job} from "../models/job.model.js";
import {company} from "../models/company.model.js";
import {Application} from "../models/application.model.js";


const REMOTE_TYPES = ["Remote", "On-site", "Hybrid"];
const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];
const EXPERIENCE_LEVELS = ["Entry-level", "Junior", "Mid-level", "Senior-level", "Lead"];
const JOB_STATUSES = ["Open", "Closed", "Paused","Expired"];
const SALARY_PERIODS = ["Hourly", "Weekly", "Monthly", "Yearly"];


const UPDATABLE_FIELDS = [
    "title",
    "description",
    "companyId",
    "location",
    "remoteType",
    "employmentType",
    "experienceLevel",
    "skills",
    "salary",
    "status",
    "expiresAt",
];

const COMPANY_PUBLLIC_FIELDS = "name logoUrl location industry";

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeSkills = (skills) => {
    if(!Array.isArray(skills)){
        return [...new Set(skills.map((s)=> s.trim().toLowerCase()).filter(Boolean))];
    }
};


const validateSalary = (salary)=>{
    if(salary.period && !SALARY_PERIODS.includes(salary.period)){
        return `salary.period must be one of the following: ${SALARY_PERIODS.join(", ")}`;
    }

    if(salary.min !==undefined && salary.min<0){
        return "salary.min cannot be negative";
    }
    if(salary.max !==undefined && salary.max<0){
        return "salary.max cannot be negative";
    }
    if(
        salary.min !==undefined &&
        salary.max !==undefined &&
        salary.min > salary.max
    ){
        return "salary.min cannot be greater than salary.max";
    }
    return null;
};

// create a new job posting

const createJob = async (req, res, next) => {
  try {
    const {
      title,
      description,
      companyId,
      location,
      remoteType,
      employmentType,
      experienceLevel,
      skills,
      salary,
      status,
      expiresAt,
    } = req.body;

    if (!title?.trim() || !description?.trim() || !companyId || !employmentType) {
      return res.status(400).json({
        success: false,
        message: "title, description, companyId and employmentType are required",
      });
    }

    if (remoteType && !REMOTE_TYPES.includes(remoteType)) {
      return res.status(400).json({
        success: false,
        message: `remoteType must be one of: ${REMOTE_TYPES.join(", ")}`,
      });
    }

    if (!EMPLOYMENT_TYPES.includes(employmentType)) {
      return res.status(400).json({
        success: false,
        message: `employmentType must be one of: ${EMPLOYMENT_TYPES.join(", ")}`,
      });
    }

    if (experienceLevel && !EXPERIENCE_LEVELS.includes(experienceLevel)) {
      return res.status(400).json({
        success: false,
        message: `experienceLevel must be one of: ${EXPERIENCE_LEVELS.join(", ")}`,
      });
    }

    if (status && !JOB_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${JOB_STATUSES.join(", ")}`,
      });
    }

    if (salary) {
      const salaryError = validateSalary(salary);
      if (salaryError) {
        return res.status(400).json({ success: false, message: salaryError });
      }
    }

    let parsedExpiresAt;
    if (expiresAt) {
      parsedExpiresAt = new Date(expiresAt);
      if (isNaN(parsedExpiresAt.getTime())) {
        return res.status(400).json({
          success: false,
          message: "expiresAt must be a valid date",
        });
      }
    }

    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // A recruiter can only post jobs under their own company
    if (company.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only post jobs for companies you created",
      });
    }

    const job = await Job.create({
      title: title.trim(),
      description: description.trim(),
      companyId,
      createdBy: req.user.id,
      location: location?.trim(),
      remoteType,
      employmentType,
      experienceLevel,
      skills: normalizeSkills(skills),
      salary: salary
        ? {
            min: salary.min,
            max: salary.max,
            currency: salary.currency?.trim(),
            period: salary.period,
          }
        : undefined,
      // Recruiter-posted jobs are always marked as such; the client can't fake this
      source: { type: "RECRUITER" },
      status,
      expiresAt: parsedExpiresAt,
    });

    await job.populate("companyId", COMPANY_PUBLIC_FIELDS);

    return res.status(201).json({
      success: true,
      message: "Job posted successfully",
      data: { job },
    });
  } catch (error) {
    next(error);
  }
};


const getJobs = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const now = new Date();

    // Public listing only shows live jobs: active and not expired
    const and = [
      { status: "ACTIVE" },
      { $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] },
    ];

    if (req.query.q?.trim()) {
      const q = { $regex: escapeRegExp(req.query.q.trim()), $options: "i" };
      and.push({ $or: [{ title: q }, { description: q }] });
    }

    if (req.query.location?.trim()) {
      and.push({
        location: { $regex: escapeRegExp(req.query.location.trim()), $options: "i" },
      });
    }

    if (req.query.remoteType) {
      if (!REMOTE_TYPES.includes(req.query.remoteType)) {
        return res.status(400).json({
          success: false,
          message: `remoteType must be one of: ${REMOTE_TYPES.join(", ")}`,
        });
      }
      and.push({ remoteType: req.query.remoteType });
    }

    if (req.query.employmentType) {
      if (!EMPLOYMENT_TYPES.includes(req.query.employmentType)) {
        return res.status(400).json({
          success: false,
          message: `employmentType must be one of: ${EMPLOYMENT_TYPES.join(", ")}`,
        });
      }
      and.push({ employmentType: req.query.employmentType });
    }

    if (req.query.experienceLevel) {
      if (!EXPERIENCE_LEVELS.includes(req.query.experienceLevel)) {
        return res.status(400).json({
          success: false,
          message: `experienceLevel must be one of: ${EXPERIENCE_LEVELS.join(", ")}`,
        });
      }
      and.push({ experienceLevel: req.query.experienceLevel });
    }

    if (req.query.skills?.trim()) {
      const skills = req.query.skills
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      if (skills.length) and.push({ skills: { $in: skills } });
    }

    if (req.query.companyId) {
      if (!mongoose.isValidObjectId(req.query.companyId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid companyId",
        });
      }
      and.push({ companyId: req.query.companyId });
    }

    if (req.query.minSalary) {
      const minSalary = parseFloat(req.query.minSalary);
      if (isNaN(minSalary) || minSalary < 0) {
        return res.status(400).json({
          success: false,
          message: "minSalary must be a positive number",
        });
      }
      and.push({ "salary.max": { $gte: minSalary } });
    }

    const filter = { $and: and };

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate("companyId", COMPANY_PUBLIC_FIELDS)
        .sort({ postedAt: -1 })
        .skip(skip)
        .limit(limit),
      Job.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        jobs,
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




const getMyJobs = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = { createdBy: req.user.id };

    if (req.query.status) {
      if (!JOB_STATUSES.includes(req.query.status)) {
        return res.status(400).json({
          success: false,
          message: `status must be one of: ${JOB_STATUSES.join(", ")}`,
        });
      }
      filter.status = req.query.status;
    }

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate("companyId", COMPANY_PUBLIC_FIELDS)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Job.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        jobs,
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

const getMyJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // createdBy in the query doubles as the ownership check
    const job = await Job.findOne({
      _id: id,
      createdBy: req.user.id,
    }).populate("companyId", COMPANY_PUBLIC_FIELDS);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: { job },
    });
  } catch (error) {
    next(error);
  }
};

const getJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const job = await Job.findById(id).populate(
      "companyId",
      COMPANY_PUBLIC_FIELDS
    );

    // Drafts and expired jobs stay invisible to the public
    if (!job || job.status !== "ACTIVE" || (job.expiresAt && job.expiresAt <= new Date())) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: { job },
    });
  } catch (error) {
    next(error);
  }
};

const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const job = await Job.findOne({ _id: id, createdBy: req.user.id });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const updates = {};
    for (const field of UPDATABLE_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.title !== undefined && !updates.title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "title cannot be empty",
      });
    }

    if (updates.description !== undefined && !updates.description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "description cannot be empty",
      });
    }

    if (updates.remoteType && !REMOTE_TYPES.includes(updates.remoteType)) {
      return res.status(400).json({
        success: false,
        message: `remoteType must be one of: ${REMOTE_TYPES.join(", ")}`,
      });
    }

    if (updates.employmentType && !EMPLOYMENT_TYPES.includes(updates.employmentType)) {
      return res.status(400).json({
        success: false,
        message: `employmentType must be one of: ${EMPLOYMENT_TYPES.join(", ")}`,
      });
    }

    if (updates.experienceLevel && !EXPERIENCE_LEVELS.includes(updates.experienceLevel)) {
      return res.status(400).json({
        success: false,
        message: `experienceLevel must be one of: ${EXPERIENCE_LEVELS.join(", ")}`,
      });
    }

    if (updates.status && !JOB_STATUSES.includes(updates.status)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${JOB_STATUSES.join(", ")}`,
      });
    }

    if (updates.companyId) {
      const company = await Company.findById(updates.companyId);

      if (!company) {
        return res.status(404).json({
          success: false,
          message: "Company not found",
        });
      }

      if (company.createdBy.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "You can only move jobs to companies you created",
        });
      }
    }

    if (updates.skills !== undefined) {
      updates.skills = normalizeSkills(updates.skills);
    }

    if (updates.salary !== undefined) {
      const merged = { ...(job.salary?.toObject() || {}), ...updates.salary };
      const salaryError = validateSalary(merged);
      if (salaryError) {
        return res.status(400).json({ success: false, message: salaryError });
      }
      updates.salary = merged;
    }

    if (updates.expiresAt !== undefined) {
      if (updates.expiresAt) {
        const parsed = new Date(updates.expiresAt);
        if (isNaN(parsed.getTime())) {
          return res.status(400).json({
            success: false,
            message: "expiresAt must be a valid date",
          });
        }
        updates.expiresAt = parsed;
      } else {
        updates.expiresAt = undefined;
      }
    }

    // Publishing a draft stamps it with today's date
    if (updates.status === "ACTIVE" && job.status === "DRAFT") {
      updates.postedAt = new Date();
    }

    for (const field of ["title", "description", "location"]) {
      if (typeof updates[field] === "string") updates[field] = updates[field].trim();
    }

    Object.assign(job, updates);
    await job.save();
    await job.populate("companyId", COMPANY_PUBLIC_FIELDS);

    return res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: { job },
    });
  } catch (error) {
    next(error);
  }
};



const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const job = await Job.findOne({ _id: id, createdBy: req.user.id });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Applications point at this job, so deleting it would orphan them
    const applicationCount = await Application.countDocuments({ jobId: job._id });

    if (applicationCount > 0) {
      return res.status(409).json({
        success: false,
        message: "Cannot delete a job with applications. Close it instead.",
      });
    }

    await job.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export {
  createJob,
  getJobs,
  getMyJobs,
  getMyJob,
  getJob,
  updateJob,
  deleteJob,
};