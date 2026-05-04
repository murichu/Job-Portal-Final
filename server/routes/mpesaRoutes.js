import express from "express";
import MpesaPayment from "../models/MpesaPayment.js";
import TenantSubscription from "../models/TenantSubscription.js";
import Invoice from "../models/Invoice.js";
import { stkPush } from "../utils/mpesa.js";
import { protectUser } from "../middleware/userAuth.js";
import { requireMpesaCallbackAllowed } from "../middleware/mpesaSecurity.js";

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
  const data = req.body.Body.stkCallback;

  const payment = await MpesaPayment.findOne({ checkoutRequestId: data.CheckoutRequestID });
  if (!payment) return res.sendStatus(404);

  payment.status = data.ResultCode === 0 ? "paid" : "failed";
  payment.resultCode = data.ResultCode;
  payment.resultDesc = data.ResultDesc;
  payment.rawCallback = data;

  if (data.ResultCode === 0) {
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

  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

export default router;
