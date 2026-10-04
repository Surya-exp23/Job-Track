import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
    },
    role: {
      type: String,
      enum: ["CANDIDATE", "RECRUITER"],
      required: true,
    },
    authProvider: {
      type: String,
      enum: ["LOCAL", "GOOGLE"],
      default: "LOCAL",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    emailOtpHash: {
      type: String,
      select: false,
    },
    emailOtpExpiresAt: {
      type: Date,
      select: false,
    },
    emailOtpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lastOtpSentAt: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", userSchema);
