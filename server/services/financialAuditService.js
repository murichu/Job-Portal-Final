import FinancialAuditLog from "../models/FinancialAuditLog.js";

export const logFinancialEvent = async ({
  tenantId,
  actorId,
  action,
  entityType,
  entityId,
  amount,
  currency = "KES",
  req,
  before,
  after,
  metadata = {},
}) => {
  try {
    await FinancialAuditLog.create({
      tenantId,
      actorId,
      action,
      entityType,
      entityId,
      amount,
      currency,
      ip: req?.headers["x-forwarded-for"]?.split(",")[0] || req?.ip || "",
      userAgent: req?.headers["user-agent"] || "",
      before,
      after,
      metadata,
    });
  } catch (err) {
    console.error("Audit log failed", err);
  }
};
