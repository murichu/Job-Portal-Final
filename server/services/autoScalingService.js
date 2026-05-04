import os from "os";
import ScalingEvent from "../models/ScalingEvent.js";
import { logger } from "../utils/logger.js";

const CPU_THRESHOLD = 2.0;
const MEMORY_THRESHOLD_MB = 500;

export const evaluateScaling = async () => {
  const cpu = os.loadavg()[0];
  const memory = process.memoryUsage().rss / 1024 / 1024;

  if (cpu > CPU_THRESHOLD) {
    await createScalingEvent("cpu", "scale_up", cpu, CPU_THRESHOLD, "High CPU usage — consider scaling up instances");
  } else if (cpu < 0.5) {
    await createScalingEvent("cpu", "scale_down", cpu, 0.5, "Low CPU usage — consider scaling down");
  }

  if (memory > MEMORY_THRESHOLD_MB) {
    await createScalingEvent("memory", "scale_up", memory, MEMORY_THRESHOLD_MB, "High memory usage — consider scaling up");
  }
};

const createScalingEvent = async (metric, direction, value, threshold, message) => {
  const event = await ScalingEvent.create({
    metric,
    direction,
    value,
    threshold,
    message,
  });

  logger.warn({ metric, direction, value, threshold });

  if (global.io) {
    global.io.emit("scaling", event);
  }

  return event;
};
