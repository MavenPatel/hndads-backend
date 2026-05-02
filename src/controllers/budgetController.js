const Budget = require("../models/Budget");

exports.addBudgetEntry = async (req, res, next) => {
  try {
    const { date, yesterdaySpend, monthlyTarget, monthSpentSoFar, notes } = req.body;
    const projectId = req.params.projectId;

    const entryDate = new Date(date);
    const daysInMonth = new Date(entryDate.getFullYear(), entryDate.getMonth() + 1, 0).getDate();
    const currentDay = entryDate.getDate();
    const daysRemaining = daysInMonth - currentDay + 1;
    const remainingBudget = monthlyTarget - (monthSpentSoFar || 0);
    const todayAllowed = daysRemaining > 0 ? parseFloat((remainingBudget / daysRemaining).toFixed(2)) : 0;

    const entry = await Budget.create({
      project: projectId,
      date: entryDate,
      yesterdaySpend,
      monthlyTarget,
      monthSpentSoFar: monthSpentSoFar || 0,
      todayAllowed,
      notes,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, entry });
  } catch (err) {
    next(err);
  }
};

exports.getBudgetHistory = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { limit = 30, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const entries = await Budget.find({ project: projectId })
      .populate("createdBy", "name")
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Budget.countDocuments({ project: projectId });

    res.json({ success: true, entries, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
};

exports.getLatestBudget = async (req, res, next) => {
  try {
    const entry = await Budget.findOne({ project: req.params.projectId })
      .sort({ date: -1 })
      .populate("createdBy", "name");
    res.json({ success: true, entry });
  } catch (err) {
    next(err);
  }
};

exports.updateBudgetEntry = async (req, res, next) => {
  try {
    const entry = await Budget.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!entry) return res.status(404).json({ success: false, message: "Entry not found" });
    res.json({ success: true, entry });
  } catch (err) {
    next(err);
  }
};

exports.deleteBudgetEntry = async (req, res, next) => {
  try {
    await Budget.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Budget entry deleted" });
  } catch (err) {
    next(err);
  }
};
