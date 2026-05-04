import TenantSubscription from "../models/TenantSubscription.js";
import Invoice from "../models/Invoice.js";
import MpesaPayment from "../models/MpesaPayment.js";

export const suspendUnpaidTenants = async () => {
  const overdue = await TenantSubscription.find({
    nextInvoiceAt: { $lt: new Date() },
    status: "active"
  });

  for (const sub of overdue) {
    const unpaid = await Invoice.findOne({ tenantId: sub.tenantId, status: "pending" });

    if (unpaid) {
      sub.status = "suspended";
      await sub.save();
    }
  }
};

export const retryFailedPayments = async () => {
  const failed = await MpesaPayment.find({ status: "failed" });

  for (const payment of failed) {
    console.log("Retry logic placeholder for", payment._id);
    // you can re-trigger stk push here
  }
};

export const reconcilePayments = async () => {
  const payments = await MpesaPayment.find({ status: "paid" });

  for (const p of payments) {
    const invoice = await Invoice.findOne({ tenantId: p.tenantId, status: "pending" });

    if (invoice) {
      invoice.status = "paid";
      invoice.paidAt = new Date();
      await invoice.save();
    }
  }
};
