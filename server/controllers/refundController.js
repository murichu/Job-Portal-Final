import RefundRequest from "../models/RefundRequest.js";

const canAccessRefund = (req, refundRequest) =>
  req.user.role === "super_admin" || String(refundRequest.tenantId) === String(req.user.tenantId);

const updateRefundStatus = async (req, res, status, defaultNotes) => {
  const request = await RefundRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ success: false, message: "Refund request not found" });

  if (!canAccessRefund(req, request)) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  request.status = status;
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  request.notes = req.body.notes || defaultNotes;
  await request.save();

  res.json({ success: true, request });
};

export const createRefundRequest = async (req, res) => {
  const { paymentId, amount, reason } = req.body;

  const request = await RefundRequest.create({
    paymentId,
    amount,
    reason,
    userId: req.user._id,
    tenantId: req.user.tenantId,
  });

  res.json({ success: true, request });
};

export const getRefundRequests = async (req, res) => {
  const filter = req.user.role === "super_admin" ? {} : { tenantId: req.user.tenantId };
  const requests = await RefundRequest.find(filter)
    .sort({ createdAt: -1 })
    .populate("paymentId userId", "phone amount status email name");
  res.json({ success: true, requests });
};

export const approveRefundRequest = async (req, res) => {
  await updateRefundStatus(req, res, "approved", "Approved for manual M-Pesa reversal processing.");
};

export const rejectRefundRequest = async (req, res) => {
  await updateRefundStatus(req, res, "rejected", "Rejected after review.");
};

export const markRefundProcessed = async (req, res) => {
  await updateRefundStatus(req, res, "processed", "Refund processed manually.");
};
