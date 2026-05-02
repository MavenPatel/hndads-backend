const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Message = require("../models/Message");

const onlineUsers = new Map(); // userId -> socketId

const setupSocket = (io) => {
  // Auth middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("Authentication required"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.user._id.toString();
    onlineUsers.set(userId, socket.id);

    // Update online status in DB
    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });

    // Broadcast online status to all
    socket.broadcast.emit("user:online", { userId, isOnline: true });
    io.emit("online:users", Array.from(onlineUsers.keys()));

    console.log(`User connected: ${socket.user.name} (${socket.id})`);

    // ─── Join rooms ───────────────────────────────────────────────
    socket.on("join:project", (projectId) => {
      socket.join(`project:${projectId}`);
      console.log(`${socket.user.name} joined project room: ${projectId}`);
    });

    socket.on("leave:project", (projectId) => {
      socket.leave(`project:${projectId}`);
    });

    socket.on("join:global", () => {
      socket.join("global");
    });

    // ─── Project chat ─────────────────────────────────────────────
    socket.on("message:send", async (data) => {
      try {
        const { projectId, content, messageType, replyTo, mentions, tags } = data;

        const message = await Message.create({
          project: projectId,
          chatType: "project",
          sender: socket.user._id,
          content,
          messageType: messageType || "text",
          replyTo: replyTo || null,
          mentions: mentions || [],
          tags: tags || [],
        });

        await message.populate("sender", "name avatar isOnline");
        if (replyTo) await message.populate("replyTo", "content sender");

        // Broadcast to everyone in that project room
        io.to(`project:${projectId}`).emit("message:new", message);
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    // ─── Direct messages ──────────────────────────────────────────
    socket.on("dm:send", async (data) => {
      try {
        const { toUserId, content, messageType } = data;

        const message = await Message.create({
          chatType: "direct",
          sender: socket.user._id,
          dmWith: toUserId,
          content,
          messageType: messageType || "text",
        });

        await message.populate("sender", "name avatar isOnline");

        // Send to receiver if online
        const receiverSocketId = onlineUsers.get(toUserId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("dm:new", message);
        }
        // Confirm to sender
        socket.emit("dm:new", message);
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    // ─── Global chat ──────────────────────────────────────────────
    socket.on("global:send", async (data) => {
      try {
        const message = await Message.create({
          chatType: "global",
          sender: socket.user._id,
          content: data.content,
        });
        await message.populate("sender", "name avatar isOnline");
        io.to("global").emit("global:new", message);
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    // ─── Typing indicators ────────────────────────────────────────
    socket.on("typing:start", ({ projectId }) => {
      socket.to(`project:${projectId}`).emit("typing:start", {
        userId,
        name: socket.user.name,
        projectId,
      });
    });

    socket.on("typing:stop", ({ projectId }) => {
      socket.to(`project:${projectId}`).emit("typing:stop", { userId, projectId });
    });

    socket.on("dm:typing:start", ({ toUserId }) => {
      const receiverSocketId = onlineUsers.get(toUserId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("dm:typing:start", { userId, name: socket.user.name });
      }
    });

    socket.on("dm:typing:stop", ({ toUserId }) => {
      const receiverSocketId = onlineUsers.get(toUserId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("dm:typing:stop", { userId });
      }
    });

    // ─── Message reactions ────────────────────────────────────────
    socket.on("message:react", async ({ messageId, emoji, projectId }) => {
      try {
        const msg = await Message.findById(messageId);
        if (!msg) return;

        const existing = msg.reactions.find((r) => r.emoji === emoji);
        if (existing) {
          const idx = existing.users.map((u) => u.toString()).indexOf(userId);
          if (idx > -1) {
            existing.users.splice(idx, 1);
            if (existing.users.length === 0)
              msg.reactions = msg.reactions.filter((r) => r.emoji !== emoji);
          } else {
            existing.users.push(socket.user._id);
          }
        } else {
          msg.reactions.push({ emoji, users: [socket.user._id] });
        }

        await msg.save();
        io.to(`project:${projectId}`).emit("message:reactions:updated", {
          messageId,
          reactions: msg.reactions,
        });
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    // ─── Read receipts ────────────────────────────────────────────
    socket.on("message:read", async ({ projectId }) => {
      try {
        await Message.updateMany(
          {
            project: projectId,
            chatType: "project",
            "readBy.user": { $ne: socket.user._id },
          },
          { $push: { readBy: { user: socket.user._id, readAt: new Date() } } }
        );
        socket.to(`project:${projectId}`).emit("message:read:update", { userId, projectId });
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    // ─── Pin message ──────────────────────────────────────────────
    socket.on("message:pin", async ({ messageId, isPinned, projectId }) => {
      try {
        const msg = await Message.findByIdAndUpdate(
          messageId,
          { isPinned },
          { new: true }
        ).populate("sender", "name avatar");
        io.to(`project:${projectId}`).emit("message:pinned", msg);
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    // ─── Edit message ─────────────────────────────────────────────
    socket.on("message:edit", async ({ messageId, content, projectId }) => {
      try {
        const msg = await Message.findById(messageId);
        if (!msg || msg.sender.toString() !== userId) return;
        msg.content = content;
        msg.isEdited = true;
        await msg.save();
        await msg.populate("sender", "name avatar");
        io.to(`project:${projectId}`).emit("message:edited", msg);
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    // ─── Delete message ───────────────────────────────────────────
    socket.on("message:delete", async ({ messageId, projectId }) => {
      try {
        const msg = await Message.findById(messageId);
        if (!msg || msg.sender.toString() !== userId) return;
        msg.isDeleted = true;
        msg.deletedAt = new Date();
        msg.content = "";
        await msg.save();
        io.to(`project:${projectId}`).emit("message:deleted", { messageId });
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    // ─── Disconnect ───────────────────────────────────────────────
    socket.on("disconnect", async () => {
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
      socket.broadcast.emit("user:online", { userId, isOnline: false });
      io.emit("online:users", Array.from(onlineUsers.keys()));
      console.log(`User disconnected: ${socket.user.name}`);
    });
  });
};

module.exports = setupSocket;
