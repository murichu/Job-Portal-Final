import express from "express";
import TenantSubscription from "../models/TenantSubscription.js";
import Invoice from "../models/Invoice.js";
import MpesaPayment from "../models/MpesaPayment.js";
import RefundRequest from "../models/RefundRequest.js";
import { protectUser } from "../middleware/userAuth.js";
import { generateInvoicePDF } from "../services/pdfService.js";
import { sendEmail } from "../services/emailService.js";
import { invoicePaidTemplate } from "../templates/emailTemplates.js";

const router = express.Router();

router.get("/subscription", protectUser, async (req, res) => {
  const sub = await TenantSubscription.findOne({ tenantId: req.user.tenantId });
  res.json({ success: true, sub, subscription: sub });
});

router.get("/invoices", protectUser, async (req, res) => {
  const invoices = await Invoice.find({ tenantId: req.user.tenantId }).sort({ createdAt: -1 });
  res.json({ success: true, invoices });
});

router.get("/history", protectUser, async (req, res) => {
  const payments = await MpesaPayment.find({ tenantId: req.user.tenantId }).sort({ createdAt: -1 });
  res.json({ success: true, payments });
});

router.post("/refund", protectUser, async (req, res) => {
  const { invoiceId, paymentId, amount, reason = "Customer requested refund" } = req.body;

  const invoice = invoiceId ? await Invoice.findOne({ _id: invoiceId, tenantId: req.user.tenantId }) : null;

  const request = await RefundRequest.create({
    paymentId: paymentId || null,
    tenantId: req.user.tenantId,
    userId: req.user._id,
    amount: amount || invoice?.amount || 0,
    reason,
  });

  res.json({ success: true, request });
});

router.get("/invoice/:id/pdf", protectUser, async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
  if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });

  const pdf = await generateInvoicePDF(invoice);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=invoice-${invoice._id}.pdf`);
  res.send(pdf);
});

router.post("/invoice/:id/email", protectUser, async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
  if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });

  const pdf = await generateInvoicePDF(invoice);
  const template = invoicePaidTemplate({ amount: invoice.amount });

  await sendEmail({
    to: req.user.email,
    subject: template.subject,
    html: template.html,
    attachments: [{ filename: `invoice-${invoice._id}.pdf`, content: pdf }],
  });

  res.json({ success: true, message: "Invoice emailed" });
});

export default router;
