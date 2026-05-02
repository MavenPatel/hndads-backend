const Message = require("../models/Message");
const ChatSummary = require("../models/ChatSummary");
const ChangeLog = require("../models/ChangeLog");
const Task = require("../models/Task");

exports.getMessages = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { limit = 50, before } = req.query;

    const filter = {
      project: projectId,
      chatType: "project",
      isDeleted: false,
    };
    if (before) filter.createdAt = { $lt: new Date(before) };

    const messages = await Message.find(filter)
      .populate("sender", "name avatar isOnline")
      .populate("replyTo", "content sender")
      .populate("mentions", "name")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, messages: messages.reverse() });
  } catch (err) {
    next(err);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { content, messageType, replyTo, mentions, tags } = req.body;
    const { projectId } = req.params;

    const message = await Message.create({
      project: projectId,
      chatType: "project",
      sender: req.user._id,
      content,
      messageType: messageType || "text",
      replyTo: replyTo || null,
      mentions: mentions || [],
      tags: tags || [],
    });

    await message.populate("sender", "name avatar isOnline");
    await message.populate("replyTo", "content sender");
    res.status(201).json({ success: true, message });
  } catch (err) {
    next(err);
  }
};

exports.getDMMessages = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit = 50, before } = req.query;
    const myId = req.user._id;

    const filter = {
      chatType: "direct",
      isDeleted: false,
      $or: [
        { sender: myId, dmWith: userId },
        { sender: userId, dmWith: myId },
      ],
    };
    if (before) filter.createdAt = { $lt: new Date(before) };

    const messages = await Message.find(filter)
      .populate("sender", "name avatar isOnline")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, messages: messages.reverse() });
  } catch (err) {
    next(err);
  }
};

exports.sendDMMessage = async (req, res, next) => {
  try {
    const { content, messageType } = req.body;
    const { userId } = req.params;

    const message = await Message.create({
      chatType: "direct",
      sender: req.user._id,
      dmWith: userId,
      content,
      messageType: messageType || "text",
    });

    await message.populate("sender", "name avatar isOnline");
    res.status(201).json({ success: true, message });
  } catch (err) {
    next(err);
  }
};

exports.getGlobalMessages = async (req, res, next) => {
  try {
    const { limit = 50, before } = req.query;
    const filter = { chatType: "global", isDeleted: false };
    if (before) filter.createdAt = { $lt: new Date(before) };

    const messages = await Message.find(filter)
      .populate("sender", "name avatar isOnline")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, messages: messages.reverse() });
  } catch (err) {
    next(err);
  }
};

exports.sendGlobalMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    const message = await Message.create({
      chatType: "global",
      sender: req.user._id,
      content,
    });
    await message.populate("sender", "name avatar isOnline");
    res.status(201).json({ success: true, message });
  } catch (err) {
    next(err);
  }
};

exports.editMessage = async (req, res, next) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: "Message not found" });
    if (msg.sender.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Cannot edit others messages" });

    msg.content = req.body.content;
    msg.isEdited = true;
    await msg.save();
    await msg.populate("sender", "name avatar");
    res.json({ success: true, message: msg });
  } catch (err) {
    next(err);
  }
};

exports.deleteMessage = async (req, res, next) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: "Message not found" });
    if (msg.sender.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Cannot delete others messages" });

    msg.isDeleted = true;
    msg.deletedAt = new Date();
    msg.content = "";
    await msg.save();
    res.json({ success: true, message: "Message deleted" });
  } catch (err) {
    next(err);
  }
};

exports.pinMessage = async (req, res, next) => {
  try {
    const msg = await Message.findByIdAndUpdate(
      req.params.id,
      { isPinned: req.body.isPinned },
      { new: true }
    ).populate("sender", "name avatar");
    res.json({ success: true, message: msg });
  } catch (err) {
    next(err);
  }
};

exports.getPinnedMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({
      project: req.params.projectId,
      isPinned: true,
      isDeleted: false,
    }).populate("sender", "name avatar");
    res.json({ success: true, messages });
  } catch (err) {
    next(err);
  }
};

exports.addReaction = async (req, res, next) => {
  try {
    const { emoji } = req.body;
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: "Message not found" });

    const existing = msg.reactions.find((r) => r.emoji === emoji);
    if (existing) {
      const userIndex = existing.users.indexOf(req.user._id.toString());
      if (userIndex > -1) {
        existing.users.splice(userIndex, 1);
        if (existing.users.length === 0)
          msg.reactions = msg.reactions.filter((r) => r.emoji !== emoji);
      } else {
        existing.users.push(req.user._id);
      }
    } else {
      msg.reactions.push({ emoji, users: [req.user._id] });
    }

    await msg.save();
    res.json({ success: true, reactions: msg.reactions });
  } catch (err) {
    next(err);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    await Message.updateMany(
      {
        project: projectId,
        chatType: "project",
        "readBy.user": { $ne: req.user._id },
      },
      { $push: { readBy: { user: req.user._id, readAt: new Date() } } }
    );
    res.json({ success: true, message: "Marked as read" });
  } catch (err) {
    next(err);
  }
};

exports.saveToChangeLog = async (req, res, next) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: "Message not found" });

    const { type, campaign, adGroup, oldValue, newValue, reason } = req.body;
    const entry = await ChangeLog.create({
      project: msg.project,
      date: msg.createdAt,
      type: type || "other",
      campaign: campaign || "",
      adGroup: adGroup || "",
      oldValue: oldValue || "",
      newValue: newValue || "",
      details: msg.content,
      reason: reason || "",
      createdBy: req.user._id,
    });

    msg.savedToChangeLog = true;
    await msg.save();

    res.status(201).json({ success: true, changeLogEntry: entry });
  } catch (err) {
    next(err);
  }
};

exports.convertToTask = async (req, res, next) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: "Message not found" });

    const { title, dueDate, assignedTo, priority } = req.body;
    const task = await Task.create({
      project: msg.project,
      title: title || msg.content.substring(0, 100),
      dueDate,
      assignedTo,
      priority: priority || "medium",
      createdBy: req.user._id,
      sourceMessageId: msg._id,
    });

    msg.convertedToTask = true;
    await msg.save();

    await task.populate("assignedTo createdBy", "name avatar");
    res.status(201).json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

exports.createChatSummary = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { date, whatHappened, changesMade, campaigns, keyNumbers, nextAction } = req.body;

    const summaryDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(summaryDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(summaryDate.setHours(23, 59, 59, 999));

    const messageCount = await Message.countDocuments({
      project: projectId,
      chatType: "project",
      isDeleted: false,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    const summary = await ChatSummary.create({
      project: projectId,
      date: startOfDay,
      whatHappened,
      changesMade,
      campaigns,
      keyNumbers,
      nextAction,
      messageCount,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, summary });
  } catch (err) {
    next(err);
  }
};

exports.getChatSummaries = async (req, res, next) => {
  try {
    const summaries = await ChatSummary.find({ project: req.params.projectId })
      .populate("createdBy", "name avatar")
      .sort({ date: -1 })
      .limit(30);
    res.json({ success: true, summaries });
  } catch (err) {
    next(err);
  }
};
