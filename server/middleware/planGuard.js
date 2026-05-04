import TenantSubscription from "../models/TenantSubscription.js";
import { hasPlanFeature } from "../config/plans.js";

export const requirePlanFeature = (feature) => {
  return async (req, res, next) => {
    const sub = await TenantSubscription.findOne({ tenantId: req.user.tenantId });

    if (!sub) return res.status(403).json({ message: "No subscription" });

    if (!hasPlanFeature(sub.plan, feature)) {
      return res.status(403).json({ message: "Upgrade plan to access this feature" });
    }

    next();
  };
};
