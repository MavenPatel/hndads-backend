const AdCopy = require("../models/AdCopy");
const SearchTerm = require("../models/SearchTerm");
const ChangeLog = require("../models/ChangeLog");
const Keyword = require("../models/Keyword");
const Message = require("../models/Message");
const LandingPage = require("../models/LandingPage");

exports.globalSearch = async (req, res, next) => {
  try {
    const { q, projectId } = req.query;
    if (!q || q.trim().length < 2)
      return res.status(400).json({ success: false, message: "Query must be at least 2 characters" });

    const regex = new RegExp(q, "i");
    const projectFilter = projectId ? { project: projectId } : {};

    const [adCopies, searchTerms, changeLogs, keywords, messages, landingPages] = await Promise.all([
      AdCopy.find({ ...projectFilter, $or: [{ "headlines.text": regex }, { "descriptions.text": regex }] })
        .populate("project", "name color")
        .limit(10),
      SearchTerm.find({ ...projectFilter, term: regex })
        .populate("project", "name color")
        .limit(10),
      ChangeLog.find({ ...projectFilter, $or: [{ details: regex }, { campaign: regex }, { oldValue: regex }, { newValue: regex }] })
        .populate("project", "name color")
        .limit(10),
      Keyword.find({ ...projectFilter, keyword: regex })
        .populate("project", "name color")
        .limit(10),
      Message.find({ ...projectFilter, content: regex, isDeleted: false })
        .populate("project", "name color")
        .populate("sender", "name avatar")
        .limit(10),
      LandingPage.find({ ...projectFilter, $or: [{ title: regex }, { url: regex }] })
        .populate("project", "name color")
        .limit(10),
    ]);

    const totalResults =
      adCopies.length +
      searchTerms.length +
      changeLogs.length +
      keywords.length +
      messages.length +
      landingPages.length;

    res.json({
      success: true,
      query: q,
      totalResults,
      results: { adCopies, searchTerms, changeLogs, keywords, messages, landingPages },
    });
  } catch (err) {
    next(err);
  }
};
