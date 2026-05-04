const allowedProductionIps = (process.env.MPESA_ALLOWED_IPS || "")
  .split(",")
  .map((ip) => ip.trim())
  .filter(Boolean);

export const validateMpesaConfig = () => {
  const required = [
    "MPESA_ENV",
    "MPESA_CONSUMER_KEY",
    "MPESA_CONSUMER_SECRET",
    "MPESA_SHORTCODE",
    "MPESA_PASSKEY",
    "MPESA_CALLBACK_URL",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length) {
    throw new Error(`Missing M-Pesa env values: ${missing.join(", ")}`);
  }

  if (process.env.MPESA_ENV === "production" && !process.env.MPESA_CALLBACK_URL.startsWith("https://")) {
    throw new Error("Production M-Pesa callback URL must use HTTPS.");
  }
};

export const requireMpesaCallbackAllowed = (req, res, next) => {
  if (process.env.MPESA_ENV !== "production") return next();

  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip;

  if (allowedProductionIps.length && !allowedProductionIps.includes(ip)) {
    return res.status(403).json({ ResultCode: 1, ResultDesc: "Callback IP not allowed" });
  }

  next();
};
