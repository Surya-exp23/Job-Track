import mongoose, { Schema } from "mongoose";

const jobSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    location: {
      type: String,
      trim: true,
    },

    remoteType: {
      type: String,
      enum: ["ONSITE", "REMOTE", "HYBRID"],
      default: "ONSITE",
    },

    employmentType: {
      type: String,
      enum: ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"],
      required: true,
    },

    experienceLevel: {
      type: String,
      enum: ["ENTRY", "JUNIOR", "MID", "SENIOR", "LEAD"],
    },

    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    salary: {
      min: {
        type: Number,
        min: 0,
      },
      max: {
        type: Number,
        min: 0,
      },
      currency: {
        type: String,
        default: "INR",
        trim: true,
      },
      period: {
        type: String,
        enum: ["YEARLY", "MONTHLY", "HOURLY"],
        default: "YEARLY",
      },
    },

    source: {
      type: {
        type: String,
        enum: ["RECRUITER", "EXTERNAL"],
        required: true,
      },

      provider: {
        type: String,
        trim: true,
      },

      externalId: {
        type: String,
        trim: true,
      },

      url: {
        type: String,
        trim: true,
      },
    },

    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE", "CLOSED", "EXPIRED"],
      default: "ACTIVE",
    },

    postedAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Job = mongoose.model("Job", jobSchema);