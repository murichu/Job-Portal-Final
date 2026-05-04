import express from "express";
import SystemAlert from "../models/SystemAlert.js";
import { protectUser } from "../middleware/userAuth.js";

const router = express.Router();

router.get("/alerts", protectUser, async (req, res) => {
  const alerts = await SystemAlert.find().sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, alerts });
});

export default router;
