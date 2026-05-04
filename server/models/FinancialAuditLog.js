import mongoose from "mongoose";

const financialAuditLogSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null, index: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    action: { type: String, required: true, index: true },
    entityType: { type: String, required: true, index: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
    amount: { type: Number, default: 0 },
    currency: { type: String, default: "KES" },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    before: { type: Object, default: null },
    after: { type: Object, default: null },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

financialAuditLogSchema.index({ tenantId: 1, createdAt: -1 });
financialAuditLogSchema.index({ action: 1, createdAt: -1 });

const FinancialAuditLog =
  mongoose.models.FinancialAuditLog || mongoose.model("FinancialAuditLog", financialAuditLogSchema);

export default FinancialAuditLog;
