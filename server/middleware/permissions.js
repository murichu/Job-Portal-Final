import { userHasPermission } from "../config/roles.js";

export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!userHasPermission(req.user, permission)) {
      return res.status(403).json({ message: "Permission denied" });
    }
    next();
  };
};
