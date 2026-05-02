const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    timezone: {
      type: String,
      enum: ["IST", "US/Eastern", "US/Pacific", "US/Central", "Australia/Sydney", "UTC"],
      default: "IST",
    },
    monthlyBudget: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      enum: ["INR", "USD", "AUD"],
      default: "INR",
    },
    status: {
      type: String,
      enum: ["active", "paused", "archived"],
      default: "active",
    },
    color: {
      type: String,
      default: "#6366f1",
    },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, enum: ["owner", "editor", "viewer"], default: "editor" },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
