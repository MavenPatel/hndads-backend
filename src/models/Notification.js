const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["project_invite", "task_assigned", "mention"],
      default: "project_invite",
    },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    role: { type: String, enum: ["owner", "editor", "viewer"], default: "editor" },
    message: { type: String },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
