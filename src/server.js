require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const connectDB = require("../config/db");
const routes = require("./routes/index");
const errorHandler = require("./middleware/errorHandler");
const setupSocket = require("./socket/socketHandler");

const app = express();
const server = http.createServer(app);

// ── CORS: allow your GitHub Pages frontend ──────────────────
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  // Add your GitHub Pages URL here after deploying:
  // "https://<your-github-username>.github.io",
  // Add your custom domain if you have one:
  // "https://yourdomain.com",
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Remove this line and uncomment below for strict mode
      // callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// Connect to MongoDB Atlas
connectDB();

// Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

// Serve uploaded files (Render provides ephemeral disk — use Cloudinary for production uploads)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API Routes
app.use("/api/v1", routes);

// Health check — Render pings this to keep service alive
app.get("/", (req, res) => {
  res.json({ success: true, message: "HNDAds API is running ✅", timestamp: new Date().toISOString() });
});
app.get("/health", (req, res) => {
  res.json({ success: true, message: "HNDAds API is running ✅", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

// Setup Socket.io
setupSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📦 MongoDB: Atlas Connected`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}\n`);
});
