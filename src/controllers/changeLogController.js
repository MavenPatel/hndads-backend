const ChangeLog = require("../models/ChangeLog");

exports.addChange = async (req, res, next) => {
  try {
    const { date, type, campaign, adGroup, oldValue, newValue, details, reason, tags } = req.body;
    const entry = await ChangeLog.create({
      project: req.params.projectId,
      date: date || new Date(),
      type,
      campaign,
      adGroup,
      oldValue,
      newValue,
      details,
      reason,
      tags,
      createdBy: req.user._id,
    });
    await entry.populate("createdBy", "name avatar");
    res.status(201).json({ success: true, entry });
  } catch (err) {
    next(err);
  }
};

exports.getChangeLogs = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { type, campaign, from, to, limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const filter = { project: projectId };
    if (type) filter.type = type;
    if (campaign) filter.campaign = new RegExp(campaign, "i");
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const entries = await ChangeLog.find(filter)
      .populate("createdBy", "name avatar")
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ChangeLog.countDocuments(filter);
    res.json({ success: true, entries, total });
  } catch (err) {
    next(err);
  }
};

exports.updateChange = async (req, res, next) => {
  try {
    const entry = await ChangeLog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!entry) return res.status(404).json({ success: false, message: "Entry not found" });
    res.json({ success: true, entry });
  } catch (err) {
    next(err);
  }
};

exports.deleteChange = async (req, res, next) => {
  try {
    await ChangeLog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Change log entry deleted" });
  } catch (err) {
    next(err);
  }
};
