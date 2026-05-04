import express from "express";
import MpesaPayment from "../models/MpesaPayment.js";
import TenantSubscription from "../models/TenantSubscription.js";
import Invoice from "../models/Invoice.js";
import { stkPush } from "../utils/mpesa.js";
import { protectUser } from "../middleware/userAuth.js";
import { requireMpesaCallbackAllowed } from "../middleware/mpesaSecurity.js";
import { evaluateMpesaFraud } from "../services/mpesaFraudService.js";

const router = express.Router();

router.post("/stk-push", protectUser, async (req, res) => {
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

  res.json({ success: true, response });
});

router.post("/callback", requireMpesaCallbackAllowed, async (req, res) => {
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

  // Fraud detection
  await evaluateMpesaFraud(payment, data, ip);

  if (payment.status === "paid" && !payment.suspicious) {
    const receipt = data.CallbackMetadata.Item.find(i => i.Name === "MpesaReceiptNumber");
    payment.mpesaReceiptNumber = receipt?.Value || "";

    const sub = await TenantSubscription.findOne({ tenantId: payment.tenantId });
    if (sub) {
      sub.status = "active";
      sub.currentPeriodStart = new Date();
      sub.currentPeriodEnd = new Date(Date.now() + 30*24*60*60*1000);
      sub.nextInvoiceAt = sub.currentPeriodEnd;
      await sub.save();

      await Invoice.create({ tenantId: payment.tenantId, amount: payment.amount, status: "paid", paidAt: new Date() });
    }
  }

  await payment.save();

  console.log("M-Pesa callback processed:", {
    checkoutId: data.CheckoutRequestID,
    status: payment.status,
    suspicious: payment.suspicious,
  });

  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

export default router;
