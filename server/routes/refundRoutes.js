import express from "express";
import { protectUser } from "../middleware/userAuth.js";
import {
  approveRefundRequest,
  createRefundRequest,
  getRefundRequests,
  markRefundProcessed,
  rejectRefundRequest,
} from "../controllers/refundController.js";

const router = express.Router();

const requireFinanceAdmin = (req, res, next) => {
  if (!["admin", "super_admin"].includes(req.user?.role)) {
    return res.status(403).json({ success: false, message: "Finance admin only" });
  }
  next();
};

router.post("/request", protectUser, createRefundRequest);
router.get("/", protectUser, requireFinanceAdmin, getRefundRequests);
router.patch("/:id/approve", protectUser, requireFinanceAdmin, approveRefundRequest);
router.patch("/:id/reject", protectUser, requireFinanceAdmin, rejectRefundRequest);
router.patch("/:id/mark-processed", protectUser, requireFinanceAdmin, markRefundProcessed);

export default router;
