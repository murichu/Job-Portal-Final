import express from "express";
import { protectUser } from "../middleware/userAuth.js";
import { getTenantAnalytics, getTenantsAnalytics } from "../controllers/tenantAnalyticsController.js";

const router = express.Router();

router.get("/tenants", protectUser, getTenantsAnalytics);
router.get("/tenants/:tenantId", protectUser, getTenantAnalytics);

export default router;
