import express from "express";
import Invoice from "../models/Invoice.js";
import FinancialAuditLog from "../models/FinancialAuditLog.js";
import { protectUser } from "../middleware/userAuth.js";

const router = express.Router();

router.get("/dashboard", protectUser, async (req, res) => {
  const invoices = await Invoice.find({ tenantId: req.user.tenantId });

  const totalRevenue = invoices.reduce((s, i) => s + i.amount, 0);
  const totalTax = invoices.reduce((s, i) => s + i.taxAmount, 0);
  const refunded = invoices.filter(i => i.status === "refunded").reduce((s, i) => s + i.amount, 0);

  res.json({
    success: true,
    stats: {
      totalRevenue,
      totalTax,
      netRevenue: totalRevenue - totalTax,
      refunded
    }
  });
});

router.get("/audit-logs", protectUser, async (req, res) => {
  const logs = await FinancialAuditLog.find({ tenantId: req.user.tenantId }).sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, logs });
});

export default router;
