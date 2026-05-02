const Project = require("../models/Project");
const User = require("../models/User");

const getUserRole = (project, userId) => {
  const member = project.members.find(
    (m) => (m.user._id || m.user).toString() === userId.toString()
  );
  return member ? member.role : null;
};

exports.createProject = async (req, res, next) => {
  try {
    const { name, description, timezone, monthlyBudget, currency, color } = req.body;
    const project = await Project.create({
      name, description, timezone, monthlyBudget, currency, color,
      createdBy: req.user._id,
      members: [{ user: req.user._id, role: "owner" }],
    });
    res.status(201).json({ success: true, project });
  } catch (err) { next(err); }
};

exports.getAllProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ "members.user": req.user._id })
      .populate("createdBy", "name email")
      .populate("members.user", "name email avatar isOnline")
      .sort({ updatedAt: -1 });
    res.json({ success: true, projects });
  } catch (err) { next(err); }
};

exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("members.user", "name email avatar isOnline");
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    const role = getUserRole(project, req.user._id);
    if (!role) return res.status(403).json({ success: false, message: "Access denied" });
    res.json({ success: true, project, myRole: role });
  } catch (err) { next(err); }
};

exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    const role = getUserRole(project, req.user._id);
    if (!role || role === "viewer")
      return res.status(403).json({ success: false, message: "Owner or editor access required" });
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, project: updated });
  } catch (err) { next(err); }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    const role = getUserRole(project, req.user._id);
    if (role !== "owner")
      return res.status(403).json({ success: false, message: "Only the project owner can delete" });
    await project.deleteOne();
    res.json({ success: true, message: "Project deleted" });
  } catch (err) { next(err); }
};

exports.addMember = async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    const myRole = getUserRole(project, req.user._id);
    if (!myRole || myRole === "viewer")
      return res.status(403).json({ success: false, message: "Owner or editor access required" });
    const alreadyMember = project.members.some((m) => m.user.toString() === userId);
    if (alreadyMember) return res.status(400).json({ success: false, message: "User already a member" });
    project.members.push({ user: userId, role: role || "editor" });
    await project.save();
    await project.populate("members.user", "name email avatar isOnline");
    res.json({ success: true, project });
  } catch (err) { next(err); }
};

exports.updateMemberRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    const myRole = getUserRole(project, req.user._id);
    if (myRole !== "owner")
      return res.status(403).json({ success: false, message: "Only the owner can change member roles" });
    const member = project.members.find((m) => m.user.toString() === req.params.userId);
    if (!member) return res.status(404).json({ success: false, message: "Member not found" });
    if (member.user.toString() === req.user._id.toString() && role !== "owner")
      return res.status(400).json({ success: false, message: "Cannot downgrade your own owner role" });
    member.role = role;
    await project.save();
    await project.populate("members.user", "name email avatar isOnline");
    res.json({ success: true, project });
  } catch (err) { next(err); }
};

exports.removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    const myRole = getUserRole(project, req.user._id);
    if (myRole !== "owner")
      return res.status(403).json({ success: false, message: "Only the owner can remove members" });
    project.members = project.members.filter((m) => m.user.toString() !== req.params.userId);
    await project.save();
    res.json({ success: true, project });
  } catch (err) { next(err); }
};
