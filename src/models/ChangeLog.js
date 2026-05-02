const mongoose = require("mongoose");

const changeLogSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    type: {
      type: String,
      enum: [
        "search_term_excluded",
        "keyword_added",
        "keyword_paused",
        "keyword_removed",
        "ad_copy_updated",
        "budget_changed",
        "bid_changed",
        "campaign_paused",
        "campaign_enabled",
        "landing_page_changed",
        "audience_added",
        "other",
      ],
      required: true,
    },
    campaign: {
      type: String,
      default: "",
    },
    adGroup: {
      type: String,
      default: "",
    },
    oldValue: {
      type: String,
      default: "",
    },
    newValue: {
      type: String,
      default: "",
    },
    details: {
      type: String,
      default: "",
    },
    reason: {
      type: String,
      default: "",
    },
    tags: [
      {
        type: String,
        enum: ["high_cpc", "low_ctr", "winning_copy", "mistake", "test", "important"],
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

changeLogSchema.index({ project: 1, date: -1 });
changeLogSchema.index({ project: 1, type: 1 });

module.exports = mongoose.model("ChangeLog", changeLogSchema);
