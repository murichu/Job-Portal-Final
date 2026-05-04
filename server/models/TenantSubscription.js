import mongoose from "mongoose";

const tenantSubscriptionSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, unique: true, index: true },
    plan: {
      type: String,
      enum: ["starter", "growth", "enterprise"],
      default: "starter",
      index: true,
    },
    billingCycle: {
      type: String,
      enum: ["monthly"],
      default: "monthly",
    },
    currency: { type: String, default: "KES" },
    monthlyAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["trialing", "active", "past_due", "cancelled", "suspended"],
      default: "trialing",
      index: true,
    },
    currentPeriodStart: { type: Date, default: Date.now },
    currentPeriodEnd: { type: Date, required: true },
    nextInvoiceAt: { type: Date, required: true, index: true },
    trialEndsAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    limits: {
      users: { type: Number, default: 5 },
      jobs: { type: Number, default: 25 },
      downloads: { type: Number, default: 500 },
    },
  },
  { timestamps: true }
);

const TenantSubscription =
  mongoose.models.TenantSubscription || mongoose.model("TenantSubscription", tenantSubscriptionSchema);

export default TenantSubscription;
