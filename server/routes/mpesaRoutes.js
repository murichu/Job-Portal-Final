import express from "express";
import MpesaPayment from "../models/MpesaPayment.js";
import { stkPush } from "../utils/mpesa.js";
import { protectUser } from "../middleware/userAuth.js";

const router = express.Router();

// Initiate STK push
router.post("/stk-push", protectUser, async (req, res) => {
  const { phone, amount } = req.body;

  const response = await stkPush({
    phone,
    amount,
    accountReference: "Subscription",
  });

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

// Callback (Safaricom hits this)
router.post("/callback", async (req, res) => {
  const data = req.body.Body.stkCallback;

  const payment = await MpesaPayment.findOne({
    checkoutRequestId: data.CheckoutRequestID,
  });

  if (!payment) return res.sendStatus(404);

  payment.status = data.ResultCode === 0 ? "paid" : "failed";
  payment.resultCode = data.ResultCode;
  payment.resultDesc = data.ResultDesc;
  payment.rawCallback = data;

  if (data.ResultCode === 0) {
    const receipt = data.CallbackMetadata.Item.find(i => i.Name === "MpesaReceiptNumber");
    payment.mpesaReceiptNumber = receipt?.Value || "";
  }

  await payment.save();

  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

export default router;
