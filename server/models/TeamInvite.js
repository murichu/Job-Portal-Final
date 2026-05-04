import mongoose from "mongoose";

const inviteSchema = new mongoose.Schema({
  email: { type: String, required: true },
  role: { type: String, required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  token: { type: String, required: true, unique: true },
  status: { type: String, enum: ["pending", "accepted", "expired"], default: "pending" }
}, { timestamps: true });

export default mongoose.models.TeamInvite || mongoose.model("TeamInvite", inviteSchema);
