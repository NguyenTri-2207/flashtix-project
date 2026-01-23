/**
 * Middleware to extract user ID from Cognito token
 * In production, this would verify the JWT token from Cognito
 * For now, we'll extract from Authorization header
 */

export function extractUserId(req, res, next) {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Missing authorization header",
      });
    }

    // In production, verify JWT token from Cognito
    // For now, we'll accept a simple format: "Bearer userId"
    // Or extract from Cognito JWT token payload
    const token = authHeader.replace("Bearer ", "");

    // TODO: Verify JWT token with Cognito
    // For now, we'll use a simple approach:
    // If token looks like a JWT, decode it (without verification for now)
    // Otherwise, use it as userId directly

    let userId;

    if (token.includes(".")) {
      // Looks like JWT - decode payload (without verification for demo)
      try {
        const payload = JSON.parse(
          Buffer.from(token.split(".")[1], "base64").toString()
        );
        userId = payload.sub || payload.userId || payload["cognito:username"];
      } catch (e) {
        // If decode fails, use token as userId
        userId = token;
      }
    } else {
      // Use token as userId directly
      userId = token;
    }

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid token",
      });
    }

    // Attach userId to request
    req.userId = userId;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid authorization",
    });
  }
}

/**
 * Optional middleware - only require auth for certain routes
 */
export function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      let userId;

      if (token.includes(".")) {
        try {
          const payload = JSON.parse(
            Buffer.from(token.split(".")[1], "base64").toString()
          );
          userId = payload.sub || payload.userId || payload["cognito:username"];
        } catch (e) {
          userId = token;
        }
      } else {
        userId = token;
      }

      req.userId = userId;
    }
    next();
  } catch (error) {
    // Continue without auth
    next();
  }
}

