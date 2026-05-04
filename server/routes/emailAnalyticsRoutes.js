import express from "express";
import EmailEvent from "../models/EmailEvent.js";
import { protectUser } from "../middleware/userAuth.js";

const router = express.Router();

router.get("/stats", protectUser, async (req, res) => {
  const total = await EmailEvent.countDocuments();
  const sent = await EmailEvent.countDocuments({ status: "sent" });
  const opened = await EmailEvent.countDocuments({ status: "opened" });
  const clicked = await EmailEvent.countDocuments({ status: "clicked" });
  const failed = await EmailEvent.countDocuments({ status: "failed" });

  res.json({ success: true, stats: { total, sent, opened, clicked, failed } });
});

export default router;
