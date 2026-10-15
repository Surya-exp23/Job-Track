import mongoose from "mongoose";
import path from "path";
import { Resume } from "../models/resume.model.js";
import { Application } from "../models/application.model.js";
import { EXT_TO_TYPE } from "../middlewares/upload.middleware.js";
import { getCloudinary, uploadBuffer } from "../utils/cloudinary.js";

const uploadResume = async (req, res, next) => {
  let uploaded = null;

  try {
    const ext = path.extname(req.file.originalname).toLowerCase();
    const publicId = `jobtrack/resumes/${req.user.id}-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${ext}`;

    uploaded = await uploadBuffer(req.file.buffer, publicId);

    const existingCount = await Resume.countDocuments({ userId: req.user.id });

    const resume = await Resume.create({
      userId: req.user.id,
      fileName: req.file.originalname,
      fileUrl: uploaded.secure_url,
      cloudinaryId: uploaded.public_id,
      fileType: EXT_TO_TYPE[ext],
      fileSize: req.file.size,
      isDefault: existingCount === 0,
    });

    return res.status(201).json({
      success: true,
      message: "Resume uploaded successfully",
      data: { resume },
    });
  } catch (error) {
  
    if (uploaded) {
      await getCloudinary()
        .uploader.destroy(uploaded.public_id, { resource_type: "raw" })
        .catch(() => {});
    }
    next(error);
  }
};

const getMyResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Resumes retrieved successfully",
      data: { resumes },
    });
  } catch (error) {
    next(error);
  }
};

const getResume = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }

    const resume = await Resume.findOne({ _id: id, userId: req.user.id });

    if (!resume) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Resume retrieved successfully",
      data: { resume },
    });
  } catch (error) {
    next(error);
  }
};

const setDefaultResume = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }

    const resume = await Resume.findOne({ _id: id, userId: req.user.id });

    if (!resume) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }

    await Resume.updateMany({ userId: req.user.id }, { isDefault: false });
    resume.isDefault = true;
    await resume.save();

    return res.status(200).json({
      success: true,
      message: "Default resume updated successfully",
      data: { resume },
    });
  } catch (error) {
    next(error);
  }
};

const deleteResume = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }

    const resume = await Resume.findOne({ _id: id, userId: req.user.id });

    if (!resume) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }

    const applicationCount = await Application.countDocuments({ resumeId: resume._id });

    if (applicationCount > 0) {
      return res.status(409).json({
        success: false,
        message: "Cannot delete a resume used in job applications",
      });
    }

    const wasDefault = resume.isDefault;
    const cloudinaryId = resume.cloudinaryId;

    await resume.deleteOne();

 
    if (cloudinaryId) {
      await getCloudinary()
        .uploader.destroy(cloudinaryId, { resource_type: "raw" })
        .catch(() => {});
    }


    if (wasDefault) {
      await Resume.findOneAndUpdate(
        { userId: req.user.id },
        { isDefault: true },
        { sort: { createdAt: -1 } }
      );
    }

    return res.status(200).json({ success: true, message: "Resume deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export { uploadResume, getMyResumes, getResume, setDefaultResume, deleteResume };
