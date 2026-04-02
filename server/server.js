import "./config/instrument.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import * as Sentry from "@sentry/node";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import connectDB from "./config/mongoDB.js";
import connectCloudinary from "./config/Cloudinary.js";

import companyRouter from "./routes/companyRoutes.js";
import jobRouter from "./routes/jobRoutes.js";
import userRouter from "./routes/userRouter.js";

// Load env
dotenv.config();

// Init app
const app = express();

// ✅ Trust proxy (important for Codesandbox / deployment)
app.set("trust proxy", 1);

// ================= CORS (FIXED) =================
app.use(
  cors({
    origin: true, // allow all (fixes Codesandbox dynamic URLs)
    credentials: true,
  })
);

// ✅ Handle preflight requests
app.options("*", cors());

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(cookieParser());

// ================= RATE LIMIT (SAFE) =================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, try again later.",
  },
});

// Skip limiter for OPTIONS (preflight)
app.use((req, res, next) => {
  if (req.method === "OPTIONS") return next();
  limiter(req, res, next);
});

// ================= CONNECT SERVICES =================
await connectDB();
await connectCloudinary();

// ================= ROUTES =================
app.use("/api/user", userRouter);
app.use("/api/company", companyRouter);
app.use("/api/jobs", jobRouter);

// ================= TEST ROUTES =================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Job Portal API is running 🚀",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
  });
});

// Sentry test
app.get("/debug-sentry", (req, res) => {
  throw new Error("Sentry test error");
});

// ================= 404 HANDLER =================
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ================= SENTRY ERROR HANDLER =================
Sentry.setupExpressErrorHandler(app);

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
