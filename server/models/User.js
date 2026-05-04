import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    image: { type: String, required: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin", "super_admin"], default: "user", index: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null, index: true },
    activeSessionId: { type: String, default: null },
    activeDevice: { type: String, default: "" },
    emailVerified: { type: Boolean, default: false },
    lastLogin: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    resume: { type: String, default: "" },
  },
  { timestamps: true }
);

userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ tenantId: 1, role: 1 });

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
