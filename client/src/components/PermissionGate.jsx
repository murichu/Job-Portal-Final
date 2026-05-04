export default function PermissionGate({ allowed, user, children }) {
  if (!user) return null;

  const has = user.permissions?.includes(allowed) || user.role === "super_admin";

  return has ? children : null;
}
