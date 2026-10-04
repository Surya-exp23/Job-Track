import mongoose, { Schema } from "mongoose";

const resumeAnalysisSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    resumeId: {
      type: Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
      index: true,
    },

    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      index: true,
    },

    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },

    scores: {
      skillsMatch: {
        type: Number,
        min: 0,
        max: 100,
      },

      experienceMatch: {
        type: Number,
        min: 0,
        max: 100,
      },

      keywordMatch: {
        type: Number,
        min: 0,
        max: 100,
      },

      formatting: {
        type: Number,
        min: 0,
        max: 100,
      },
    },

    strengths: [
      {
        type: String,
        trim: true,
      },
    ],

    weaknesses: [
      {
        type: String,
        trim: true,
      },
    ],

    suggestions: [
      {
        type: String,
        trim: true,
      },
    ],

    model: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ResumeAnalysis = mongoose.model(
  "ResumeAnalysis",
  resumeAnalysisSchema
);
