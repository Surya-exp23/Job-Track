import mongoose, { Schema } from "mongoose";

const resumeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },

    fileType: {
      type: String,
      enum: ["PDF", "DOC", "DOCX"],
      required: true,
    },

    fileSize: {
      type: Number,
      required: true,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },

    parsedData: {
      skills: [{ type: String, trim: true }],

      experience: [
        {
          company: { type: String, trim: true },
          title: { type: String, trim: true },
          startDate: { type: Date },
          endDate: { type: Date },
          description: { type: String, trim: true },
        },
      ],

      education: [
        {
          institution: { type: String, trim: true },
          degree: { type: String, trim: true },
          field: { type: String, trim: true },
          startDate: { type: Date },
          endDate: { type: Date },
        },
      ],

      projects: [
        {
          name: { type: String, trim: true },
          description: { type: String, trim: true },
          technologies: [{ type: String, trim: true }],
        },
      ],

      summary: {
        type: String,
        trim: true,
      },
    },

    parsingStatus: {
      type: String,
      enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },

    parsingError: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Resume = mongoose.model("Resume", resumeSchema);