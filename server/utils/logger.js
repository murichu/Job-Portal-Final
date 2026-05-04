import fs from "fs";
import path from "path";
import pino from "pino";

const logsDir = path.resolve("logs");

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, "app.log");

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || "info",
    base: {
      service: "job-portal-api",
      env: process.env.NODE_ENV || "development",
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  pino.destination({ dest: logFile, sync: false })
);

export const readRecentLogs = ({ limit = 200, level, search } = {}) => {
  if (!fs.existsSync(logFile)) return [];

  const raw = fs.readFileSync(logFile, "utf8").trim();
  if (!raw) return [];

  return raw
    .split("\n")
    .slice(-Math.max(Number(limit) * 3, Number(limit)))
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return { msg: line, level: "unknown" };
      }
    })
    .filter((entry) => {
      if (level && String(entry.level) !== String(level)) return false;
      if (search && !JSON.stringify(entry).toLowerCase().includes(String(search).toLowerCase())) return false;
      return true;
    })
    .slice(-Number(limit));
};

export default logger;
