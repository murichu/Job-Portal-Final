import mongoose from "mongoose";

const auditSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  action: String,
  ip: String,
  userAgent: String,
  metadata: Object
}, { timestamps: true });

const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", auditSchema);
export default AuditLog;
