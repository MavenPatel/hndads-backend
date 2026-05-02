// budgetRoutes.js
const express = require("express");
const router = express.Router({ mergeParams: true });
const { protect } = require("../middleware/auth");
const {
  addBudgetEntry, getBudgetHistory, getLatestBudget, updateBudgetEntry, deleteBudgetEntry,
} = require("../controllers/budgetController");

router.use(protect);
router.route("/").get(getBudgetHistory).post(addBudgetEntry);
router.get("/latest", getLatestBudget);
router.route("/:id").put(updateBudgetEntry).delete(deleteBudgetEntry);

module.exports = router;
