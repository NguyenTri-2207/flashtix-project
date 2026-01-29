import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

// Import routes
import healthRoutes from "./routes/health.js";
import eventsRoutes from "./routes/events.js";
import bookingsRoutes from "./routes/bookings.js";
import adminRoutes from "./routes/admin.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/events", eventsRoutes);
app.use("/api/v1/bookings", bookingsRoutes);
app.use("/api/v1/admin", adminRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    service: "FlashTix Backend API",
    version: "1.0.0",
    endpoints: {
      health: "/api/v1/health",
      events: "/api/v1/events",
      bookings: "/api/v1/bookings",
      admin: "/api/v1/admin",
    },
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 FlashTix Backend API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌍 AWS Region: ${process.env.AWS_REGION || "ap-southeast-1"}`);
  console.log(`📦 DynamoDB Tables:`);
  console.log(`   - Events: ${process.env.DYNAMODB_EVENT_TABLE || "FlashTix_Events"}`);
  console.log(`   - Bookings: ${process.env.DYNAMODB_BOOKING_TABLE || "FlashTix_Bookings"}`);
});

export default app;

