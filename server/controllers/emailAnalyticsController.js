import EmailEvent from "../models/EmailEvent.js";

export const getEmailStats = async (req, res) => {
  const total = await EmailEvent.countDocuments();
  const sent = await EmailEvent.countDocuments({ status: "sent" });
  const opened = await EmailEvent.countDocuments({ status: "opened" });
  const clicked = await EmailEvent.countDocuments({ status: "clicked" });
  const failed = await EmailEvent.countDocuments({ status: "failed" });

  res.json({ success: true, stats: { total, sent, opened, clicked, failed } });
};
