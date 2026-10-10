import mongoose from "mongoose";
import { Profile } from "../models/profile.model.js";
import { Company } from "../models/company.model.js";

const STRING_FIELDS = [
  "firstName",
  "lastName",
  "phone",
  "location",
  "headline",
  "bio",
  "designation",
];
const ARRAY_FIELDS = ["experience", "education", "projects"];
const LINK_FIELDS = ["github", "linkedin", "portfolio"];


const toDate = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

const getMyProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id }).populate(
      "companyId",
      "name logoUrl"
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    const updates = {};

    for (const field of STRING_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] =
          typeof req.body[field] === "string"
            ? req.body[field].trim()
            : req.body[field];
      }
    }

    if ("firstName" in updates && !updates.firstName) {
      return res.status(400).json({
        success: false,
        message: "firstName cannot be empty",
      });
    }

    if ("lastName" in updates && !updates.lastName) {
      return res.status(400).json({
        success: false,
        message: "lastName cannot be empty",
      });
    }

    if (req.body.skills !== undefined) {
      if (!Array.isArray(req.body.skills)) {
        return res.status(400).json({
          success: false,
          message: "skills must be an array of strings",
        });
      }
      
      updates.skills = [
        ...new Set(
          req.body.skills.map((s) => String(s).trim().toLowerCase()).filter(Boolean)
        ),
      ];
    }

    for (const arrField of ARRAY_FIELDS) {
      if (req.body[arrField] === undefined) continue;

      if (!Array.isArray(req.body[arrField])) {
        return res.status(400).json({
          success: false,
          message: `${arrField} must be an array`,
        });
      }

      const cleaned = [];

      for (const item of req.body[arrField]) {
        if (typeof item !== "object" || item === null || Array.isArray(item)) {
          return res.status(400).json({
            success: false,
            message: `${arrField} must contain objects`,
          });
        }

        const entry = { ...item };

        for (const dateField of ["startDate", "endDate"]) {
          if (entry[dateField] !== undefined) {
            const parsed = toDate(entry[dateField]);
            if (parsed === null) {
              return res.status(400).json({
                success: false,
                message: `${arrField} contains an invalid date`,
              });
            }
            entry[dateField] = parsed;
          }
        }

        if (entry.technologies !== undefined) {
          if (!Array.isArray(entry.technologies)) {
            return res.status(400).json({
              success: false,
              message: "technologies must be an array of strings",
            });
          }
          entry.technologies = entry.technologies
            .map((t) => String(t).trim().toLowerCase())
            .filter(Boolean);
        }

        cleaned.push(entry);
      }

      updates[arrField] = cleaned;
    }

    if (req.body.links !== undefined) {
      if (
        typeof req.body.links !== "object" ||
        req.body.links === null ||
        Array.isArray(req.body.links)
      ) {
        return res.status(400).json({
          success: false,
          message: "links must be an object",
        });
      }

      const merged = { ...(profile.links?.toObject() || {}) };

      for (const key of LINK_FIELDS) {
        if (req.body.links[key] !== undefined) {
          merged[key] =
            typeof req.body.links[key] === "string"
              ? req.body.links[key].trim() || undefined
              : req.body.links[key];
        }
      }

      updates.links = merged;
    }

    if (req.body.companyId !== undefined) {
      if (req.body.companyId) {
        if (!mongoose.isValidObjectId(req.body.companyId)) {
          return res.status(404).json({
            success: false,
            message: "Company not found",
          });
        }

        const company = await Company.findById(req.body.companyId);

        if (!company) {
          return res.status(404).json({
            success: false,
            message: "Company not found",
          });
        }

        // A recruiter can only link their own company to their profile
        if (company.createdBy.toString() !== req.user.id) {
          return res.status(403).json({
            success: false,
            message: "You can only link companies you created",
          });
        }

        updates.companyId = req.body.companyId;
      } else {
        updates.companyId = null;
      }
    }

    Object.assign(profile, updates);
    await profile.save();

    await profile.populate("companyId", "name logoUrl");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
};

export { getMyProfile, updateMyProfile };
