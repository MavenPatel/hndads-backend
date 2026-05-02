const mongoose = require("mongoose");

const landingPageSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    url: {
      type: String,
      required: [true, "URL is required"],
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    campaign: {
      type: String,
      default: "",
    },
    version: {
      type: String,
      default: "V1",
    },
    status: {
      type: String,
      enum: ["active", "testing", "inactive"],
      default: "active",
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

module.exports = mongoose.model("LandingPage", landingPageSchema);
