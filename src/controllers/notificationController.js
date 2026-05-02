const Notification = require("../models/Notification");
const Project = require("../models/Project");
const User = require("../models/User");

// Get notifications for logged-in user
exports.getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ to: req.user._id })
      .populate("from", "name email avatar")
      .populate("project", "name color")
      .sort({ createdAt: -1 })
      .limit(30);
    const unread = await Notification.countDocuments({ to: req.user._id, read: false });
    res.json({ success: true, notifications, unread });
  } catch (err) {
    next(err);
  }
};

// Mark all notifications as read
exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ to: req.user._id, read: false }, { read: true });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// Send project invite by email
exports.inviteByEmail = async (req, res, next) => {
  try {
    const { email, role, projectId } = req.body;
    if (!email || !projectId) return res.status(400).json({ success: false, message: "Email and project required" });

    // Find invited user
    const invitedUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (!invitedUser) return res.status(404).json({ success: false, message: "No user found with that email" });

    // Check they're not already a member
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    const isMember = project.members.some((m) => m.user.toString() === invitedUser._id.toString());
    if (isMember) return res.status(400).json({ success: false, message: "User is already a project member" });

    // Check if invite already sent
    const existing = await Notification.findOne({
      to: invitedUser._id,
      project: projectId,
      type: "project_invite",
      status: "pending",
    });
    if (existing) return res.status(400).json({ success: false, message: "Invite already sent to this user" });

    const notification = await Notification.create({
      to: invitedUser._id,
      from: req.user._id,
      type: "project_invite",
      project: projectId,
      role: role || "editor",
      message: `${req.user.name} invited you to join "${project.name}"`,
    });

    await notification.populate("from", "name email avatar");
    await notification.populate("project", "name color");

    res.status(201).json({ success: true, notification, message: `Invite sent to ${invitedUser.name}` });
  } catch (err) {
    next(err);
  }
};

// Accept or decline a project invite
exports.respondToInvite = async (req, res, next) => {
  try {
    const { action } = req.body; // 'accept' | 'decline'
    const notification = await Notification.findById(req.params.id).populate("project");

    if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
    if (notification.to.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not your notification" });
    if (notification.status !== "pending")
      return res.status(400).json({ success: false, message: "Already responded" });

    notification.status = action === "accept" ? "accepted" : "declined";
    notification.read = true;
    await notification.save();

    if (action === "accept" && notification.project) {
      const project = await Project.findById(notification.project._id);
      if (project) {
        const alreadyMember = project.members.some((m) => m.user.toString() === req.user._id.toString());
        if (!alreadyMember) {
          project.members.push({ user: req.user._id, role: notification.role || "editor" });
          await project.save();
        }
      }
    }

    res.json({ success: true, status: notification.status, message: action === "accept" ? "Joined project!" : "Invite declined" });
  } catch (err) {
    next(err);
  }
};

// Delete a notification
exports.deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, to: req.user._id });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
