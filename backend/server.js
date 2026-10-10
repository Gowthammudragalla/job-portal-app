require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import route handlers
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const savedJobRoutes = require("./routes/savedJobRoutes");

const app = express();

// Middleware
// Enable Cross-Origin Resource Sharing (CORS) so frontend on port 5173 can make requests
app.use(cors());
// Parse incoming requests with JSON payloads
app.use(express.json());

// Database Connection Helper
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri || uri.trim() === "") {
    console.error(
      "MongoDB configuration error: MONGO_URI is not set in environment variables (.env)."
    );
    console.error("Please set MONGO_URI in your backend/.env file.");
    return false;
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to MongoDB successfully!");
    return true;
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    console.error(
      "Please verify your MongoDB connection string and network access in backend/.env."
    );
    return false;
  }
};

// Database event listeners for reliable connection tracking
mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected.");
});
mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected successfully.");
});

// Database readiness middleware for /api routes
// Prevents requests from hanging on Mongoose buffering when DB is unreachable
const checkDbConnection = (req, res, next) => {
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Database service is temporarily unavailable. Please verify MongoDB connection.",
    });
  }
  next();
};

// Mount REST API Routes (with DB check)
app.use("/api/auth", checkDbConnection, authRoutes);
app.use("/api/jobs", checkDbConnection, jobRoutes);
app.use("/api/applications", checkDbConnection, applicationRoutes);
app.use("/api/saved-jobs", checkDbConnection, savedJobRoutes);

// Health check endpoint (public, does not block on DB)
app.get("/", (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1
      ? "connected"
      : mongoose.connection.readyState === 2
      ? "connecting"
      : "disconnected";

  res.json({
    status: "success",
    message: "Job Portal Backend REST API is running smoothly!",
    database: dbStatus,
    timestamp: new Date(),
  });
});

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
  });
});

// Global error handler with clean diagnostic logging (without leaking credentials)
app.use((err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message);
  res.status(500).json({
    message: "Internal server error",
    error: err.message,
  });
});

const PORT = process.env.PORT || 5001;

// Start server after attempting DB connection
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();

module.exports = app;