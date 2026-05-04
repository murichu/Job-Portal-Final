import express from "express";
import { protectUser } from "../middleware/userAuth.js";
import { requirePermission } from "../middleware/permissions.js";
import { readRecentLogs } from "../utils/logger.js";

const router = express.Router();

router.get("/logs", protectUser, requirePermission("read:tenant"), (req, res) => {
  const { limit = 200, level, search } = req.query;
  const logs = readRecentLogs({ limit, level, search });
  res.json({ success: true, logs });
});

export default router;
