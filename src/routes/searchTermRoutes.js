// searchTermRoutes.js
const express = require("express");
const router = express.Router({ mergeParams: true });
const { protect } = require("../middleware/auth");
const { addSearchTerm, getSearchTerms, checkDuplicate, deleteSearchTerm } = require("../controllers/searchTermController");

router.use(protect);
router.route("/").get(getSearchTerms).post(addSearchTerm);
router.get("/check", checkDuplicate);
router.delete("/:id", deleteSearchTerm);

module.exports = router;
