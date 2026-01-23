import express from "express";

const router = express.Router();

/**
 * GET /api/v1/health
 * Health check endpoint for ALB & ECS
 */
router.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "FlashTix Backend API",
  });
});

export default router;

