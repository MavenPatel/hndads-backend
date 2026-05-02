const mongoose = require("mongoose");

const searchTermSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    term: {
      type: String,
      required: [true, "Search term is required"],
      trim: true,
      lowercase: true,
    },
    action: {
      type: String,
      enum: ["excluded", "added_as_keyword"],
      required: true,
    },
    matchType: {
      type: String,
      enum: ["broad", "phrase", "exact"],
      default: "broad",
    },
    campaign: {
      type: String,
      required: true,
    },
    adGroup: {
      type: String,
      default: "",
    },
    reason: {
      type: String,
      default: "",
    },
    dateActioned: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

searchTermSchema.index({ project: 1, term: 1 });

module.exports = mongoose.model("SearchTerm", searchTermSchema);
