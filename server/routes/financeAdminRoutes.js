import express from "express";
import { protectUser } from "../middleware/userAuth.js";
import { getFinanceAuditLogs, getFinanceDashboard } from "../controllers/financeAdminController.js";

const router = express.Router();

router.get("/dashboard", protectUser, getFinanceDashboard);
router.get("/audit-logs", protectUser, getFinanceAuditLogs);

export default router;
