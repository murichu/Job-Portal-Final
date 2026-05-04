import mongoose from "mongoose";

const refundRequestSchema = new mongoose.Schema(
  {
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "MpesaPayment", required: true, index: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending_review", "approved", "rejected", "processed"],
      default: "pending_review",
      index: true,
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

const RefundRequest = mongoose.models.RefundRequest || mongoose.model("RefundRequest", refundRequestSchema);
export default RefundRequest;
