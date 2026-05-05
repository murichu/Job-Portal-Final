import FileDownload from "../models/FileDownload.js";

export const getGlobalAnalytics = async (req, res) => {
  const total = await FileDownload.countDocuments({ status: "success" });

  const topUsers = await FileDownload.aggregate([
    { $match: { status: "success" } },
    { $group: { _id: "$ownerUserId", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  const suspiciousIPs = await FileDownload.aggregate([
    { $match: { status: "invalid" } },
    { $group: { _id: "$ipAddress", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  res.json({ success: true, total, topUsers, suspiciousIPs });
};
