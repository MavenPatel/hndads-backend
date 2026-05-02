const path = require("path");
const fs = require("fs");
const Message = require("../models/Message");

exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      file: {
        url: fileUrl,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        filename: req.file.filename,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.sendFileMessage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const { projectId } = req.params;
    const { content, chatType, dmWith } = req.body;
    const isImage = req.file.mimetype.startsWith("image/");

    const message = await Message.create({
      project: projectId || null,
      chatType: chatType || "project",
      dmWith: dmWith || null,
      sender: req.user._id,
      content: content || "",
      messageType: isImage ? "image" : "file",
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size,
    });

    await message.populate("sender", "name avatar isOnline");
    res.status(201).json({ success: true, message });
  } catch (err) {
    next(err);
  }
};

exports.deleteFile = async (req, res, next) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, "../../uploads", filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.json({ success: true, message: "File deleted" });
  } catch (err) {
    next(err);
  }
};
