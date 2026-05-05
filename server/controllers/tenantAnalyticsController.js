import Invoice from "../models/Invoice.js";
import MpesaPayment from "../models/MpesaPayment.js";
import RefundRequest from "../models/RefundRequest.js";
import TenantSubscription from "../models/TenantSubscription.js";
import Company from "../models/Company.js";

const rangeStart = (range = "30d") => {
  const days = range === "24h" ? 1 : range === "7d" ? 7 : range === "90d" ? 90 : 30;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
};

const byMonth = (items, field = "amount") => {
  const map = new Map();
  items.forEach((item) => {
    const d = new Date(item.createdAt);
    const key = `${d.getMonth() + 1}/${d.getFullYear()}`;
    map.set(key, (map.get(key) || 0) + Number(item[field] || 0));
  });
  return Array.from(map.entries()).map(([month, value]) => ({ month, value }));
};

export const getTenantsAnalytics = async (req, res) => {
  if (req.user.role !== "super_admin") return res.status(403).json({ success: false, message: "Super admin only" });

  const { range = "30d" } = req.query;
  const start = rangeStart(range);

  const tenants = await Company.find().sort({ createdAt: -1 }).limit(200);
  const tenantIds = tenants.map((t) => t._id);

  const [invoices, payments, refunds, subscriptions] = await Promise.all([
    Invoice.find({ tenantId: { $in: tenantIds }, createdAt: { $gte: start } }),
    MpesaPayment.find({ tenantId: { $in: tenantIds }, createdAt: { $gte: start } }),
    RefundRequest.find({ tenantId: { $in: tenantIds }, createdAt: { $gte: start } }),
    TenantSubscription.find({ tenantId: { $in: tenantIds } }),
  ]);

  const rows = tenants.map((tenant) => {
    const id = String(tenant._id);
    const tInvoices = invoices.filter((i) => String(i.tenantId) === id);
    const tPayments = payments.filter((p) => String(p.tenantId) === id);
    const tRefunds = refunds.filter((r) => String(r.tenantId) === id);
    const subscription = subscriptions.find((s) => String(s.tenantId) === id);
    const paidInvoices = tInvoices.filter((i) => i.status === "paid");

    return {
      tenantId: tenant._id,
      name: tenant.name || tenant.companyName || tenant.email || "Unnamed tenant",
      email: tenant.email,
      plan: subscription?.plan || "free",
      subscriptionStatus: subscription?.status || "unknown",
      revenue: paidInvoices.reduce((sum, i) => sum + Number(i.amount || 0), 0),
      invoices: tInvoices.length,
      paidInvoices: paidInvoices.length,
      failedPayments: tPayments.filter((p) => p.status === "failed").length,
      suspiciousPayments: tPayments.filter((p) => p.suspicious).length,
      pendingRefunds: tRefunds.filter((r) => r.status === "pending_review").length,
      createdAt: tenant.createdAt,
    };
  });

  res.json({ success: true, range, tenants: rows });
};

export const getTenantAnalytics = async (req, res) => {
  if (req.user.role !== "super_admin" && String(req.user.tenantId) !== req.params.tenantId) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  const { range = "30d" } = req.query;
  const start = rangeStart(range);
  const tenantId = req.params.tenantId;

  const [tenant, subscription, invoices, payments, refunds] = await Promise.all([
    Company.findById(tenantId),
    TenantSubscription.findOne({ tenantId }),
    Invoice.find({ tenantId, createdAt: { $gte: start } }).sort({ createdAt: -1 }),
    MpesaPayment.find({ tenantId, createdAt: { $gte: start } }).sort({ createdAt: -1 }),
    RefundRequest.find({ tenantId, createdAt: { $gte: start } }).sort({ createdAt: -1 }),
  ]);

  const paidInvoices = invoices.filter((i) => i.status === "paid");
  const revenue = paidInvoices.reduce((sum, i) => sum + Number(i.amount || 0), 0);
  const tax = paidInvoices.reduce((sum, i) => sum + Number(i.taxAmount || 0), 0);

  res.json({
    success: true,
    tenant,
    subscription,
    stats: {
      revenue,
      tax,
      netRevenue: revenue - tax,
      invoices: invoices.length,
      paidInvoices: paidInvoices.length,
      failedPayments: payments.filter((p) => p.status === "failed").length,
      suspiciousPayments: payments.filter((p) => p.suspicious).length,
      pendingRefunds: refunds.filter((r) => r.status === "pending_review").length,
    },
    revenueTrend: byMonth(paidInvoices),
    invoices: invoices.slice(0, 20),
    payments: payments.slice(0, 20),
    refunds: refunds.slice(0, 20),
  });
};
