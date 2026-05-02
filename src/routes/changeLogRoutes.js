const express = require("express");
const router = express.Router({ mergeParams: true });
const { protect } = require("../middleware/auth");
const { addChange, getChangeLogs, updateChange, deleteChange } = require("../controllers/changeLogController");

router.use(protect);
router.route("/").get(getChangeLogs).post(addChange);
router.route("/:id").put(updateChange).delete(deleteChange);

module.exports = router;
