const express = require("express");
const router = express.Router({ mergeParams: true });
const { protect } = require("../middleware/auth");
const { addKeyword, getKeywords, updateKeyword, deleteKeyword } = require("../controllers/keywordController");

router.use(protect);
router.route("/").get(getKeywords).post(addKeyword);
router.route("/:id").put(updateKeyword).delete(deleteKeyword);

module.exports = router;
