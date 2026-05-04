import MpesaPayment from "../models/MpesaPayment.js";

export const evaluateMpesaFraud = async (payment, callbackData, ip) => {
  let suspicious = false;
  let reason = [];

  // 1. Amount mismatch
  const amountItem = callbackData.CallbackMetadata?.Item.find(i => i.Name === "Amount");
  const paidAmount = amountItem?.Value;

  if (paidAmount && Number(paidAmount) !== Number(payment.amount)) {
    suspicious = true;
    reason.push("Amount mismatch");
  }

  // 2. Rapid repeat transactions
  const recent = await MpesaPayment.countDocuments({
    phone: payment.phone,
    createdAt: { $gte: new Date(Date.now() - 60 * 1000) }
  });

  if (recent > 5) {
    suspicious = true;
    reason.push("Too many attempts in short time");
  }

  // 3. Unknown callback IP (already filtered, but double-check)
  if (!ip) {
    suspicious = true;
    reason.push("Missing IP");
  }

  if (suspicious) {
    payment.suspicious = true;
    payment.fraudReason = reason.join(", ");
    payment.status = "flagged";
  }

  return payment;
};
