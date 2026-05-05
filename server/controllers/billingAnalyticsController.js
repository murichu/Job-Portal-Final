import Invoice from "../models/Invoice.js";

export const getBillingAnalytics = async (req, res) => {
  const revenue = await Invoice.aggregate([
    { $match: { status: "paid" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const monthly = await Invoice.aggregate([
    { $match: { status: "paid" } },
    {
      $group: {
        _id: { month: { $month: "$createdAt" } },
        total: { $sum: "$amount" },
      },
    },
  ]);

  res.json({ success: true, revenue, monthly });
};
