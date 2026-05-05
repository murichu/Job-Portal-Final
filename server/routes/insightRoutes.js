import express from "express";
import { protectUser } from "../middleware/userAuth.js";
import { requirePermission } from "../middleware/permissions.js";
import { getActivity, getAuditLogs, getKpis, getSessions } from "../controllers/insightController.js";

const router = express.Router();

router.get("/kpis", protectUser, requirePermission("billing:read"), getKpis);
router.get("/sessions", protectUser, requirePermission("read:tenant"), getSessions);
router.get("/activity", protectUser, requirePermission("read:tenant"), getActivity);
router.get("/audit-logs", protectUser, requirePermission("read:tenant"), getAuditLogs);

export default router;
