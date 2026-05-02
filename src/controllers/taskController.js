const Task = require("../models/Task");

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, priority, status, dueDate, assignedTo, projectId } = req.body;
    const task = await Task.create({
      project: projectId || req.params.projectId || null,
      title,
      description,
      priority,
      status,
      dueDate,
      assignedTo,
      createdBy: req.user._id,
    });
    await task.populate("assignedTo createdBy", "name avatar email");
    res.status(201).json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    const { status, priority, assignedTo } = req.query;
    const filter = {};

    if (req.params.projectId) filter.project = req.params.projectId;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    const tasks = await Task.find(filter)
      .populate("assignedTo createdBy", "name avatar email")
      .sort({ dueDate: 1, createdAt: -1 });

    res.json({ success: true, tasks });
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("assignedTo createdBy", "name avatar email");
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });
    res.json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Task deleted" });
  } catch (err) {
    next(err);
  }
};

exports.getMyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({
      $or: [{ assignedTo: req.user._id }, { createdBy: req.user._id }],
      status: { $ne: "done" },
    })
      .populate("project", "name color")
      .populate("assignedTo createdBy", "name avatar")
      .sort({ dueDate: 1 });
    res.json({ success: true, tasks });
  } catch (err) {
    next(err);
  }
};
