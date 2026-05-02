const LandingPage = require("../models/LandingPage");

exports.addLandingPage = async (req, res, next) => {
  try {
    const { url, title, campaign, version, status, notes } = req.body;
    const entry = await LandingPage.create({
      project: req.params.projectId,
      url,
      title,
      campaign,
      version,
      status,
      notes,
      createdBy: req.user._id,
    });
    await entry.populate("createdBy", "name avatar");
    res.status(201).json({ success: true, entry });
  } catch (err) {
    next(err);
  }
};

exports.getLandingPages = async (req, res, next) => {
  try {
    const { campaign, status } = req.query;
    const filter = { project: req.params.projectId };
    if (campaign) filter.campaign = new RegExp(campaign, "i");
    if (status) filter.status = status;

    const pages = await LandingPage.find(filter)
      .populate("createdBy", "name avatar")
      .sort({ updatedAt: -1 });

    res.json({ success: true, pages });
  } catch (err) {
    next(err);
  }
};

exports.updateLandingPage = async (req, res, next) => {
  try {
    const entry = await LandingPage.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!entry) return res.status(404).json({ success: false, message: "Landing page not found" });
    res.json({ success: true, entry });
  } catch (err) {
    next(err);
  }
};

exports.deleteLandingPage = async (req, res, next) => {
  try {
    await LandingPage.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Landing page deleted" });
  } catch (err) {
    next(err);
  }
};
