import SystemAlert from "../models/SystemAlert.js";

export const getAlerts = async (req, res) => {
  const alerts = await SystemAlert.find().sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, alerts });
};
