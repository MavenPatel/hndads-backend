const express = require("express");
const router = express.Router({ mergeParams: true });
const { protect } = require("../middleware/auth");
const { addLandingPage, getLandingPages, updateLandingPage, deleteLandingPage } = require("../controllers/landingPageController");

router.use(protect);
router.route("/").get(getLandingPages).post(addLandingPage);
router.route("/:id").put(updateLandingPage).delete(deleteLandingPage);

module.exports = router;
