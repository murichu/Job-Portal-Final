import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Organization from "../models/Organization.js";

/**
 * RBAC Permission Definitions
 */
export const PERMISSIONS = {
  // Job permissions
  JOBS_CREATE: "jobs.create",
  JOBS_EDIT: "jobs.edit",
  JOBS_DELETE: "jobs.delete",
  JOBS_VIEW_ALL: "jobs.view_all",
  
  // Application permissions
  APPLICATIONS_VIEW: "applications.view",
  APPLICATIONS_MANAGE: "applications.manage",
  
  // Report permissions
  REPORTS_VIEW: "reports.view",
  
  // Company permissions
  COMPANY_MANAGE: "company.manage",
  
  // Organization permissions
  ORGANIZATION_MANAGE: "organization.manage",
  
  // User permissions
  USERS_MANAGE: "users.manage",
};

/**
 * Role-based default permissions
 */
export const ROLE_PERMISSIONS = {
  owner: Object.values(PERMISSIONS),
  admin: [
    PERMISSIONS.JOBS_CREATE,
    PERMISSIONS.JOBS_EDIT,
    PERMISSIONS.JOBS_VIEW_ALL,
    PERMISSIONS.APPLICATIONS_VIEW,
    PERMISSIONS.APPLICATIONS_MANAGE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.COMPANY_MANAGE,
    PERMISSIONS.USERS_MANAGE,
  ],
  user: [
    PERMISSIONS.JOBS_CREATE,
    PERMISSIONS.JOBS_EDIT,
    PERMISSIONS.APPLICATIONS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
  ],
};

/**
 * Get permissions for a role
 */
export const getPermissionsForRole = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

/**
 * Check if user has specific permission
 */
export const hasPermission = (user, permission) => {
  if (!user) return false;
  
  // Owners have all permissions
  if (user.role === "owner") return true;
  
  // Check explicit permissions
  if (user.permissions && user.permissions.includes(permission)) {
    return true;
  }
  
  // Check role-based permissions
  const rolePermissions = getPermissionsForRole(user.role);
  return rolePermissions.includes(permission);
};

/**
 * Middleware to authenticate and attach user with organization context
 */
export const authenticateWithOrg = async (req, res, next) => {
  // Support both Authorization header formats
  const authHeader = req.headers.authorization || req.headers.token;
  let token;
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else if (authHeader) {
    token = authHeader;
  }

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: "Not Authorized, Login again" 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token is expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }

    // Find user by decoded token ID
    const user = await User.findById(decoded.id)
      .select("-password")
      .populate("organizationId")
      .lean();

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Attach user info to request
    req.user = user;
    req.userId = user._id;
    
    // Attach organization context if user belongs to one
    if (user.organizationId) {
      req.organizationId = user.organizationId._id;
      req.organization = user.organizationId;
    }

    next();
  } catch (error) {
    console.error("authenticateWithOrg error:", error);

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

/**
 * Middleware to check if user has required permission
 * @param {string|string[]} requiredPermissions - Single permission or array of permissions
 * @param {boolean} requireAll - If true, user must have ALL permissions; if false, ANY permission suffices
 */
export const requirePermission = (requiredPermissions, requireAll = false) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const permissionsArray = Array.isArray(requiredPermissions) 
        ? requiredPermissions 
        : [requiredPermissions];

      let hasAccess;
      
      if (requireAll) {
        // User must have ALL permissions
        hasAccess = permissionsArray.every(permission => hasPermission(user, permission));
      } else {
        // User must have ANY permission
        hasAccess = permissionsArray.some(permission => hasPermission(user, permission));
      }

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions to perform this action",
          required: permissionsArray,
        });
      }

      next();
    } catch (error) {
      console.error("requirePermission error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error during permission check",
      });
    }
  };
};

/**
 * Middleware to enforce organization isolation
 * Ensures users can only access resources within their organization
 */
export const enforceOrgIsolation = () => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Users without organization can only access public resources
      if (!user.organizationId) {
        req.isOrgScoped = false;
        return next();
      }

      req.isOrgScoped = true;
      req.organizationId = user.organizationId;

      // Override query parameters to enforce organization filter
      const originalQuery = req.query;
      
      // For GET requests, ensure organization filter is applied
      if (req.method === "GET") {
        // Store original query for reference
        req.originalQuery = { ...originalQuery };
        
        // Force organization filter on list queries
        if (!originalQuery.organizationId) {
          req.query.organizationId = req.organizationId;
        }
      }

      next();
    } catch (error) {
      console.error("enforceOrgIsolation error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error during organization isolation",
      });
    }
  };
};

/**
 * Middleware to validate organization membership for resource access
 * @param {string} resourceIdParam - Name of the route parameter containing the resource ID
 * @param {string} model - Mongoose model to query
 * @param {string} orgField - Field name in the model that stores organizationId
 */
export const validateOrgMembership = (resourceIdParam, model, orgField = "organizationId") => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Super admins/owners can access all resources
      if (user.role === "owner") {
        return next();
      }

      // Users without organization restriction
      if (!user.organizationId) {
        return next();
      }

      const resourceId = req.params[resourceIdParam];
      
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: "Resource ID is required",
        });
      }

      // Find the resource and verify organization membership
      const resource = await model.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: "Resource not found",
        });
      }

      // Check if resource belongs to user's organization
      const resourceOrgId = resource[orgField];
      
      if (resourceOrgId && resourceOrgId.toString() !== user.organizationId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Access denied: Resource does not belong to your organization",
        });
      }

      // Attach resource to request for downstream handlers
      req.resource = resource;
      next();
    } catch (error) {
      console.error("validateOrgMembership error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error during organization validation",
      });
    }
  };
};

/**
 * Combined middleware for company routes with organization awareness
 */
export const protectCompanyWithOrg = async (req, res, next) => {
  // Support both Authorization header formats
  const authHeader = req.headers.authorization || req.headers.token;
  let token;
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else if (authHeader) {
    token = authHeader;
  }

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: "Not Authorized, Login again" 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Reject user-scoped tokens for company routes
    if (decoded.role && decoded.role === "user") {
      return res.status(401).json({
        success: false,
        message: "Invalid token scope for company route.",
      });
    }

    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }

    // Find organization by decoded token ID (organizations now serve as companies)
    const organization = await Organization.findById(decoded.id)
      .select("-password")
      .lean();

    if (!organization) {
      return res.status(404).json({ 
        success: false, 
        message: "Organization not found" 
      });
    }

    // Attach organization info to request (acting as company for backward compatibility)
    req.company = organization;
    req.organization = organization;
    req.organizationId = organization._id;

    next();
  } catch (error) {
    console.error("protectCompanyWithOrg error:", error);

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

/**
 * Middleware to check organization subscription limits
 */
export const checkOrgLimit = (resourceType) => {
  return async (req, res, next) => {
    try {
      const organization = req.organization;
      
      if (!organization) {
        return next(); // No organization, skip limit check
      }

      const subscription = organization.subscription;
      
      switch (resourceType) {
        case "users":
          if (!await organization.canAddUser()) {
            return res.status(403).json({
              success: false,
              message: `Organization limit reached: Maximum ${subscription.maxUsers} users allowed`,
            });
          }
          break;
          
        case "jobs":
          if (!await organization.canPostJob()) {
            return res.status(403).json({
              success: false,
              message: `Organization limit reached: Maximum ${subscription.maxJobs} jobs allowed`,
            });
          }
          break;
          
        default:
          break;
      }

      next();
    } catch (error) {
      console.error("checkOrgLimit error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error during limit check",
      });
    }
  };
};

export default {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  getPermissionsForRole,
  hasPermission,
  authenticateWithOrg,
  requirePermission,
  enforceOrgIsolation,
  validateOrgMembership,
  protectCompanyWithOrg,
  checkOrgLimit,
};
