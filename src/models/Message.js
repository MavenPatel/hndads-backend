const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
    chatType: {
      type: String,
      enum: ["project", "direct", "global"],
      required: true,
    },
    dmWith: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      default: "",
    },
    messageType: {
      type: String,
      enum: ["text", "file", "image", "system"],
      default: "text",
    },
    fileUrl: {
      type: String,
      default: "",
    },
    fileName: {
      type: String,
      default: "",
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    reactions: [
      {
        emoji: { type: String },
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      },
    ],
    readBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        readAt: { type: Date, default: Date.now },
      },
    ],
    tags: [
      {
        type: String,
        enum: ["budget_update", "exclusion", "copy_change", "issue", "idea", "important"],
      },
    ],
    isPinned: {
      type: Boolean,
      default: false,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    savedToChangeLog: {
      type: Boolean,
      default: false,
    },
    convertedToTask: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

messageSchema.index({ project: 1, createdAt: -1 });
messageSchema.index({ chatType: 1, project: 1 });
messageSchema.index({ sender: 1, dmWith: 1 });

module.exports = mongoose.model("Message", messageSchema);
