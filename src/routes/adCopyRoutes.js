const express = require("express");
const router = express.Router({ mergeParams: true });
const { protect } = require("../middleware/auth");
const {
  addAdCopy, getAdCopies, getAdCopyById, updateAdCopy, getAdCopyHistory, deleteAdCopy,
} = require("../controllers/adCopyController");

router.use(protect);
router.route("/").get(getAdCopies).post(addAdCopy);
router.route("/:id").get(getAdCopyById).put(updateAdCopy).delete(deleteAdCopy);
router.get("/:id/history", getAdCopyHistory);

module.exports = router;
