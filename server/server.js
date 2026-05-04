import "./config/instrument.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import * as Sentry from "@sentry/node";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import http from "http";

import { initSocket } from "./socket.js";
import { securityHeaders } from "./middleware/securityHeaders.js";

import connectDB from "./config/mongoDB.js";
import connectCloudinary from "./config/Cloudinary.js";

import companyRouter from "./routes/companyRoutes.js";
import jobRouter from "./routes/jobRoutes.js";
import userRouter from "./routes/userRouter.js";
import mpesaRoutes from "./routes/mpesaRoutes.js";
import billingRoutes from "./routes/billingRoutes.js";
import onboardingRoutes from "./routes/onboardingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
initSocket(server);

app.use(securityHeaders);
app.set("trust proxy", 1);

const allowedOrigins = [process.env.CLIENT_URL, "http://localhost:5173"];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("CORS blocked"));
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

await connectDB();
await connectCloudinary();

app.use("/api/user", userRouter);
app.use("/api/company", companyRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/mpesa", mpesaRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/super-admin", superAdminRoutes);

app.get("/", (req, res) => res.json({ success: true }));

Sentry.setupExpressErrorHandler(app);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
});
