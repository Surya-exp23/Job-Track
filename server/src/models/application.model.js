import mongoose, { Schema } from "mongoose";

const applicationSchema = new Schema(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },

    resumeId: {
      type: Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "APPLIED",
        "SCREENING",
        "SHORTLISTED",
        "INTERVIEW",
        "SELECTED",
        "REJECTED",
        "WITHDRAWN",
      ],
      default: "APPLIED",
    },

    appliedAt: {
      type: Date,
      default: Date.now,
    },

    notes: {
      type: String,
      trim: true,
    },

    timeline: [
      {
        status: {
          type: String,
          enum: [
            "APPLIED",
            "SCREENING",
            "SHORTLISTED",
            "INTERVIEW",
            "SELECTED",
            "REJECTED",
            "WITHDRAWN",
          ],
          required: true,
        },

        note: {
          type: String,
          trim: true,
        },

        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

applicationSchema.index(
  { candidateId: 1, jobId: 1 },
  { unique: true }
);

export const Application = mongoose.model(
  "Application",
  applicationSchema
);