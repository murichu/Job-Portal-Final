import express from "express";
import { initializePayment, verifyPayment, verifyPaystackSignature } from "../services/paystackService.js";

const router = express.Router();

router.post("/initialize", async (req, res) => {
  const { email, amount } = req.body;
  const data = await initializePayment({ email, amount });
  res.json({ success: true, data });
});

router.get("/verify/:reference", async (req, res) => {
  const data = await verifyPayment(req.params.reference);
  res.json({ success: true, data });
});

// Webhook endpoint (IMPORTANT)
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const signature = req.headers["x-paystack-signature"];

  if (!verifyPaystackSignature(req.body, signature)) {
    return res.status(401).send("Invalid signature");
  }

  const event = JSON.parse(req.body.toString());

  if (event.event === "charge.success") {
    // TODO: mark invoice as paid
    console.log("Payment success:", event.data.reference);
  }

  res.sendStatus(200);
});

export default router;
