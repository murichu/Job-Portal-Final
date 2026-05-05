import { readRecentLogs } from "../utils/logger.js";

export const getLogs = (req, res) => {
  const { limit = 200, level, search } = req.query;
  const logs = readRecentLogs({ limit, level, search });
  res.json({ success: true, logs });
};
