const express = require("express");
const router = express.Router();
const {
  getMyNotifications, markAllRead, inviteByEmail,
  respondToInvite, deleteNotification,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/auth");

router.use(protect);
router.get("/", getMyNotifications);
router.put("/read-all", markAllRead);
router.post("/invite", inviteByEmail);
router.put("/:id/respond", respondToInvite);
router.delete("/:id", deleteNotification);

module.exports = router;
