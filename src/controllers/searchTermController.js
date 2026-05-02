const SearchTerm = require("../models/SearchTerm");

exports.addSearchTerm = async (req, res, next) => {
  try {
    const { term, action, matchType, campaign, adGroup, reason, dateActioned } = req.body;
    const projectId = req.params.projectId;

    // Duplicate check
    const existing = await SearchTerm.findOne({
      project: projectId,
      term: term.toLowerCase().trim(),
      action: "excluded",
    });

    if (existing) {
      return res.status(200).json({
        success: false,
        isDuplicate: true,
        message: `This term was already excluded on ${new Date(existing.dateActioned).toDateString()}`,
        existingEntry: existing,
      });
    }

    const entry = await SearchTerm.create({
      project: projectId,
      term,
      action,
      matchType,
      campaign,
      adGroup,
      reason,
      dateActioned: dateActioned || new Date(),
      createdBy: req.user._id,
    });

    await entry.populate("createdBy", "name avatar");
    res.status(201).json({ success: true, entry });
  } catch (err) {
    next(err);
  }
};

exports.getSearchTerms = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { action, campaign, search, limit = 100, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const filter = { project: projectId };
    if (action) filter.action = action;
    if (campaign) filter.campaign = new RegExp(campaign, "i");
    if (search) filter.term = new RegExp(search, "i");

    const terms = await SearchTerm.find(filter)
      .populate("createdBy", "name avatar")
      .sort({ dateActioned: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SearchTerm.countDocuments(filter);
    res.json({ success: true, terms, total });
  } catch (err) {
    next(err);
  }
};

exports.checkDuplicate = async (req, res, next) => {
  try {
    const { term } = req.query;
    const existing = await SearchTerm.findOne({
      project: req.params.projectId,
      term: term.toLowerCase().trim(),
      action: "excluded",
    });
    res.json({
      success: true,
      isDuplicate: !!existing,
      existingEntry: existing || null,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteSearchTerm = async (req, res, next) => {
  try {
    await SearchTerm.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Search term deleted" });
  } catch (err) {
    next(err);
  }
};
