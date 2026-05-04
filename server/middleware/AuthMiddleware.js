import jwt from "jsonwebtoken";
import Organization from "../models/Organization.js";

// Middleware to protect routes by verifying the token and attaching the organization to the request
export const protectCompany = async (req, res, next) => {
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

    // Reject user-scoped tokens for company routes (legacy tokens without role are still accepted)
    if (decoded.role && decoded.role !== "company") {
      return res.status(401).json({
        success: false,
        message: "Invalid token scope for company route.",
      });
    }

    // Check if token is expired (additional check)
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }

    // Find organization by decoded token ID and exclude the password field
    const organization = await Organization.findById(decoded.id)
      .select("-password")
      .lean();

    if (!organization) {
      return res
        .status(404)
        .json({ success: false, message: "Organization not found" });
    }

    // Attach organization info to the request for use in next handlers (as company for backward compatibility)
    req.company = organization;
    req.organization = organization;
    req.organizationId = organization._id;

    next(); // Proceed to next middleware or route handler
  } catch (error) {
    console.error("protectCompany error:", error);

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
