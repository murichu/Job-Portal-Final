import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "KES" },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
      index: true,
    },
    periodStart: Date,
    periodEnd: Date,
    paidAt: Date,
  },
  { timestamps: true }
);

const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);
export default Invoice;
