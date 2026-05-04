import express from "express";
import Invoice from "../models/Invoice.js";

const router = express.Router();

router.get("/analytics", async (req, res) => {
  const revenue = await Invoice.aggregate([
    { $match: { status: "paid" } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);

  const monthly = await Invoice.aggregate([
    { $match: { status: "paid" } },
    {
      $group: {
        _id: { month: { $month: "$createdAt" } },
        total: { $sum: "$amount" }
      }
    }
  ]);

  res.json({ success: true, revenue, monthly });
});

export default router;
