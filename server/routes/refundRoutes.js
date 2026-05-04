import express from "express";
import RefundRequest from "../models/RefundRequest.js";
import { protectUser } from "../middleware/userAuth.js";

const router = express.Router();

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

router.get("/", protectUser, async (req, res) => {
  const requests = await RefundRequest.find({ tenantId: req.user.tenantId }).sort({ createdAt: -1 });
  res.json({ success: true, requests });
});

export default router;
