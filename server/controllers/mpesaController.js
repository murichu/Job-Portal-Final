import MpesaPayment from "../models/MpesaPayment.js";
import TenantSubscription from "../models/TenantSubscription.js";
import Invoice from "../models/Invoice.js";
import { stkPush } from "../utils/mpesa.js";
import { evaluateMpesaFraud } from "../services/mpesaFraudService.js";

export const createStkPush = async (req, res) => {
  const { phone, amount } = req.body;

  const response = await stkPush({ phone, amount, accountReference: "Subscription" });

  await MpesaPayment.create({
    userId: req.user._id,
    tenantId: req.user.tenantId,
    accountType: "tenant",
    phone,
    amount,
    merchantRequestId: response.MerchantRequestID,
    checkoutRequestId: response.CheckoutRequestID,
  });

  res.json({
    success: true,
    message: "M-Pesa prompt sent. Payment is processing.",
    checkoutRequestId: response.CheckoutRequestID,
    response,
  });
};

export const getPaymentStatus = async (req, res) => {
  const payment = await MpesaPayment.findOne({
    checkoutRequestId: req.params.checkoutRequestId,
    userId: req.user._id,
  }).select("status amount phone resultCode resultDesc mpesaReceiptNumber suspicious fraudReason createdAt updatedAt checkoutRequestId");

  if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

  const processing = payment.status === "pending" || payment.status === "retrying";

  res.json({ success: true, processing, payment });
};

export const handleMpesaCallback = async (req, res) => {
  if (!req.body.Body?.stkCallback) return res.sendStatus(400);

  const data = req.body.Body.stkCallback;
  const payment = await MpesaPayment.findOne({ checkoutRequestId: data.CheckoutRequestID });
  if (!payment) return res.sendStatus(404);

  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.ip;

  payment.callbackIp = ip;
  payment.status = data.ResultCode === 0 ? "paid" : "failed";
  payment.resultCode = data.ResultCode;
  payment.resultDesc = data.ResultDesc;
  payment.rawCallback = data;

  await evaluateMpesaFraud(payment, data, ip);

  if (payment.status === "paid" && !payment.suspicious) {
    const receipt = data.CallbackMetadata.Item.find((i) => i.Name === "MpesaReceiptNumber");
    payment.mpesaReceiptNumber = receipt?.Value || "";

    const sub = await TenantSubscription.findOne({ tenantId: payment.tenantId });
    if (sub) {
      sub.status = "active";
      sub.currentPeriodStart = new Date();
      sub.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      sub.nextInvoiceAt = sub.currentPeriodEnd;
      await sub.save();

      await Invoice.create({ tenantId: payment.tenantId, amount: payment.amount, status: "paid", paidAt: new Date() });
    }
  }

  await payment.save();

  if (global.io) {
    global.io.emit("payment_update", {
      provider: "mpesa",
      checkoutRequestId: payment.checkoutRequestId,
      status: payment.status,
      suspicious: payment.suspicious,
      message:
        payment.status === "paid"
          ? "Payment completed successfully."
          : payment.status === "failed"
            ? "Payment failed or was cancelled."
            : "Payment updated.",
    });
  }

  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
};
