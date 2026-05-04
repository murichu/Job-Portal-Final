import express from "express";
import Invoice from "../models/Invoice.js";
import MpesaPayment from "../models/MpesaPayment.js";
import RefundRequest from "../models/RefundRequest.js";
import FinancialAuditLog from "../models/FinancialAuditLog.js";
import { protectUser } from "../middleware/userAuth.js";

const router = express.Router();

const monthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

router.get("/dashboard", protectUser, async (req, res) => {
  const tenantId = req.user.tenantId;
  const [invoices, payments, refunds, logs] = await Promise.all([
    Invoice.find({ tenantId }).sort({ createdAt: -1 }).limit(250),
    MpesaPayment.find({ tenantId }).sort({ createdAt: -1 }).limit(250),
    RefundRequest.find({ tenantId }).sort({ createdAt: -1 }).limit(100),
    FinancialAuditLog.find({ tenantId }).sort({ createdAt: -1 }).limit(20),
  ]);

  const paidInvoices = invoices.filter((i) => i.status === "paid");
  const pendingInvoices = invoices.filter((i) => i.status === "pending");
  const refundedInvoices = invoices.filter((i) => i.status === "refunded");

  const totalRevenue = paidInvoices.reduce((s, i) => s + (i.amount || 0), 0);
  const totalTax = paidInvoices.reduce((s, i) => s + (i.taxAmount || 0), 0);
  const pendingRevenue = pendingInvoices.reduce((s, i) => s + (i.amount || 0), 0);
  const refunded = refundedInvoices.reduce((s, i) => s + (i.amount || 0), 0);
  const paidCount = paidInvoices.length;
  const failedPayments = payments.filter((p) => p.status === "failed").length;
  const successfulPayments = payments.filter((p) => p.status === "paid").length;
  const suspiciousPayments = payments.filter((p) => p.suspicious).length;
  const refundRate = paidCount ? Number(((refunds.length / paidCount) * 100).toFixed(2)) : 0;

  const monthlyMap = new Map();
  paidInvoices.forEach((invoice) => {
    const key = monthKey(invoice.createdAt);
    const item = monthlyMap.get(key) || { month: key, revenue: 0, tax: 0, invoices: 0 };
    item.revenue += invoice.amount || 0;
    item.tax += invoice.taxAmount || 0;
    item.invoices += 1;
    monthlyMap.set(key, item);
  });

  const statusBreakdown = ["paid", "pending", "failed", "refunded", "void"].map((status) => ({
    status,
    count: invoices.filter((invoice) => invoice.status === status).length,
  }));

  const paymentBreakdown = ["paid", "pending", "failed", "flagged", "retrying", "cancelled"].map((status) => ({
    status,
    count: payments.filter((payment) => payment.status === status).length,
  }));

  const recentInvoices = invoices.slice(0, 10).map((invoice) => ({
    _id: invoice._id,
    invoiceNumber: invoice.invoiceNumber,
    amount: invoice.amount,
    taxAmount: invoice.taxAmount,
    currency: invoice.currency,
    status: invoice.status,
    createdAt: invoice.createdAt,
  }));

  res.json({
    success: true,
    stats: {
      totalRevenue,
      totalTax,
      netRevenue: totalRevenue - totalTax,
      pendingRevenue,
      refunded,
      paidCount,
      failedPayments,
      successfulPayments,
      suspiciousPayments,
      refundRate,
      averageInvoiceValue: paidCount ? Number((totalRevenue / paidCount).toFixed(2)) : 0,
    },
    monthlyRevenue: Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month)),
    statusBreakdown,
    paymentBreakdown,
    recentInvoices,
    recentRefunds: refunds.slice(0, 10),
    recentActivity: logs,
  });
});

router.get("/audit-logs", protectUser, async (req, res) => {
  const logs = await FinancialAuditLog.find({ tenantId: req.user.tenantId }).sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, logs });
});

export default router;
