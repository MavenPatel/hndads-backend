const express = require("express");
const router = express.Router({ mergeParams: true });
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  getMessages, sendMessage,
  editMessage, deleteMessage,
  pinMessage, getPinnedMessages,
  addReaction, markAsRead,
  saveToChangeLog, convertToTask,
  createChatSummary, getChatSummaries,
} = require("../controllers/chatController");
const { sendFileMessage } = require("../controllers/fileController");

router.use(protect);

router.route("/").get(getMessages).post(sendMessage);
router.get("/pinned", getPinnedMessages);
router.post("/read", markAsRead);
router.post("/summary", createChatSummary);
router.get("/summary", getChatSummaries);
router.post("/upload", upload.single("file"), sendFileMessage);

router.put("/:id", editMessage);
router.delete("/:id", deleteMessage);
router.put("/:id/pin", pinMessage);
router.post("/:id/react", addReaction);
router.post("/:id/save-to-changelog", saveToChangeLog);
router.post("/:id/convert-to-task", convertToTask);

module.exports = router;
