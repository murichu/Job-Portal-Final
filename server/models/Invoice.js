import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    subtotal: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0.16 },
    taxAmount: { type: Number, default: 0 },
    amount: { type: Number, required: true },
    currency: { type: String, default: "KES" },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "void"],
      default: "pending",
      index: true,
    },
    invoiceNumber: { type: String, unique: true, sparse: true, index: true },
    taxLabel: { type: String, default: "VAT" },
    periodStart: Date,
    periodEnd: Date,
    paidAt: Date,
  },
  { timestamps: true }
);

invoiceSchema.pre("save", function (next) {
  if (!this.subtotal) {
    this.subtotal = Number((this.amount / (1 + this.taxRate)).toFixed(2));
  }

  this.taxAmount = Number((this.amount - this.subtotal).toFixed(2));

  if (!this.invoiceNumber) {
    this.invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  next();
});

const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);
export default Invoice;
