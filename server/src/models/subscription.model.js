import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    plan: {
      type: String,
      enum: ["FREE", "PREMIUM", "ENTERPRISE"],
      default: "FREE",
      required: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "CANCELLED", "EXPIRED"],
      default: "ACTIVE",
    },

    provider: {
      type: String,
      enum: ["RAZORPAY", "STRIPE"],
      trim: true,
    },

    providerCustomerId: {
      type: String,
      trim: true,
    },

    providerSubscriptionId: {
      type: String,
      trim: true,
    },

    startDate: {
      type: Date,
      default: Date.now,
    },

    endDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Subscription = mongoose.model(
  "Subscription",
  subscriptionSchema
);
