const mongoose = require("mongoose");

const keywordSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    campaign: {
      type: String,
      required: true,
      trim: true,
    },
    adGroup: {
      type: String,
      required: true,
      trim: true,
    },
    keyword: {
      type: String,
      required: true,
      trim: true,
    },
    matchType: {
      type: String,
      enum: ["broad", "phrase", "exact", "broad_modified"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "paused", "removed"],
      default: "active",
    },
    bidAmount: {
      type: Number,
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

keywordSchema.index({ project: 1, campaign: 1, adGroup: 1 });

module.exports = mongoose.model("Keyword", keywordSchema);
