const mongoose = require("mongoose");

const chatSummarySchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    whatHappened: {
      type: String,
      default: "",
    },
    changesMade: [
      {
        label: { type: String },
        type: {
          type: String,
          enum: ["excluded", "headline", "budget", "keyword", "landing_page", "other"],
        },
      },
    ],
    campaigns: [{ type: String }],
    keyNumbers: {
      type: String,
      default: "",
    },
    nextAction: {
      type: String,
      default: "",
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

chatSummarySchema.index({ project: 1, date: -1 });

module.exports = mongoose.model("ChatSummary", chatSummarySchema);
