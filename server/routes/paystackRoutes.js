import express from "express";
import { initializePayment, verifyPayment } from "../services/paystackService.js";

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

export default router;
