import jwt from "jsonwebtoken";
import User from "../models/User.js";
import rateLimit from "express-rate-limit";

// Rate limiting middleware for protected routes
export const protectedRouteRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increased limit for better user experience
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/';
  }
});

// Middleware to protect routes by verifying the token and attaching the user to the request
export const protectUser = async (req, res, next) => {
  // Support both Authorization header formats
  const authHeader = req.headers.authorization || req.headers.token;
  let token;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7); // Remove 'Bearer ' prefix
  } else if (authHeader) {
    token = authHeader; // Fallback for legacy token header
  }

  // If no token is provided, deny access
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not Authorized, Login again" });
  }

  try {
    // Verify token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Reject company-scoped tokens for user routes (legacy tokens without role are still accepted)
    if (decoded.role && decoded.role !== "user") {
      return res.status(401).json({
        success: false,
        message: "Invalid token scope for user route.",
      });
    }

    // Check if token is expired (additional check)
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }

    // Find user by decoded token ID and exclude the password field
    const user = await User.findById(decoded.id).select("-password").lean();

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Attach user info to the request for use in next handlers
    req.user = user;
    req.userId = user._id; // Also attach just the ID for convenience

    next(); // Proceed to next middleware or route handler
  } catch (error) {
    console.error("protectUser error:", error);

    // Handle different JWT errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Authentication failed. Please login again.",
      });
    }
  }
};

// Optional middleware for routes that work with or without authentication
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.token;
  let token;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else if (authHeader) {
    token = authHeader;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role && decoded.role !== "user") {
        return next();
      }
      const user = await User.findById(decoded.id).select("-password").lean();

      if (user) {
        req.user = user;
        req.userId = user._id;
      }
    } catch (error) {
      // Silently fail for optional auth
      console.log("Optional auth failed:", error.message);
    }
  }

  next();
};
