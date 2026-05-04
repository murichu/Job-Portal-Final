export const ROLE_PERMISSIONS = {
  user: ["read:own"],
  support_agent: ["read:tenant", "refund:read"],
  finance_viewer: ["read:tenant", "billing:read", "refund:read", "payment:read"],
  finance_admin: ["read:tenant", "billing:read", "payment:read", "refund:read", "refund:approve", "refund:reject", "refund:process"],
  admin: ["read:tenant", "write:tenant", "billing:read", "payment:read", "refund:read", "refund:approve", "refund:reject"],
  super_admin: ["*"],
};

export const userHasPermission = (user, permission) => {
  const rolePermissions = ROLE_PERMISSIONS[user?.role] || [];
  const directPermissions = user?.permissions || [];
  return rolePermissions.includes("*") || rolePermissions.includes(permission) || directPermissions.includes(permission);
};
