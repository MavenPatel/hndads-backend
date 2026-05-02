const express = require("express");
const router = express.Router();
const {
  createProject, getAllProjects, getProject,
  updateProject, deleteProject, addMember, updateMemberRole, removeMember,
} = require("../controllers/projectController");
const { protect } = require("../middleware/auth");

router.use(protect);
router.route("/").get(getAllProjects).post(createProject);
router.route("/:id").get(getProject).put(updateProject).delete(deleteProject);
router.post("/:id/members", addMember);
router.put("/:id/members/:userId", updateMemberRole);
router.delete("/:id/members/:userId", removeMember);

module.exports = router;
