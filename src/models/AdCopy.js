const mongoose = require("mongoose");

const adCopySchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    campaign: {
      type: String,
      required: [true, "Campaign name is required"],
      trim: true,
    },
    adGroup: {
      type: String,
      required: [true, "Ad group name is required"],
      trim: true,
    },
    adType: {
      type: String,
      enum: ["RSA", "ETA", "PMAX", "DSA"],
      default: "RSA",
    },
    version: {
      type: String,
      default: "V1",
    },
    headlines: [
      {
        text: { type: String, required: true },
        pinPosition: { type: Number, default: null },
      },
    ],
    descriptions: [
      {
        text: { type: String, required: true },
        pinPosition: { type: Number, default: null },
      },
    ],
    status: {
      type: String,
      enum: ["active", "testing", "paused", "archived"],
      default: "active",
    },
    notes: {
      type: String,
      default: "",
    },
    previousVersion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdCopy",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

adCopySchema.index({ project: 1, campaign: 1, adGroup: 1 });

module.exports = mongoose.model("AdCopy", adCopySchema);
