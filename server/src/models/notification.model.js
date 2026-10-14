import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["NEW_APPLICATION", "APPLICATION_STATUS"],
      required: true,
    },
    icon: {
      type: String,
      enum: ["applicant", "shortlisted", "interview", "rejected", "viewed", "info"],
      default: "info",
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    relatedId: { type: Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", notificationSchema);
