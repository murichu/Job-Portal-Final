import express from "express";
import RefundRequest from "../models/RefundRequest.js";
import { protectUser } from "../middleware/userAuth.js";

const router = express.Router();

const requireFinanceAdmin = (req, res, next) => {
  if (!["admin", "super_admin"].includes(req.user?.role)) {
    return res.status(403).json({ success: false, message: "Finance admin only" });
  }
  next();
};

router.post("/request", protectUser, async (req, res) => {
  const { paymentId, amount, reason } = req.body;

  const request = await RefundRequest.create({
    paymentId,
    amount,
    reason,
    userId: req.user._id,
    tenantId: req.user.tenantId,
  });

  res.json({ success: true, request });
});

router.get("/", protectUser, requireFinanceAdmin, async (req, res) => {
  const filter = req.user.role === "super_admin" ? {} : { tenantId: req.user.tenantId };
  const requests = await RefundRequest.find(filter).sort({ createdAt: -1 }).populate("paymentId userId", "phone amount status email name");
  res.json({ success: true, requests });
});

router.patch("/:id/approve", protectUser, requireFinanceAdmin, async (req, res) => {
  const request = await RefundRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ success: false, message: "Refund request not found" });

  if (req.user.role !== "super_admin" && String(request.tenantId) !== String(req.user.tenantId)) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  request.status = "approved";
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  request.notes = req.body.notes || "Approved for manual M-Pesa reversal processing.";
  await request.save();

  res.json({ success: true, request });
});

router.patch("/:id/reject", protectUser, requireFinanceAdmin, async (req, res) => {
  const request = await RefundRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ success: false, message: "Refund request not found" });

  if (req.user.role !== "super_admin" && String(request.tenantId) !== String(req.user.tenantId)) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  request.status = "rejected";
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  request.notes = req.body.notes || "Rejected after review.";
  await request.save();

  res.json({ success: true, request });
});

router.patch("/:id/mark-processed", protectUser, requireFinanceAdmin, async (req, res) => {
  const request = await RefundRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ success: false, message: "Refund request not found" });

  if (req.user.role !== "super_admin" && String(request.tenantId) !== String(req.user.tenantId)) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  request.status = "processed";
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  request.notes = req.body.notes || "Refund processed manually.";
  await request.save();

  res.json({ success: true, request });
});

export default router;
