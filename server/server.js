import express from "express";
import cors from "cors";
import dotenv from "dotenv";
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
import paystackRoutes from "./routes/paystackRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import financeAdminRoutes from "./routes/financeAdminRoutes.js";
import financeReports from "./routes/financeReports.js";
import taxExportRoutes from "./routes/taxExportRoutes.js";
import refundRoutes from "./routes/refundRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import monitorRoutes from "./routes/monitorRoutes.js";
import incidentRoutes from "./routes/incidentRoutes.js";
import logRoutes from "./routes/logRoutes.js";
import emailAnalyticsRoutes from "./routes/emailAnalyticsRoutes.js";
import emailPreferenceRoutes from "./routes/emailPreferenceRoutes.js";
import insightRoutes from "./routes/insightRoutes.js";
import tenantAnalyticsRoutes from "./routes/tenantAnalyticsRoutes.js";
import campaignRoutes from "./routes/campaignRoutes.js";
import billingAnalyticsRoutes from "./routes/billingAnalytics.js";

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
app.use("/api/paystack", paystackRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin/finance", financeAdminRoutes);
app.use("/api/finance", financeReports);
app.use("/api", taxExportRoutes);
app.use("/api/refund", refundRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/monitor", monitorRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/email-analytics", emailAnalyticsRoutes);
app.use("/api/email", emailPreferenceRoutes);
app.use("/api/insights", insightRoutes);
app.use("/api/tenant-analytics", tenantAnalyticsRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/billing-analytics", billingAnalyticsRoutes);

app.get("/", (req, res) => res.json({ success: true }));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
});
