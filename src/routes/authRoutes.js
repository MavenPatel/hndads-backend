const express = require("express");
const router = express.Router();
const { register, login, logout, getMe, getTeamMembers } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.get("/team", protect, getTeamMembers);

module.exports = router;
