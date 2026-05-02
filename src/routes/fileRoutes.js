const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { uploadFile, deleteFile } = require("../controllers/fileController");

router.use(protect);
router.post("/upload", upload.single("file"), uploadFile);
router.delete("/:filename", deleteFile);

module.exports = router;
