const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { getDMMessages, sendDMMessage } = require("../controllers/chatController");

router.use(protect);
router.route("/:userId").get(getDMMessages).post(sendDMMessage);

module.exports = router;
