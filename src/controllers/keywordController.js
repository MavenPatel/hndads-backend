const Keyword = require("../models/Keyword");

exports.addKeyword = async (req, res, next) => {
  try {
    const { campaign, adGroup, keyword, matchType, status, bidAmount, notes } = req.body;
    const entry = await Keyword.create({
      project: req.params.projectId,
      campaign,
      adGroup,
      keyword,
      matchType,
      status,
      bidAmount,
      notes,
      createdBy: req.user._id,
    });
    await entry.populate("createdBy", "name avatar");
    res.status(201).json({ success: true, entry });
  } catch (err) {
    next(err);
  }
};

exports.getKeywords = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { campaign, adGroup, status, matchType } = req.query;
    const filter = { project: projectId };
    if (campaign) filter.campaign = new RegExp(campaign, "i");
    if (adGroup) filter.adGroup = new RegExp(adGroup, "i");
    if (status) filter.status = status;
    if (matchType) filter.matchType = matchType;

    const keywords = await Keyword.find(filter)
      .populate("createdBy", "name avatar")
      .sort({ campaign: 1, adGroup: 1 });

    // Group by campaign > adGroup
    const grouped = {};
    for (const kw of keywords) {
      if (!grouped[kw.campaign]) grouped[kw.campaign] = {};
      if (!grouped[kw.campaign][kw.adGroup]) grouped[kw.campaign][kw.adGroup] = [];
      grouped[kw.campaign][kw.adGroup].push(kw);
    }

    res.json({ success: true, keywords, grouped });
  } catch (err) {
    next(err);
  }
};

exports.updateKeyword = async (req, res, next) => {
  try {
    const entry = await Keyword.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!entry) return res.status(404).json({ success: false, message: "Keyword not found" });
    res.json({ success: true, entry });
  } catch (err) {
    next(err);
  }
};

exports.deleteKeyword = async (req, res, next) => {
  try {
    await Keyword.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Keyword deleted" });
  } catch (err) {
    next(err);
  }
};
