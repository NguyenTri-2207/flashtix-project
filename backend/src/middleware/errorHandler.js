/**
 * Global error handler middleware
 */
export function errorHandler(err, req, res, next) {
  console.error("Error:", err);

  // Handle specific error types
  if (err.message === "SOLD_OUT") {
    return res.status(400).json({
      error: "Sold Out",
      message: "Vé đã hết, vui lòng thử lại sau",
    });
  }

  if (err.name === "ConditionalCheckFailedException") {
    return res.status(400).json({
      error: "Sold Out",
      message: "Vé đã hết, vui lòng thử lại sau",
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    error: "Error",
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

/**
 * 404 handler
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.path} not found`,
  });
}

