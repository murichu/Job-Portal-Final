import express from "express";
import TenantSubscription from "../models/TenantSubscription.js";
import Invoice from "../models/Invoice.js";
import { protectUser } from "../middleware/userAuth.js";

const router = express.Router();

// Get current subscription
router.get("/subscription", protectUser, async (req, res) => {
  const sub = await TenantSubscription.findOne({ tenantId: req.user.tenantId });
  res.json({ success: true, sub });
});

// List invoices
router.get("/invoices", protectUser, async (req, res) => {
  const invoices = await Invoice.find({ tenantId: req.user.tenantId }).sort({ createdAt: -1 });
  res.json({ success: true, invoices });
});

export default router;
