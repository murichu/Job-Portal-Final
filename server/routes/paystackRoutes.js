import express from "express";
import {
  handlePaystackWebhook,
  initializePaystackPayment,
  verifyPaystackPayment,
} from "../controllers/paystackController.js";

const router = express.Router();

router.post("/initialize", initializePaystackPayment);
router.get("/verify/:reference", verifyPaystackPayment);

// Webhook endpoint (IMPORTANT)
router.post("/webhook", express.raw({ type: "application/json" }), handlePaystackWebhook);

export default router;
