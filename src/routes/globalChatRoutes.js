const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { getGlobalMessages, sendGlobalMessage } = require("../controllers/chatController");

router.use(protect);
router.route("/").get(getGlobalMessages).post(sendGlobalMessage);

module.exports = router;
