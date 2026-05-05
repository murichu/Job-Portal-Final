import Invoice from "../models/Invoice.js";
import MpesaPayment from "../models/MpesaPayment.js";
import RefundRequest from "../models/RefundRequest.js";
import TenantSubscription from "../models/TenantSubscription.js";
import FinancialAuditLog from "../models/FinancialAuditLog.js";
import SystemAlert from "../models/SystemAlert.js";

const tenantScope = (req) => (req.user.role === "super_admin" ? {} : { tenantId: req.user.tenantId });

const buildMonthlyRevenue = (invoices) => {
  const map = new Map();
  invoices.forEach((invoice) => {
    const date = new Date(invoice.createdAt);
    const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
    map.set(key, (map.get(key) || 0) + Number(invoice.amount || 0));
  });
  return Array.from(map.entries()).map(([month, revenue]) => ({ month, revenue }));
};

export const getAdminFinanceDashboard = async (req, res) => {
  const scope = tenantScope(req);

  const [invoices, payments, refunds, logs, alerts, subscription] = await Promise.all([
    Invoice.find(scope).sort({ createdAt: -1 }).limit(200),
    MpesaPayment.find(scope).sort({ createdAt: -1 }).limit(100),
    RefundRequest.find(scope).sort({ createdAt: -1 }).limit(50).populate("userId", "name email"),
    FinancialAuditLog.find(scope).sort({ createdAt: -1 }).limit(100).populate("actorId", "name email role"),
    SystemAlert.find({ type: { $regex: "finance|fraud|payment", $options: "i" } }).sort({ createdAt: -1 }).limit(25),
    TenantSubscription.findOne({ tenantId: req.user.tenantId }),
  ]);

  const paidInvoices = invoices.filter((i) => i.status === "paid");
  const failedInvoices = invoices.filter((i) => i.status === "failed");
  const pendingInvoices = invoices.filter((i) => i.status === "pending");
  const refundedInvoices = invoices.filter((i) => i.status === "refunded");

  const totalRevenue = paidInvoices.reduce((sum, i) => sum + Number(i.amount || 0), 0);
  const totalTax = paidInvoices.reduce((sum, i) => sum + Number(i.taxAmount || 0), 0);
  const refunded = refundedInvoices.reduce((sum, i) => sum + Number(i.amount || 0), 0);

  res.json({
    success: true,
    stats: {
      totalRevenue,
      totalTax,
      netRevenue: totalRevenue - totalTax,
      refunded,
      paidInvoices: paidInvoices.length,
      failedInvoices: failedInvoices.length,
      pendingInvoices: pendingInvoices.length,
      averageInvoiceValue: paidInvoices.length ? Math.round(totalRevenue / paidInvoices.length) : 0,
      suspiciousPayments: payments.filter((p) => p.suspicious).length,
      failedPayments: payments.filter((p) => p.status === "failed").length,
    },
    subscription,
    monthlyRevenue: buildMonthlyRevenue(paidInvoices),
    recentInvoices: invoices.slice(0, 12),
    recentPayments: payments.slice(0, 12),
    pendingRefunds: refunds.filter((r) => r.status === "pending_review"),
    auditLogs: logs,
    alerts,
  });
};

export const getCompanyDashboard = async (req, res) => {
  const scope = tenantScope(req);

  const [subscription, invoices, payments, refunds, alerts] = await Promise.all([
    TenantSubscription.findOne({ tenantId: req.user.tenantId }),
    Invoice.find(scope).sort({ createdAt: -1 }).limit(50),
    MpesaPayment.find(scope).sort({ createdAt: -1 }).limit(50),
    RefundRequest.find(scope).sort({ createdAt: -1 }).limit(20),
    SystemAlert.find().sort({ createdAt: -1 }).limit(10),
  ]);

  const paidInvoices = invoices.filter((i) => i.status === "paid");
  const totalRevenue = paidInvoices.reduce((sum, i) => sum + Number(i.amount || 0), 0);

  res.json({
    success: true,
    stats: {
      totalRevenue,
      invoices: invoices.length,
      paidInvoices: paidInvoices.length,
      pendingInvoices: invoices.filter((i) => i.status === "pending").length,
      failedPayments: payments.filter((p) => p.status === "failed").length,
      pendingRefunds: refunds.filter((r) => r.status === "pending_review").length,
    },
    subscription,
    invoices: invoices.slice(0, 8),
    payments: payments.slice(0, 8),
    refunds,
    alerts,
    monthlyRevenue: buildMonthlyRevenue(paidInvoices),
  });
};

export const getPlatformDashboard = async (req, res) => {
  const [invoices, alerts, refunds] = await Promise.all([
    Invoice.find().sort({ createdAt: -1 }).limit(300),
    SystemAlert.find().sort({ createdAt: -1 }).limit(50),
    RefundRequest.find().sort({ createdAt: -1 }).limit(50),
  ]);

  const paidInvoices = invoices.filter((i) => i.status === "paid");
  const totalRevenue = paidInvoices.reduce((sum, i) => sum + Number(i.amount || 0), 0);

  res.json({
    success: true,
    stats: {
      totalRevenue,
      invoices: invoices.length,
      alerts: alerts.length,
      openRefunds: refunds.filter((r) => r.status === "pending_review").length,
      failedInvoices: invoices.filter((i) => i.status === "failed").length,
    },
    monthlyRevenue: buildMonthlyRevenue(paidInvoices),
    recentInvoices: invoices.slice(0, 10),
    alerts,
    refunds,
  });
};
