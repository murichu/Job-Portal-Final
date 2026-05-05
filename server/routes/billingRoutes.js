import express from "express";
import { protectUser } from "../middleware/userAuth.js";
import {
  downloadInvoicePdf,
  emailInvoice,
  getInvoices,
  getPaymentHistory,
  getSubscription,
  requestRefund,
} from "../controllers/billingController.js";

const router = express.Router();

router.get("/subscription", protectUser, getSubscription);
router.get("/invoices", protectUser, getInvoices);
router.get("/history", protectUser, getPaymentHistory);
router.post("/refund", protectUser, requestRefund);
router.get("/invoice/:id/pdf", protectUser, downloadInvoicePdf);
router.post("/invoice/:id/email", protectUser, emailInvoice);

export default router;
