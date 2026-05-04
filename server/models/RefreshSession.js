import mongoose from "mongoose";

const refreshSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null, index: true },
    sessionId: { type: String, required: true, unique: true, index: true },
    refreshTokenHash: { type: String, required: true },
    device: { type: String, default: "" },
    ip: { type: String, default: "" },
    expiresAt: { type: Date, required: true, index: true },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

refreshSessionSchema.index({ userId: 1, revokedAt: 1 });

const RefreshSession = mongoose.models.RefreshSession || mongoose.model("RefreshSession", refreshSessionSchema);
export default RefreshSession;
