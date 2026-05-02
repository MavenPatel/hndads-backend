const express = require("express");
const router = express.Router({ mergeParams: true });
const { protect } = require("../middleware/auth");
const { createTask, getTasks, updateTask, deleteTask, getMyTasks } = require("../controllers/taskController");

router.use(protect);
router.get("/my", getMyTasks);
router.route("/").get(getTasks).post(createTask);
router.route("/:id").put(updateTask).delete(deleteTask);

module.exports = router;
