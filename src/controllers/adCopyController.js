const AdCopy = require("../models/AdCopy");

exports.addAdCopy = async (req, res, next) => {
  try {
    const { campaign, adGroup, adType, version, headlines, descriptions, status, notes } = req.body;
    const adCopy = await AdCopy.create({
      project: req.params.projectId,
      campaign,
      adGroup,
      adType,
      version,
      headlines,
      descriptions,
      status,
      notes,
      createdBy: req.user._id,
    });
    await adCopy.populate("createdBy", "name avatar");
    res.status(201).json({ success: true, adCopy });
  } catch (err) {
    next(err);
  }
};

exports.getAdCopies = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { campaign, adGroup, status } = req.query;
    const filter = { project: projectId };
    if (campaign) filter.campaign = new RegExp(campaign, "i");
    if (adGroup) filter.adGroup = new RegExp(adGroup, "i");
    if (status) filter.status = status;

    const adCopies = await AdCopy.find(filter)
      .populate("createdBy", "name avatar")
      .populate("previousVersion", "version headlines descriptions status createdAt")
      .sort({ updatedAt: -1 });

    res.json({ success: true, adCopies });
  } catch (err) {
    next(err);
  }
};

exports.getAdCopyById = async (req, res, next) => {
  try {
    const adCopy = await AdCopy.findById(req.params.id)
      .populate("createdBy", "name avatar")
      .populate("previousVersion");
    if (!adCopy) return res.status(404).json({ success: false, message: "Ad copy not found" });
    res.json({ success: true, adCopy });
  } catch (err) {
    next(err);
  }
};

exports.updateAdCopy = async (req, res, next) => {
  try {
    const existing = await AdCopy.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Ad copy not found" });

    // Archive old version and create new one
    await AdCopy.findByIdAndUpdate(req.params.id, { status: "archived" });

    const newCopy = await AdCopy.create({
      project: existing.project,
      campaign: req.body.campaign || existing.campaign,
      adGroup: req.body.adGroup || existing.adGroup,
      adType: req.body.adType || existing.adType,
      version: req.body.version || `V${parseInt((existing.version || "V1").replace("V", "")) + 1}`,
      headlines: req.body.headlines || existing.headlines,
      descriptions: req.body.descriptions || existing.descriptions,
      status: req.body.status || "active",
      notes: req.body.notes || "",
      previousVersion: existing._id,
      createdBy: req.user._id,
    });

    await newCopy.populate("previousVersion createdBy", "name avatar version headlines descriptions status");
    res.json({ success: true, adCopy: newCopy });
  } catch (err) {
    next(err);
  }
};

exports.getAdCopyHistory = async (req, res, next) => {
  try {
    const adCopy = await AdCopy.findById(req.params.id);
    if (!adCopy) return res.status(404).json({ success: false, message: "Ad copy not found" });

    const history = await AdCopy.find({
      project: adCopy.project,
      campaign: adCopy.campaign,
      adGroup: adCopy.adGroup,
    })
      .populate("createdBy", "name avatar")
      .sort({ createdAt: -1 });

    res.json({ success: true, history });
  } catch (err) {
    next(err);
  }
};

exports.deleteAdCopy = async (req, res, next) => {
  try {
    await AdCopy.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Ad copy deleted" });
  } catch (err) {
    next(err);
  }
};
