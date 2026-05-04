import express from "express";
import FileDownload from "../models/FileDownload.js";
import { protectUser } from "../middleware/userAuth.js";
import { requireAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

// Global analytics
router.get("/analytics", protectUser, requireAdmin, async (req, res) => {
  const total = await FileDownload.countDocuments({ status: "success" });

  const topUsers = await FileDownload.aggregate([
    { $match: { status: "success" } },
    { $group: { _id: "$ownerUserId", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  const suspiciousIPs = await FileDownload.aggregate([
    { $match: { status: "invalid" } },
    { $group: { _id: "$ipAddress", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  res.json({ success: true, total, topUsers, suspiciousIPs });
});

export default router;
