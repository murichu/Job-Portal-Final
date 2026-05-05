import Invoice from "../models/Invoice.js";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";
import RefreshSession from "../models/RefreshSession.js";

const tenantFilter = (req) => (req.user.role === "super_admin" ? {} : { tenantId: req.user.tenantId });

export const getKpis = async (req, res) => {
  const filter = tenantFilter(req);

  const [paid, pending, users, activeSessions] = await Promise.all([
    Invoice.aggregate([
      { $match: { ...filter, status: "paid" } },
      { $group: { _id: null, revenue: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
    Invoice.countDocuments({ ...filter, status: "pending" }),
    User.countDocuments(filter),
    RefreshSession.countDocuments({ ...filter, revokedAt: null, expiresAt: { $gt: new Date() } }),
  ]);

  const monthlyRevenue = await Invoice.aggregate([
    { $match: { ...filter, status: "paid" } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        revenue: { $sum: "$amount" },
        invoices: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const churnProxy = await Invoice.countDocuments({ ...filter, status: "failed" });

  res.json({
    success: true,
    kpis: {
      revenue: paid[0]?.revenue || 0,
      paidInvoices: paid[0]?.count || 0,
      pendingInvoices: pending,
      users,
      activeSessions,
      churnProxy,
    },
    monthlyRevenue,
  });
};

export const getSessions = async (req, res) => {
  const sessions = await RefreshSession.find(tenantFilter(req))
    .sort({ createdAt: -1 })
    .limit(100)
    .populate("userId", "name email role");
  res.json({ success: true, sessions });
};

export const getActivity = async (req, res) => {
  const activity = await AuditLog.find(tenantFilter(req))
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("userId", "name email role");
  res.json({ success: true, activity });
};

export const getAuditLogs = async (req, res) => {
  const { q = "", action = "all", from, to, ip, page = 1, limit = 20 } = req.query;
  const filter = { ...tenantFilter(req) };

  if (action !== "all") filter.action = action;
  if (ip) filter.ip = ip;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const query = AuditLog.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate("userId", "name email role");

  const [logs, total] = await Promise.all([query, AuditLog.countDocuments(filter)]);

  const filteredLogs = q
    ? logs.filter((log) => JSON.stringify(log).toLowerCase().includes(String(q).toLowerCase()))
    : logs;

  res.json({ success: true, logs: filteredLogs, total });
};
