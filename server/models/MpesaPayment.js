import mongoose from "mongoose";

const mpesaPaymentSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice", default: null, index: true },
    accountType: { type: String, enum: ["tenant", "user"], required: true, index: true },
    phone: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    merchantRequestId: { type: String, default: "", index: true },
    checkoutRequestId: { type: String, default: "", unique: true, sparse: true, index: true },
    mpesaReceiptNumber: { type: String, default: "", unique: true, sparse: true, index: true },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled", "flagged", "retrying"],
      default: "pending",
      index: true,
    },
    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 3 },
    lastRetryAt: { type: Date, default: null },
    suspicious: { type: Boolean, default: false, index: true },
    fraudReason: { type: String, default: "" },
    resultCode: { type: Number, default: null },
    resultDesc: { type: String, default: "" },
    callbackIp: { type: String, default: "" },
    rawCallback: { type: Object, default: null },
  },
  { timestamps: true }
);

mpesaPaymentSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
mpesaPaymentSchema.index({ suspicious: 1, createdAt: -1 });

const MpesaPayment = mongoose.models.MpesaPayment || mongoose.model("MpesaPayment", mpesaPaymentSchema);
export default MpesaPayment;
