const express = require("express");
const router = express.Router();

router.use("/auth", require("./authRoutes"));
router.use("/projects", require("./projectRoutes"));
router.use("/tasks", require("./taskRoutes"));
router.use("/search", require("./searchRoutes"));
router.use("/files", require("./fileRoutes"));
router.use("/chat/global", require("./globalChatRoutes"));
router.use("/chat/dm", require("./dmRoutes"));
router.use("/projects/:projectId/budget", require("./budgetRoutes"));
router.use("/projects/:projectId/changelog", require("./changeLogRoutes"));
router.use("/projects/:projectId/adcopy", require("./adCopyRoutes"));
router.use("/projects/:projectId/searchterms", require("./searchTermRoutes"));
router.use("/projects/:projectId/keywords", require("./keywordRoutes"));
router.use("/projects/:projectId/landingpages", require("./landingPageRoutes"));
router.use("/projects/:projectId/chat", require("./chatRoutes"));
router.use("/notifications", require("./notificationRoutes"));

module.exports = router;
