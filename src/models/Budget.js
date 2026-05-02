const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
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
    yesterdaySpend: {
      type: Number,
      default: 0,
    },
    monthlyTarget: {
      type: Number,
      required: true,
    },
    monthSpentSoFar: {
      type: Number,
      default: 0,
    },
    todayAllowed: {
      type: Number,
      default: 0,
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

budgetSchema.index({ project: 1, date: -1 });

module.exports = mongoose.model("Budget", budgetSchema);
