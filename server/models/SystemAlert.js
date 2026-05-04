import mongoose from "mongoose";

const systemAlertSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, index: true },
    severity: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium", index: true },
    message: { type: String, required: true },
    metadata: { type: Object, default: {} },
    acknowledged: { type: Boolean, default: false, index: true },
    acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    acknowledgedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const SystemAlert = mongoose.models.SystemAlert || mongoose.model("SystemAlert", systemAlertSchema);
export default SystemAlert;
