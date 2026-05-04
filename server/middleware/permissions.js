export const requirePermission = (permission) => {
  return (req, res, next) => {
    const role = req.user?.role;

    const rolePermissions = {
      user: ["read:own"],
      admin: ["read:tenant", "write:tenant"],
      super_admin: ["*"]
    };

    const perms = rolePermissions[role] || [];

    if (perms.includes("*") || perms.includes(permission)) {
      return next();
    }

    return res.status(403).json({ message: "Permission denied" });
  };
};
