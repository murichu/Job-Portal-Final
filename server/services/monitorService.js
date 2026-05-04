import os from "os";
import SystemAlert from "../models/SystemAlert.js";
import { logger } from "../utils/logger.js";

export const checkSystemHealth = async () => {
  const memoryUsage = process.memoryUsage().rss / 1024 / 1024;
  const cpuLoad = os.loadavg()[0];

  if (memoryUsage > 500) {
    await createAlert("memory", "high", `High memory usage: ${memoryUsage.toFixed(2)} MB`);
  }

  if (cpuLoad > 2) {
    await createAlert("cpu", "high", `High CPU load: ${cpuLoad}`);
  }
};

export const detectAnomalies = async (payments) => {
  const highAmount = payments.filter(p => p.amount > 100000);

  if (highAmount.length > 0) {
    await createAlert("fraud", "critical", "High-value transactions detected", { count: highAmount.length });
  }
};

export const createAlert = async (type, severity, message, metadata = {}) => {
  const alert = await SystemAlert.create({ type, severity, message, metadata });

  logger.warn({ type, severity, message });

  if (global.io) {
    global.io.emit("alert", { type, severity, message });
  }

  return alert;
};
